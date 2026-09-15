"use client";

import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: DropdownOption[];
  disabled?: boolean;
  className?: string;
}

interface ListPosition {
  top: number;
  left: number;
  width: number;
}

export default function Dropdown({
  label = "Selecionar",
  value,
  onValueChange,
  options,
  disabled = false,
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [position, setPosition] = useState<ListPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const triggerId = useId();
  const listboxId = useId();

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  function updatePosition() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleReposition() {
      updatePosition();
    }

    document.addEventListener("mousedown", handlePointerDown);
    // capture:true so this also fires for scroll on any ancestor
    // container (e.g. the modal's own scrollable body), not just window.
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen]);

  function openDropdown() {
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    updatePosition();
    setIsOpen(true);
  }

  function selectOption(index: number) {
    const option = options[index];
    if (!option) return;
    onValueChange?.(option.value);
    setIsOpen(false);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((index) => Math.min(index + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        event.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        selectOption(highlightedIndex);
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className={`relative flex w-full flex-col gap-1.5 ${className}`}>
      <label
        id={`${triggerId}-label`}
        htmlFor={triggerId}
        className="text-label-md font-semibold text-[color:var(--color-text-primary)]"
      >
        {label}
      </label>
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={isOpen ? optionId(highlightedIndex) : undefined}
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        onKeyDown={handleTriggerKeyDown}
        className="flex w-full cursor-pointer items-center justify-between rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-3 text-body-md text-[color:var(--color-text-primary)] outline-none transition-colors duration-150 motion-reduce:transition-none hover:border-[var(--color-border-focus)] focus-visible:border-[var(--color-border-focus)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="truncate">{selectedOption?.label ?? "Selecionar..."}</span>
        <LuChevronDown
          className={`size-3 shrink-0 text-[color:var(--color-text-secondary)] transition-[rotate] duration-150 motion-reduce:transition-none ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      <ul
        id={listboxId}
        role="listbox"
        aria-labelledby={`${triggerId}-label`}
        inert={!isOpen}
        style={
          position
            ? { top: position.top, left: position.left, width: position.width }
            : undefined
        }
        className={`scrollbar-hidden fixed z-[70] max-h-55 overflow-auto rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-surface-elevated)] p-1 shadow-md transition-[opacity,translate] duration-150 motion-reduce:transition-none ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={optionId(index)}
            role="option"
            aria-selected={option.value === value}
            onMouseEnter={() => setHighlightedIndex(index)}
            onClick={() => selectOption(index)}
            className={`cursor-pointer rounded-sm px-3 py-2 text-body-md text-[color:var(--color-text-primary)] transition-colors duration-150 motion-reduce:transition-none ${
              index === highlightedIndex ? "bg-[var(--color-bg-input)]" : ""
            } ${option.value === value ? "font-semibold" : ""}`}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
