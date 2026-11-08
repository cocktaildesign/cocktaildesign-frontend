const INTENT_DISTANCE = 12;
const SWIPE_DISTANCE = 32;
const DIRECTION_RATIO = 1.5;

type Gesture = { id: number; x: number; y: number; axis: "pending" | "horizontal" | "vertical" };

// No timers, global listeners or default-event cancellation: the browser owns
// vertical scrolling and pinch zoom. One completed gesture advances one image.
export function createImageSwipe() {
  let gesture: Gesture | null = null;
  let blockClick = false;

  function move(id: number, x: number, y: number) {
    if (!gesture || gesture.id !== id) return;
    const dx = Math.abs(x - gesture.x), dy = Math.abs(y - gesture.y);
    if (gesture.axis === "pending" && Math.max(dx, dy) >= INTENT_DISTANCE) {
      gesture.axis = dx > dy * DIRECTION_RATIO ? "horizontal" : "vertical";
      blockClick = true;
    }
  }

  return {
    resetClickGuard() { blockClick = false; },
    begin(id: number, x: number, y: number) {
      blockClick = false;
      gesture = { id, x, y, axis: "pending" };
    },
    move,
    end(id: number, x: number, y: number): -1 | 0 | 1 {
      if (!gesture || gesture.id !== id) return 0;
      move(id, x, y);
      const dx = x - gesture.x, dy = y - gesture.y;
      const shouldSwipe = gesture.axis === "horizontal" && Math.abs(dx) >= SWIPE_DISTANCE &&
        Math.abs(dx) > Math.abs(dy) * DIRECTION_RATIO;
      gesture = null;
      return shouldSwipe ? (dx < 0 ? 1 : -1) : 0;
    },
    cancel() {
      if (gesture) blockClick = true;
      gesture = null;
    },
    shouldBlockClick(detail: number) {
      // Keyboard activation must remain usable even if the browser emitted no
      // click after a drag. A new pointerdown also resets this one-gesture guard.
      if (detail === 0 || !blockClick) return false;
      blockClick = false;
      return true;
    },
  };
}

export function nextPreviewImage(index: number, count: number, direction: -1 | 1): number {
  return count > 0 ? ((index + direction) % count + count) % count : 0;
}

export function variantPreviewImages(images: string[], selectedImage: string | null, limit: number): string[] {
  if (!selectedImage || images.includes(selectedImage)) return images;
  // Keep the selected variant visible and reachable when its image was outside
  // the preview limit. Swiping never changes the actual variant selection.
  return [selectedImage, ...images].slice(0, limit);
}
