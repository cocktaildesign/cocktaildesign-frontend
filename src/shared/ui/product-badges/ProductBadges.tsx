"use client";

import { useState } from "react";

import type { ProductBadge } from "@/lib/api/catalog/types";

import styles from "./ProductBadges.module.css";

const NOVELTY_LABEL = "НОВИНКА";
const MAX_MANUAL_BADGES = 5;

export type ProductBadgesProps = {
  isNew: boolean;
  noveltyBadgeColor: string;
  badges: ProductBadge[];
  desktopLimit?: number | null;
  mobileLimit?: number | null;
  mobileExpandable?: boolean;
  overlay?: boolean;
  className?: string;
};

type BadgeListItem =
  | { kind: "novelty" }
  | { kind: "manual"; badge: ProductBadge };

type BadgeListProps = {
  items: BadgeListItem[];
  limit: number | null | undefined;
  expanded: boolean;
  noveltyBadgeColor: string;
  overlay: boolean;
  mobileExpandable: boolean;
  onExpand: () => void;
};

function buildBadgeListItems(isNew: boolean, badges: ProductBadge[]): BadgeListItem[] {
  const items: BadgeListItem[] = [];

  if (isNew) {
    items.push({ kind: "novelty" });
  }

  for (const badge of badges.slice(0, MAX_MANUAL_BADGES)) {
    items.push({ kind: "manual", badge });
  }

  return items;
}

function BadgeList({
  items,
  limit,
  expanded,
  noveltyBadgeColor,
  overlay,
  mobileExpandable,
  onExpand,
}: BadgeListProps) {
  const safeLimit = typeof limit === "number" ? limit : null;

  const hiddenCount =
    safeLimit !== null && !expanded && items.length > safeLimit ? items.length - safeLimit : 0;

  const visibleItems = hiddenCount > 0 && safeLimit !== null ? items.slice(0, safeLimit) : items;

  return (
    <>
      {visibleItems.map((item) => {
        if (item.kind === "novelty") {
          return (
            <span
              key="novelty"
              className={`${styles.badge} ${overlay ? styles.badgeEllipsis : ""}`}
              style={{ backgroundColor: noveltyBadgeColor, color: "#ffffff" }}>
              <span className={styles.badgeLabel}>{NOVELTY_LABEL}</span>
            </span>
          );
        }

        return (
          <span
            key={item.badge.id}
            className={`${styles.badge} ${overlay ? styles.badgeEllipsis : ""}`}
            style={{
              backgroundColor: item.badge.backgroundColor,
              color: item.badge.textColor,
            }}>
            <span className={styles.badgeLabel}>{item.badge.label}</span>
          </span>
        );
      })}

      {hiddenCount > 0 &&
        (mobileExpandable ? (
          <button
            type="button"
            className={styles.expandButton}
            aria-expanded={expanded}
            aria-label={`Показать ещё ${hiddenCount} бейджей`}
            onClick={onExpand}>
            +{hiddenCount}
          </button>
        ) : (
          <span className={`${styles.badge} ${styles.more}`}>+{hiddenCount}</span>
        ))}
    </>
  );
}

export default function ProductBadges({
  isNew,
  noveltyBadgeColor,
  badges,
  desktopLimit = null,
  mobileLimit = null,
  mobileExpandable = false,
  overlay = false,
  className,
}: ProductBadgesProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const items = buildBadgeListItems(isNew, badges);

  if (items.length === 0) {
    return null;
  }

  const needsSplit = desktopLimit !== mobileLimit || mobileExpandable;

  const rootClassName = [styles.root, overlay ? styles.overlay : "", className ?? ""].filter(Boolean).join(" ");

  if (!needsSplit) {
    return (
      <div className={rootClassName}>
        <div className={styles.list}>
          <BadgeList
            items={items}
            limit={desktopLimit ?? mobileLimit}
            expanded={false}
            noveltyBadgeColor={noveltyBadgeColor}
            overlay={overlay}
            mobileExpandable={false}
            onExpand={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <div className={`${styles.list} ${styles.desktopOnly}`}>
        <BadgeList
          items={items}
          limit={desktopLimit}
          expanded={false}
          noveltyBadgeColor={noveltyBadgeColor}
          overlay={overlay}
          mobileExpandable={false}
          onExpand={() => {}}
        />
      </div>

      <div className={`${styles.list} ${styles.mobileOnly}`}>
        <BadgeList
          items={items}
          limit={mobileLimit}
          expanded={mobileExpanded}
          noveltyBadgeColor={noveltyBadgeColor}
          overlay={overlay}
          mobileExpandable={mobileExpandable}
          onExpand={() => setMobileExpanded(true)}
        />
      </div>
    </div>
  );
}
