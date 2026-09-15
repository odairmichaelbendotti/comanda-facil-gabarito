import { LuPlus } from "react-icons/lu";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";

interface ProdutosHeaderProps {
  onNewProduct: () => void;
}

export default function ProdutosHeader({ onNewProduct }: ProdutosHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <PageHeader
        title="Produtos"
        subtitle="Gerencie o cardápio da pizzaria"
      />
      <Button className="self-start sm:self-auto" onClick={onNewProduct}>
        <span className="flex items-center gap-2">
          <LuPlus className="size-3.5" />
          Novo Produto
        </span>
      </Button>
    </div>
  );
}
