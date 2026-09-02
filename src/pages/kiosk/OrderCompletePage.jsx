// SCR-008 / Order Complete — Figma 134:7926 (WBS2-028)
// Props: orderNo, toastMessage?, toastTone?

import Header from "@/components/common/Header";
import ticketShape from "@/assets/figma/order-complete-ticket.svg";
import asakSLogo from "@/assets/svg/logo-S.svg";
import barcodeMark from "@/assets/figma/order-complete-barcode.svg";
import Footer from "@/components/common/Footer";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import {
  requestReceiptPrint,
  requestWaitingNumberPrint,
  waitForDeviceEvent,
} from "@/api/receipt";
import { buildReceiptText } from "@/utils/receiptFormat";
import KioskToast from "@/components/kiosk/KioskToast";

export default function OrderCompletePage() {
  const [countdown, setCountdown] = useState(5);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastTone, setToastTone] = useState("success");
  const [printPending, setPrintPending] = useState(false);
  const navigate = useNavigate();
  const payment = useCartStore((state) => state.payment);
  const items = useCartStore((state) => state.items);
  const selectedPaymentMethod = useCartStore((state) => state.selectedPaymentMethod);
  const resetSession = useCartStore((state) => state.resetSession);

  const receiptPayload = useMemo(
    () =>
      buildReceiptText({
        payment,
        items,
        selectedPaymentMethod,
      }),
    [payment, items, selectedPaymentMethod],
  );

  const canPrint = payment.paymentStatus === "APPROVED" && payment.orderId != null;

  useEffect(() => {
    if (countdown <= 0) {
      resetSession();
      navigate("/");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate, resetSession]);

  const handleDeviceEventResult = (deviceEvent) => {
    const { eventType, status } = deviceEvent ?? {};

    if (status === "COMPLETED") {
      setToastTone("success");
      if (eventType === "PRINT_RECEIPT" || eventType === "PRINT_RECEIPT_TEXT") {
        setToastMessage("영수증 출력 완료");
        return;
      }
      if (eventType === "PRINT_WAITING_NUMBER") {
        setToastMessage("주문 번호 출력 완료");
      }
      return;
    }

    if (status === "FAILED") {
      setToastTone("error");
      if (eventType === "PRINT_RECEIPT" || eventType === "PRINT_RECEIPT_TEXT") {
        setToastMessage("영수증 출력에 실패했습니다.");
        return;
      }
      if (eventType === "PRINT_WAITING_NUMBER") {
        setToastMessage("주문번호 출력에 실패했습니다.");
      }
      return;
    }

    setToastTone("success");
    if (eventType === "PRINT_RECEIPT" || eventType === "PRINT_RECEIPT_TEXT") {
      setToastMessage("영수증 출력을 요청했습니다.");
      return;
    }
    if (eventType === "PRINT_WAITING_NUMBER") {
      setToastMessage("주문 번호 출력을 요청했습니다.");
    }
  };

  const handleReceiptPrint = async () => {
    if (!canPrint || printPending) return;

    try {
      setPrintPending(true);
      setToastMessage(null);

      const printResponse = await requestReceiptPrint({
        orderId: payment.orderId,
        receiptPayload,
      });

      const deviceEvent = await waitForDeviceEvent(printResponse.eventId);
      handleDeviceEventResult(deviceEvent);
    } catch {
      setToastTone("error");
      setToastMessage("영수증 출력 요청을 실패했습니다.");
    } finally {
      setPrintPending(false);
    }
  };

  const handleWaitingNumberPrint = async () => {
    if (!canPrint || printPending) return;

    try {
      setPrintPending(true);
      setToastMessage(null);

      const printResponse = await requestWaitingNumberPrint({
        orderId: payment.orderId,
      });

      const deviceEvent = await waitForDeviceEvent(printResponse.eventId);
      handleDeviceEventResult(deviceEvent);
    } catch {
      setToastTone("error");
      setToastMessage("주문번호 출력 요청을 실패했습니다.");
    } finally {
      setPrintPending(false);
    }
  };

  return (
    <>
      <Header />
      <div className="kiosk-step-indicator" aria-label="주문 4단계 중 완료">
        <span className="is-done" />
        <span className="is-done" />
        <span className="is-done" />
        <span className="is-current" />
      </div>

      <main className="page_content_emptyArea order_complete_contents">
        <h1>주문이 완료되었습니다!</h1>

        <p className="order-complete-page__label">주문 대기번호</p>
        {/* API-006 waitingOrderNo — orders.waiting_order_no (일별 고정 번호). waitingOrderCount 아님 */}
        <p className="order-complete-page__order-no">
          {payment.paymentStatus === "APPROVED" ? payment.waitingOrderNo : "-"}
        </p>

        <div className="order-complete-page__ticket" aria-hidden="true">
          <i className="order-complete-page__rail" />
          <div className="order-complete-page__ticket-body">
            <img className="order-complete-page__ticket-shape" src={ticketShape} alt="" />
            <img className="order-complete-page__ticket-logo" src={asakSLogo} alt="" />
            <img className="order-complete-page__barcode" src={barcodeMark} alt="" />
          </div>
        </div>

        <p className="order-complete-page__hint">
          영수증이 필요하신 경우 하단 출력 버튼을 눌러주세요
        </p>
        <p className="order-complete-page__return">
          <span>{countdown}</span> 초 후 초기화면으로 돌아갑니다
        </p>
      </main>

      {toastMessage ? <KioskToast message={toastMessage} tone={toastTone} /> : null}

      <Footer
        leftText="주문 번호만 출력"
        rightText="영수증 출력"
        onLeftClick={handleWaitingNumberPrint}
        onRightClick={handleReceiptPrint}
        leftDisabled={!canPrint || printPending}
        rightDisabled={!canPrint || printPending}
      />
    </>
  );
}
