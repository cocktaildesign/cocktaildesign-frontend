"use client";

import { useEffect, useRef, useState } from "react";

export type SearchPage<T> = { items: T[]; total: number; nextOffset: number; hasMore: boolean; revision: string };
type Loader<T> = (query: string, offset: number, revision: string, signal: AbortSignal) => Promise<SearchPage<T>>;
const empty = { items: [], total: 0, nextOffset: 0, hasMore: false, revision: "" };

export function usePagedSearch<T extends { id: string }>(query: string, open: boolean, load: Loader<T>) {
  const q = query.trim();
  const [refresh, setRefresh] = useState(0);
  const [state, setState] = useState<SearchPage<T> & { query: string; loading: boolean; more: boolean; error: string; changed: boolean }>({
    ...empty, query: "", loading: false, more: false, error: "", changed: false,
  });
  const generation = useRef(0), controller = useRef<AbortController | null>(null), locked = useRef(false);

  useEffect(() => {
    const version = ++generation.current;
    controller.current?.abort(); locked.current = false;
    if (!open || q.length < 2) return;
    const abort = new AbortController(); controller.current = abort;
    const timer = setTimeout(async () => {
      setState({ ...empty, query: q, loading: true, more: false, error: "", changed: false });
      try {
        const page = await load(q, 0, "", abort.signal);
        if (version === generation.current) setState({ ...page, query: q, loading: false, more: false, error: "", changed: false });
      } catch {
        if (version === generation.current && !abort.signal.aborted) setState({ ...empty, query: q, loading: false, more: false, error: "Не удалось загрузить результаты", changed: false });
      }
    }, 250);
    return () => { clearTimeout(timer); abort.abort(); controller.current?.abort(); generation.current = version + 1; locked.current = false; };
  }, [q, open, refresh, load]);

  async function loadMore() {
    if (!open || q !== state.query || !state.hasMore || state.loading || state.more || state.changed || locked.current) return;
    locked.current = true;
    const version = generation.current, abort = new AbortController(); controller.current = abort;
    setState(s => ({ ...s, more: true, error: "" }));
    try {
      const page = await load(q, state.nextOffset, state.revision, abort.signal);
      if (version === generation.current) setState(s => {
        const ids = new Set(s.items.map(item => item.id));
        return { ...s, ...page, items: [...s.items, ...page.items.filter(item => !ids.has(item.id))], more: false, error: "" };
      });
    } catch (error) {
      if (version === generation.current && !abort.signal.aborted) {
        const changed = error instanceof Error && error.message === "search_results_changed";
        setState(s => ({ ...s, more: false, changed, error: changed ? "Ассортимент обновился. Обновите поиск, чтобы увидеть актуальные результаты." : "Не удалось загрузить следующие товары" }));
      }
    } finally { if (version === generation.current) locked.current = false; }
  }

  function retry() { setRefresh(value => value + 1); }
  return { ...state, ready: open && q.length >= 2 && q === state.query,
    isFetching: open && q.length >= 2 && (q !== state.query || state.loading), loadMore, retry };
}
