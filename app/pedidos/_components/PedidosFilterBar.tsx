import FilterTab from "../../components/FilterTab";

type FilterKey =
  | "todos"
  | "pendentes"
  | "em-preparo"
  | "prontos"
  | "cancelados";

interface PedidosFilterBarProps {
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
}

const filters: { key: FilterKey; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendentes", label: "Pendentes" },
  { key: "em-preparo", label: "Em Preparo" },
  { key: "prontos", label: "Prontos" },
  { key: "cancelados", label: "Cancelados" },
];

export default function PedidosFilterBar({
  activeFilter,
  onFilterChange,
}: PedidosFilterBarProps) {
  return (
    <div className="flex shrink-0 gap-2 overflow-x-auto">
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
