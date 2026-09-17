import EmptyState from "../../components/EmptyState";
import MesaCard from "../../components/MesaCard";
import Pagination from "../../components/Pagination";

interface Mesa {
  id: string;
  number: number;
}

interface MesasSectionProps {
  mesas: Mesa[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRemove: (id: string) => void;
  gridRef: (node: HTMLElement | null) => void;
}

const MESA_CARD_MIN_WIDTH = 160;
const SKELETON_CARD_COUNT = 10;

export default function MesasSection({
  mesas,
  loading = false,
  currentPage,
  totalPages,
  onPageChange,
  onRemove,
  gridRef,
}: MesasSectionProps) {
  if (loading) {
    return (
      <div
        className="grid w-full gap-4"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${MESA_CARD_MIN_WIDTH}px, 1fr))`,
        }}
      >
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex animate-pulse flex-col items-center gap-2 rounded-lg border border-(--color-border-subtle) bg-(--color-bg-surface) p-3 motion-reduce:animate-none"
          >
            <div className="h-6 w-8 rounded bg-(--color-status-neutral-bg)" />
            <div className="h-3.5 w-14 rounded bg-(--color-status-neutral-bg)" />
          </div>
        ))}
      </div>
    );
  }

  if (mesas.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="Nenhuma mesa cadastrada"
          subtitle="Adicione mesas para organizar o salão."
        />
      </div>
    );
  }

  return (
    <>
      <div
        ref={gridRef}
        className="animate-fade-in-up grid w-full gap-4"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${MESA_CARD_MIN_WIDTH}px, 1fr))`,
        }}
      >
        {mesas.map((mesa) => (
          <MesaCard
            key={mesa.id}
            number={String(mesa.number)}
            label={`Mesa ${mesa.number}`}
            onRemove={() => onRemove(mesa.id)}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        className="mt-auto"
      />
    </>
  );
}
