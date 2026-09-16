import { LuLoaderCircle } from "react-icons/lu";

interface PageLoadingStateProps {
  className?: string;
}

export default function PageLoadingState({
  className = "",
}: PageLoadingStateProps) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={`flex h-full w-full flex-1 items-center justify-center py-16 ${className}`}
    >
      <LuLoaderCircle className="size-6 animate-spin text-(--color-text-tertiary) motion-reduce:animate-none" />
    </div>
  );
}
