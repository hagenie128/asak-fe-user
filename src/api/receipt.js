import { API_ENDPOINTS } from "../constants/api";
import { apiClient, unwrapResponse } from "./client";

/**
 * 영수증 출력/ 결과값 api
 *
 * 영수증 출력을 원할 시 -> 백엔드로부터 보내는 request
 *
 * [영수증 출력시 — PRINT_RECEIPT_TEXT]
    {
      "eventType": "PRINT_RECEIPT_TEXT",
      "payload": "영수증 전체 텍스트(ASCII)",
      "requestId": "..."
    }
 *
  [주문 번호 출력시]

    {
    "requestId": "waiting-number-364-550e8400-e29b-41d4-a716-446655440000"
  }
 *

  payload --> RTOS가 실제 출력할 영수증 내용
 */

//영수증 출력 — RTOS handle_print_receipt_text(전체 텍스트)와 맞춤. Admin printReceipt와 동일.
export const requestReceiptPrint = ({ orderId, receiptPayload }) =>
  apiClient.post(API_ENDPOINTS.orderReceipt(orderId), {
    eventType: "PRINT_RECEIPT_TEXT",
    payload: receiptPayload,
    requestId: crypto.randomUUID(),
  }).then(unwrapResponse);

//주문 번호 출력
export const requestWaitingNumberPrint  = ({orderId}) => (
  apiClient.post(API_ENDPOINTS.orderNoReceipt(orderId), {
    requestId : crypto.randomUUID(),
  })
).then(unwrapResponse);

//출력 성공 유무
export const getDeviceEvent = (eventId) => (
  apiClient.get(API_ENDPOINTS.deviceEvent(eventId))).then(unwrapResponse);

/** PENDING/PROCESSING이면 intervalMs 간격으로 재조회. COMPLETED/FAILED 또는 maxAttempts 후 반환 */
export async function waitForDeviceEvent(
  eventId,
  { intervalMs = 1000, maxAttempts = 15 } = {},
) {
  let lastEvent;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    lastEvent = await getDeviceEvent(eventId);
    if (lastEvent?.status === "COMPLETED" || lastEvent?.status === "FAILED") {
      return lastEvent;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return lastEvent;
}
