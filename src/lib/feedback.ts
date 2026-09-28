import { getStrapiUrl } from "./api/strapi/client";

export type FeedbackPayload = { requestId: string; message: string; email: string; page: string };

export async function sendFeedback(payload: FeedbackPayload): Promise<void> {
  let response: Response;
  try {
    response = await fetch(new URL("/api/feedback", getStrapiUrl()), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(15_000),
      cache: "no-store", credentials: "omit",
    });
  } catch {
    throw new Error("Не удалось получить подтверждение. Проверьте соединение и попробуйте ещё раз — текст сохранён в форме.");
  }
  const body = await response.json().catch(() => null);
  if (response.ok && body?.ok === true && body.requestId === payload.requestId) return;
  if (response.status === 429) throw new Error("Слишком много обращений подряд. Подождите 10 минут и попробуйте ещё раз.");
  throw new Error("Не удалось отправить сообщение. Попробуйте ещё раз или напишите нам на Cocktaildesign@yandex.ru.");
}
