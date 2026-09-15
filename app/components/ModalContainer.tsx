import { ReactNode } from "react";
import { LuCircleX } from "react-icons/lu";

interface ModalContainerProps {
  title?: string;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
}

export default function ModalContainer({
  title = "Título do modal",
  onClose,
  children,
  className = "",
}: ModalContainerProps) {
  return (
    <div
      className={`flex max-h-full min-h-0 w-full flex-col rounded-lg bg-(--color-bg-surface-elevated) shadow-lg sm:w-130 ${className}`}
    >
      <div className="flex w-full shrink-0 items-center justify-between gap-4 p-8 pb-4">
        <p className="min-w-0 flex-1 font-display text-h3 text-(--color-text-primary)">
          {title}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-(--color-status-neutral-bg) text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:bg-(--color-border-default) hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
        >
          <LuCircleX className="size-3.5" />
        </button>
      </div>
      <div className="scrollbar-hidden min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-8 pb-8">
        {children ?? (
          <p className="text-body-md text-(--color-text-tertiary)">
            Conteúdo do modal
          </p>
        )}
      </div>
    </div>
  );
}
