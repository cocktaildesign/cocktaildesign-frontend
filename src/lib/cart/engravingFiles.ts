"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CART_API_BASE } from "./discountPolicy";
import { useCartStore } from "./cartStore";

export type EngravingFile = { id: string; name: string; size: number; status: "uploading" | "ready" | "error"; error?: string };
type State = {
  token: string; files: EngravingFile[]; note: string; orderKey: string; hydrated: boolean;
  setNote: (note: string) => void; reset: () => void;
};
export const useEngravingFiles = create<State>()(persist((set) => ({
  token: "", files: [], note: "", orderKey: "", hydrated: false,
  setNote: note => set({ note: note.slice(0, 500) }),
  reset: () => set({ token: "", files: [], note: "", orderKey: "" }),
}), {
  name: "cocktaildesign:engraving-files", storage: createJSONStorage(() => localStorage),
  partialize: ({ token, files, note, orderKey }) => ({ token, files, note, orderKey }),
  onRehydrateStorage: () => state => {
    if (!state) return;
    // A browser reload cannot resume the file stream. Reconcile with the server below.
    state.files = state.files.map(file => file.status === "uploading" ? { ...file, status: "error", error: "Загрузка была прервана. Проверьте файл или выберите его снова." } : file);
    state.hydrated = true;
  },
}));

useCartStore.subscribe((state, before) => {
  if (before.items.length > 0 && state.items.length === 0) useEngravingFiles.getState().reset();
});

const messages: Record<string, string> = {
  storage_full: "Загрузка временно недоступна. Можно оформить заказ без файла и передать макет менеджеру.",
  uploads_unavailable: "Не удалось загрузить файл. Попробуйте ещё раз или передайте макет менеджеру после заказа.",
  unsupported_file: "Выберите JPG, PNG, PDF или SVG.",
  invalid_file: "Не удалось прочитать файл. Попробуйте сохранить его заново или выберите другой формат.",
  unsafe_svg: "Этот SVG содержит неподдерживаемые элементы. Сохраните простой SVG без стилей и внешних ссылок либо прикрепите PDF.",
  file_too_large: "Размер файла должен быть не больше 10 МБ.",
  upload_rate_limit: "Слишком много загрузок. Попробуйте позже или передайте макет менеджеру.",
  upload_busy: "Загрузка занята. Попробуйте ещё раз через минуту.",
};
const fileError = (code: string) => messages[code] || messages.uploads_unavailable;
const pending = new Map<string, AbortController>();
export function cancelEngravingFile(id: string) {
  pending.get(id)?.abort();
  useEngravingFiles.setState(state => ({ files: state.files.filter(file => file.id !== id) }));
}
function update(id: string, patch: Partial<EngravingFile>, token: string) {
  if (useEngravingFiles.getState().token !== token) return;
  useEngravingFiles.setState(state => ({ files: state.files.map(file => file.id === id ? { ...file, ...patch } : file) }));
}
export function uploadEngravingFile(file: File): string | null {
  const before = useEngravingFiles.getState();
  if (before.files.length >= 3) return "Можно прикрепить до 3 файлов. Удалите лишний, чтобы добавить новый.";
  if (!/\.(jpe?g|png|pdf|svg)$/i.test(file.name)) return fileError("unsupported_file");
  if (!file.size || file.size > 10 * 1024 * 1024) return fileError("file_too_large");
  if (file.name.length > 120 || /[\x00-\x1f\\/:<>"|?*]/.test(file.name)) return "Сократите название файла и уберите специальные символы.";
  const token = before.token || Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
  const id = crypto.randomUUID();
  useEngravingFiles.setState({ token, files: [...before.files, { id, name: file.name, size: file.size, status: "uploading" }] });
  void (async () => {
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 185000);
    pending.set(id, controller);
    try {
      const response = await fetch(`${CART_API_BASE}/engraving-files/${id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/octet-stream", "X-File-Name": encodeURIComponent(file.name), "X-File-Size": String(file.size) },
        body: file, signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || !data.ok || data.file?.id !== id) throw Error(data.error || "uploads_unavailable");
      update(id, { status: "ready", error: undefined }, token);
    } catch (error) { update(id, { status: "error", error: fileError(error instanceof Error ? error.message : "") }, token); }
    finally { clearTimeout(timeout); pending.delete(id); }
  })();
  return null;
}
export async function reconcileEngravingFiles(): Promise<boolean> {
  const { token, files } = useEngravingFiles.getState();
  if (!files.length) return true;
  if (files.some(file => file.status === "uploading")) return false;
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${CART_API_BASE}/engraving-files`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal });
    const data = await response.json();
    if (!response.ok || !data.ok || !Array.isArray(data.files)) throw Error();
    let ready = true;
    for (const file of files) {
      const row = data.files.find((row: { id: string; size: number }) => row.id === file.id && row.size === file.size);
      const exists = row && (!row.expiresAt || row.expiresAt > Date.now());
      update(file.id, exists ? { status: "ready", error: undefined } : { status: "error", error: "Файл не сохранён или срок хранения истёк. Выберите его снова либо продолжите без него." }, token);
      if (!exists) ready = false;
    }
    return ready;
  } catch {
    // Preserve files on temporary network errors. Checkout retries; never silently omits them.
    return false;
  } finally { clearTimeout(timeout); }
}
export async function removeEngravingFile(id: string): Promise<boolean> {
  const { token, files } = useEngravingFiles.getState();
  const file = files.find(file => file.id === id);
  if (!file || file.status === "uploading") return false;
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${CART_API_BASE}/engraving-files/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
    if (!response.ok && file.status !== "error") return false;
  } catch { if (file.status !== "error") return false; }
  finally { clearTimeout(timeout); }
  // Removing an uncertain failed upload is an explicit choice to continue without it.
  // An unbound server copy, if any, expires automatically.
  if (useEngravingFiles.getState().token === token) useEngravingFiles.setState(state => ({ files: state.files.filter(file => file.id !== id) }));
  return true;
}
