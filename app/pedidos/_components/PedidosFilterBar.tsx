import FilterTab from "../../components/FilterTab";

type FilterKey = "todos" | "em-producao" | "entregues" | "cancelados";

interface PedidosFilterBarProps {
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
}

const filters: { key: FilterKey; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "em-producao", label: "Em produção" },
  { key: "entregues", label: "Entregues" },
  { key: "cancelados", label: "Cancelados" },
];

export default function PedidosFilterBar({
  activeFilter,
  onFilterChange,
}: PedidosFilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {filters.map((filter) => (
        <FilterTab
          key={filter.key}
          label={filter.label}
          active={filter.key === activeFilter}
          onClick={() => onFilterChange(filter.key)}
          className="shrink-0"
        />
      ))}
    </div>
  );
}
