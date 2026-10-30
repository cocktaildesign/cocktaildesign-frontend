"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CatalogProductPreview } from "@/lib/api/catalog/types";
import styles from "./CatalogMenu.module.css";

type Preview = Pick<CatalogProductPreview, "id" | "slug" | "name" | "imageUrl">;
type Result = { status: "loading" | "error" | "ready"; items: Preview[] };
const previews = new Map<string, { expires: number; items: Preview[] }>();

/** Only mounted for the selected leaf/collection. Never loads the whole catalog. */
export default function CategoryProducts({ slug, collection = false, onNavigate }: {
  slug: string;
  collection?: boolean;
  onNavigate: () => void;
}) {
  const key = `${collection ? "collection" : "category"}:${slug}`;
  const [result, setResult] = useState<Result>(() => {
    const cached = previews.get(key);
    return cached && cached.expires > Date.now()
      ? { status: "ready", items: cached.items }
      : { status: "loading", items: [] };
  });

  useEffect(() => {
    const cached = previews.get(key);
    if (cached && cached.expires > Date.now()) return;
    const controller = new AbortController();
    let disposed = false;
    const timeout = setTimeout(() => controller.abort(), 10000);
    const query = new URLSearchParams({ [collection ? "collectionSlug" : "categorySlug"]: slug, limit: "4", offset: "0" });
    fetch(`/api/catalog-load-more?${query}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Preview unavailable");
        const data = await response.json() as { items: CatalogProductPreview[] };
        const items = data.items.slice(0, 4).map(({ id, slug, name, imageUrl }) => ({ id, slug, name, imageUrl }));
        if (disposed) return;
        if (previews.size >= 24) previews.delete(previews.keys().next().value!);
        previews.set(key, { items, expires: Date.now() + 60000 });
        setResult({ status: "ready", items });
      })
      .catch(() => { if (!disposed) setResult({ status: "error", items: [] }); })
      .finally(() => clearTimeout(timeout));
    return () => { disposed = true; clearTimeout(timeout); controller.abort(); };
  }, [key, slug, collection]);

  if (result.status === "error") return <p className={styles.previewMessage}>Не удалось загрузить примеры товаров. Нажмите «Смотреть все товары», чтобы открыть раздел.</p>;
  if (result.status === "ready" && !result.items.length) return <p className={styles.previewMessage}>Посмотрите актуальный ассортимент на странице раздела.</p>;
  return <section aria-label="Примеры товаров раздела">
    <h3 className={styles.previewLabel}>Несколько товаров из раздела</h3>
    <div className={styles.productPreview} aria-busy={result.status === "loading"}>
    {result.status === "loading" ? <>
      <span className={styles.srOnly} role="status">Загружаем товары</span>
      {[0, 1, 2, 3].map((id) => <div key={id} className={styles.productSkeleton} aria-hidden="true" />)}
    </> : result.items.map((product) => <Link prefetch={false} key={product.id}
      href={`/catalog/product/${product.slug}`} className={styles.previewProduct} onClick={onNavigate}>
      <div className={styles.previewImage}>
        {product.imageUrl ? <Image src={product.imageUrl} alt="" fill sizes="(max-width: 600px) 40vw, 360px" />
          : <span className={styles.noPhoto}>Фото скоро</span>}
      </div>
      <span>{product.name}</span>
    </Link>)}
    </div>
  </section>;
}
