import { LuPlus } from "react-icons/lu";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";

interface PedidosHeaderProps {
  onNewOrder: () => void;
}

export default function PedidosHeader({ onNewOrder }: PedidosHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <PageHeader title="Pedidos" subtitle="Gerencie os pedidos da cozinha" />
      <Button className="self-start sm:self-auto" onClick={onNewOrder}>
        <span className="flex items-center gap-2">
          <LuPlus className="size-3.5" />
          Novo Pedido
        </span>
      </Button>
    </div>
  );
}
