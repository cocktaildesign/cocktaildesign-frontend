import type { KnowledgeContentBlock } from "@/app/knowledge/types";

const hosts = new Set(["vk.ru", "vk.com", "vkvideo.ru"]);

function trustedUrl(value?: string | null): URL | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && hosts.has(url.hostname) && !url.username && !url.password && !url.port) return url;
  } catch { /* Invalid editorial URLs must not break the article. */ }
  return undefined;
}

export type LocalArticleVideo = { src: string; poster: string; durationLabel: string };
export type ArticleVideoSource = { externalUrl?: string; embedUrl?: string; local?: LocalArticleVideo };

// Owner-provided originals, compressed offline. Match the exact clip identity so
// future articles retain their own source instead of inheriting a recipe video.
const localVideos: Record<string, LocalArticleVideo> = {
  "-72675133_456240684": { src: "/videos/knowledge/honey-f2c07653.mp4", poster: "/videos/knowledge/honey-poster.webp", durationLabel: "0:29" },
  "-72675133_456240664": { src: "/videos/knowledge/isomalt-36a76b09.mp4", poster: "/videos/knowledge/isomalt-poster.webp", durationLabel: "0:33" },
  "-72675133_456240651": { src: "/videos/knowledge/perfume-d3936694.mp4", poster: "/videos/knowledge/perfume-poster.webp", durationLabel: "0:39" },
};

/** Use a publisher-supplied embed only; a public clip link is not an embed code. */
export function articleVideo(source?: string | null, embed?: string | null, duration?: string | null): ArticleVideoSource | undefined {
  const external = trustedUrl(source);
  const clip = external?.pathname.match(/^\/clip(-?\d+)_(\d+)\/?$/);
  // Editors can use an owner-hosted recipe without inventing a VK link. Only
  // our immutable Knowledge asset paths are accepted, never arbitrary embeds.
  if (embed) {
    try {
      const file = new URL(embed);
      if (file.origin === "https://cocktaildesign.ru" && !file.username && !file.password && !file.port &&
          !file.search && !file.hash && /^\/videos\/knowledge\/[a-z0-9]+-[a-f0-9]{8}\.mp4$/.test(file.pathname)) {
        return {
          externalUrl: external && clip ? `${external.origin}/clip${clip[1]}_${clip[2]}` : undefined,
          local: { src: file.pathname, poster: file.pathname.replace(/\.mp4$/, "-poster.webp"),
            durationLabel: duration && /^\d{1,3}:[0-5]\d$/.test(duration) ? duration : "" },
        };
      }
    } catch { /* An invalid CMS URL must not break the existing VK fallback. */ }
  }
  if (!external || !clip) return undefined;
  const externalUrl = `${external.origin}/clip${clip[1]}_${clip[2]}`;
  const local = localVideos[`${clip[1]}_${clip[2]}`];
  if (local) return { externalUrl, local };
  const player = trustedUrl(embed);
  if (!player || player.pathname !== "/video_ext.php" ||
      player.searchParams.getAll("oid").length !== 1 || player.searchParams.getAll("id").length !== 1 ||
      player.searchParams.get("oid") !== clip[1] || player.searchParams.get("id") !== clip[2]) return { externalUrl };
  player.searchParams.set("autoplay", "0");
  player.hash = "";
  return { externalUrl, embedUrl: player.href };
}

/** Move just the opening poster/link into the hero; preserve steps, captions and all CMS data. */
export function articleVideoBody(blocks: KnowledgeContentBlock[], coverSrc: string, video?: ArticleVideoSource) {
  if (!video) return { blocks };
  let inIntroduction = true;
  let poster: Extract<KnowledgeContentBlock, { type: "image" }> | undefined;
  const remaining = blocks.filter(block => {
    if (block.type === "heading") inIntroduction = false;
    if (!inIntroduction) return true;
    if (!poster && block.type === "image" && block.src === coverSrc) {
      poster = block;
      return false;
    }
    return !(block.type === "link" && video.externalUrl && articleVideo(block.url)?.externalUrl === video.externalUrl);
  });
  return { blocks: remaining, poster };
}
