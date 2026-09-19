"use client";

import { ReactNode, useEffect, useRef } from "react";
import ModalContainer from "./ModalContainer";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  // Callers routinely pass an inline onClose (a new function identity every
  // render of the parent — e.g. /pedidos re-renders every second for its
  // countdown). Putting onClose straight in the effect's deps would tear
  // down and re-run this whole setup that often, re-stealing focus to the
  // first focusable element and closing whatever the user had open (a native
  // <select> popup included) — a ref sidesteps that without requiring every
  // caller to useCallback their onClose.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const node = dialogRef.current;
    const getFocusable = () =>
      node ? Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

    getFocusable()[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    // Some pages scroll an inner container (not <body>), so locking body
    // overflow alone doesn't stop it. Block any wheel/touch scroll unless
    // it lands on a scrollable element (the dialog itself, or something
    // scrollable nested inside it, e.g. a Dropdown listbox) that actually
    // has overflow in that spot — otherwise the browser chains the scroll
    // to whatever container sits behind the modal (background "leaks"
    // through it, or through a part of the modal with nothing to scroll).
    function findScrollableWithin(target: EventTarget | null): boolean {
      if (!node) return false;
      let el = target instanceof Element ? target : null;
      while (el && node.contains(el)) {
        const style = getComputedStyle(el);
        const scrollableY = /(auto|scroll)/.test(style.overflowY);
        if (scrollableY && el.scrollHeight > el.clientHeight) return true;
        if (el === node) break;
        el = el.parentElement;
      }
      return false;
    }

    function shouldBlockScroll(event: Event) {
      if (!node || !node.contains(event.target as Node)) return true;
      return !findScrollableWithin(event.target);
    }

    function handleWheel(event: WheelEvent) {
      if (shouldBlockScroll(event)) event.preventDefault();
    }

    function handleTouchMove(event: TouchEvent) {
      if (shouldBlockScroll(event)) event.preventDefault();
    }

    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("touchmove", handleTouchMove);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      inert={!isOpen}
      className={`fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black/40 p-4 transition-opacity duration-150 motion-reduce:transition-none ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-full min-h-0 w-full flex-col transition-[opacity,translate] duration-150 motion-reduce:transition-none sm:w-auto ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <ModalContainer title={title} onClose={onClose}>
          {children}
        </ModalContainer>
      </div>
    </div>
  );
}
