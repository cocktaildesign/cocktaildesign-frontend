import type { KnowledgeVideoDetail } from "@/app/knowledge/types";
import { knowledgeImage } from "./knowledge";
import { descriptionText } from "./policy";
import verifiedVideos from "./verified-videos.json";

type VerifiedVideo = (typeof verifiedVideos)[keyof typeof verifiedVideos];

/** Only verified player URLs receive dates; CMS import dates are not upload dates. */
export function videoJsonLd(item: KnowledgeVideoDetail, origin: string) {
  if (!Object.hasOwn(verifiedVideos, item.embedUrl)) return undefined;
  const verified = (verifiedVideos as Record<string, VerifiedVideo | undefined>)[item.embedUrl];
  const thumbnail = knowledgeImage(item.coverSrc, origin);
  if (!verified || !thumbnail || !item.title.trim()) return undefined;

  const url = new URL(`/knowledge/videos/${item.slug}`, origin).href;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${url}#video`,
    url,
    mainEntityOfPage: url,
    name: item.title,
    description: item.description ? descriptionText(item.description) : undefined,
    thumbnailUrl: [thumbnail],
    uploadDate: verified.uploadDate,
    duration: verified.duration,
    embedUrl: item.embedUrl,
    inLanguage: "ru-RU",
  };
}
