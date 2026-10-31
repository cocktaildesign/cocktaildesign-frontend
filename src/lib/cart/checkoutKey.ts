import { useCartStore } from './cartStore';

// Persist only the opaque request key, never the buyer's contact details.
// Do not rotate on timeouts or form edits: the server may already have accepted the order.
export async function getCheckoutKey(preferred?: string): Promise<string> {
  const acquire = () => {
    const state = useCartStore.getState();
    if (state.checkoutKey) return state.checkoutKey;
    let savedKey = '';
    try {
      const saved = JSON.parse(localStorage.getItem('cocktaildesign:cart') || '{}').state;
      const identity = (items: typeof state.items) => JSON.stringify(items.map(item => [item.code, item.quantity, item.engraving]));
      if (saved?.items && identity(saved.items) === identity(state.items) && typeof saved.checkoutKey === 'string') savedKey = saved.checkoutKey;
    } catch { /* Blocked browser storage still allows safe retries during this page session. */ }
    const key = preferred || savedKey || crypto.randomUUID();
    useCartStore.setState({ checkoutKey: key });
    return key;
  };
  return typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('cocktaildesign:checkout-key', acquire) : acquire();
}
