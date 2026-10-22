import Link from "next/link";
import { notFound } from "next/navigation";
import pilot from "@/lib/catalog/product-video-pilot.json";

export const dynamic = "force-dynamic";
export const metadata = { title: "Видеообзоры — просмотр", robots: { index: false, follow: false } };

export default function VideoPilotPage() {
  if (process.env.PRODUCT_VIDEO_PILOT_ENABLED !== "true") notFound();
  return <main style={{maxWidth:920,margin:"40px auto",padding:"0 24px"}}>
    <h1>Посмотрите изделия в движении</h1>
    <p>Откройте карточку и нажмите миниатюру ▶ рядом с фотографиями. Все ролики без звука.</p>
    <ul style={{display:"grid",gap:20,padding:"24px 0",listStyle:"none"}}>
      {pilot.map(product => <li key={product.code} style={{borderBottom:"1px solid #ddd",paddingBottom:20}}>
        <Link href={`/catalog/product/${product.slug}`} style={{fontSize:20}}>{product.name}</Link>
        <p>{product.videos.map(video => `${video.label}: ${Math.round(video.duration)} с`).join(" · ")}</p>
      </li>)}
    </ul>
    <p>Для Virus можно сравнить короткую версию на 8 секунд и полный обзор на 33 секунды.</p>
  </main>;
}
