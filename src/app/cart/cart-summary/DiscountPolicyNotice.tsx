"use client";

export default function DiscountPolicyNotice({ error, retry }: { error: boolean; retry: () => void }) {
  return (
    <div role="status" aria-live="polite">
      <p>{error
        ? "Не удалось проверить условия скидок. Попробуйте ещё раз; если товар больше недоступен, удалите его из корзины."
        : "Проверяем условия скидок…"}</p>
      {error && <button type="button" onClick={retry}>Повторить проверку</button>}
    </div>
  );
}
