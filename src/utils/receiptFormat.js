import { formatCurrency } from "./currency.js";
import { formatDateTime } from "./date.js";
import { priceCalculation } from "./priceCalculation.js";

const PAYMENT_STATUS_LABEL = {
  APPROVED: "결제완료",
  READY: "결제대기",
  FAILED: "결제실패",
};

const PAYMENT_METHOD_LABEL = {
  CARD: "카드 / 삼성페이 결제",
  KAKAO_PAY: "카카오페이 결제",
  NAVER_PAY: "네이버페이 결제",
  TOSS_PAY: "토스페이 결제",
};

function formatPaymentMethodLabel(selectedMethod, paymentMethodCode) {
  if (selectedMethod?.methodName) return selectedMethod.methodName;
  if (paymentMethodCode) {
    return PAYMENT_METHOD_LABEL[paymentMethodCode] ?? paymentMethodCode;
  }
  return "-";
}

/**
 * 키오스크 세션(cart + payment)으로 RTOS/프린터용 ASCII 영수증 본문 생성.
 * Admin buildReceiptText와 동일한 40칸 레이아웃을 맞춘다.
 */
export function buildReceiptText({ payment, items = [], selectedPaymentMethod }) {
  const lines = [];
  const W = 40;
  const rule = "-".repeat(W);
  const totalAmount =
    payment?.approvedAmount ??
    items.reduce(
      (sum, item) =>
        sum +
        priceCalculation({
          unitPrice: item.unitPrice,
          optionItems: item.optionItems,
          quantity: item.quantity,
        }),
      0,
    );

  lines.push(`+${"-".repeat(W - 2)}+`);
  lines.push(" ASAK RECEIPT".padEnd(W));
  lines.push(`+${"-".repeat(W - 2)}+`);
  lines.push(`주문번호: ${payment?.orderNo ?? "-"}`);
  lines.push(`주문일시: ${formatDateTime(payment?.approvedAt ?? new Date())}`);
  lines.push(
    `결제상태: ${PAYMENT_STATUS_LABEL[payment?.paymentStatus] ?? payment?.paymentStatus ?? "-"}`,
  );
  lines.push(
    `결제수단: ${formatPaymentMethodLabel(selectedPaymentMethod, payment?.paymentMethodCode)}`,
  );
  lines.push(`결제금액: ${formatCurrency(totalAmount)}`);
  lines.push(rule);

  for (const item of items) {
    const lineAmount = priceCalculation({
      unitPrice: item.unitPrice,
      optionItems: item.optionItems,
      quantity: item.quantity,
    });
    lines.push(`${item.menuName} x${item.quantity}  ${formatCurrency(lineAmount)}`);
    for (const opt of item.optionItems ?? []) {
      const optPrice = Number(opt.extraPrice ?? opt.price ?? 0);
      if (optPrice > 0) {
        lines.push(`  + ${opt.name}  ${formatCurrency(optPrice)}`);
      } else if (opt.name) {
        lines.push(`  + ${opt.name}`);
      }
    }
  }

  lines.push(rule);
  lines.push("요청사항: 없음");
  lines.push(rule);
  lines.push(`총 결제 금액: ${formatCurrency(totalAmount)}`);
  lines.push(`+${"-".repeat(W - 2)}+`);

  return lines.join("\n");
}
