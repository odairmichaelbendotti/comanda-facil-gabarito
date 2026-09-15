import EmptyState from "../../components/EmptyState";
import MesaCard from "../../components/MesaCard";
import Pagination from "../../components/Pagination";

interface Mesa {
  id: string;
  number: number;
}

interface MesasSectionProps {
  mesas: Mesa[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRemove: (id: string) => void;
  gridRef: (node: HTMLElement | null) => void;
}

const MESA_CARD_MIN_WIDTH = 160;

export default function MesasSection({
  mesas,
  currentPage,
  totalPages,
  onPageChange,
  onRemove,
  gridRef,
}: MesasSectionProps) {
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
        className="grid w-full gap-4"
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
