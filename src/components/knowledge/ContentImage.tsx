import Image from "next/image";
import type { KnowledgeContentBlock } from "@/app/knowledge/types";

type Props = {
  block: Extract<KnowledgeContentBlock, { type: "image" }>;
  className?: string;
  priority?: boolean;
};

export default function ContentImage({ block, className, priority = false }: Props) {
  return (
    <picture>
      {block.srcSet && <source srcSet={block.srcSet} sizes="(max-width: 918px) calc(100vw - 48px), 870px" />}
      <Image
        src={block.src}
        alt={block.alt ?? ""}
        width={block.width ?? 870}
        height={block.height ?? 490}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}
