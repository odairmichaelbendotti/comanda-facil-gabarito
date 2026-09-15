"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseResponsiveGridOptions {
  /** Vertical gap between rows, in px — must match the container's gap-* class. */
  gap: number;
  /** Space to reserve below the grid (pagination row + its own margin), in px. */
  reservedBottom?: number;
  minColumns?: number;
  minRows?: number;
  /** Fixed column count — omit to read it from the grid's computed `grid-template-columns`. */
  columns?: number;
  /** Picks the element to measure row height from. Defaults to the container's first child. */
  getItemElement?: (container: HTMLElement) => HTMLElement | null;
}

/**
 * Computes how many items fit in the visible area of a grid/list container —
 * columns from the rendered CSS grid (or a fixed count), rows from the actual
 * available viewport height — so pagination shows as many items per page as
 * the screen can hold instead of a hardcoded number.
 *
 * Returns a callback ref (not a plain RefObject): the container may unmount
 * and remount with a fresh DOM node (e.g. swapping between an EmptyState and
 * the grid, or between two tabs' grids) — a callback ref re-runs the
 * measurement setup every time the node itself changes, where a RefObject
 * would keep observing a stale, detached element.
 */
export function useResponsiveGrid({
  gap,
  reservedBottom = 0,
  minColumns = 1,
  minRows = 1,
  columns: fixedColumns,
  getItemElement,
}: UseResponsiveGridOptions): [number, (node: HTMLElement | null) => void] {
  const [pageSize, setPageSize] = useState(minColumns * minRows);
  const [node, setNode] = useState<HTMLElement | null>(null);
  const optionsRef = useRef({ gap, reservedBottom, minColumns, minRows, fixedColumns, getItemElement });

  // Keep the latest options available to the measurement effect below
  // without making it re-run (and re-attach the ResizeObserver) on every
  // render — mutating a ref must happen in an effect, not during render.
  useEffect(() => {
    optionsRef.current = { gap, reservedBottom, minColumns, minRows, fixedColumns, getItemElement };
  });

  useEffect(() => {
    if (!node) return;

    function measure() {
      const container = node;
      if (!container) return;
      const { gap, reservedBottom, minColumns, minRows, fixedColumns, getItemElement } =
        optionsRef.current;

      const item = (
        getItemElement ? getItemElement(container) : container.firstElementChild
      ) as HTMLElement | null;
      if (!item) return;

      const itemRect = item.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const itemHeight = itemRect.height;
      if (itemHeight <= 0) return;

      const columns =
        fixedColumns ??
        Math.max(
          minColumns,
          getComputedStyle(container).gridTemplateColumns.split(" ").filter(Boolean).length,
        );

      // Anything the container renders before the measured item (e.g. a
      // table header row) eats into the available height too — measuring
      // the item's own offset (instead of assuming it's the first child)
      // accounts for that without needing a separate "header height" prop.
      const contentBeforeItem = itemRect.top - containerRect.top;
      const availableHeight =
        window.innerHeight - containerRect.top - reservedBottom - contentBeforeItem;
      const rows = Math.max(minRows, Math.floor((availableHeight + gap) / (itemHeight + gap)));

      const next = Math.max(1, columns * rows);
      setPageSize((current) => (current === next ? current : next));
    }

    measure();

    // Web fonts (next/font/google) can swap in after the first measurement,
    // nudging line-height/row height by a couple of px — negligible on its
    // own, but multiplied by however many rows got packed into the page it
    // can be enough to tip the container past the available height and pop a
    // scrollbar. Re-measuring once fonts are ready corrects for that.
    let cancelled = false;
    document.fonts?.ready?.then(() => {
      if (!cancelled) measure();
    });

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [node]);

  const ref = useCallback((next: HTMLElement | null) => {
    setNode(next);
  }, []);

  return [pageSize, ref];
}
