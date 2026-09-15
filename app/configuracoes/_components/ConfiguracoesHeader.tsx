import { LuPlus } from "react-icons/lu";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";

type ConfigTab = "categorias" | "mesas";

interface ConfiguracoesHeaderProps {
  activeTab: ConfigTab;
  onNewCategory: () => void;
  onNewMesa: () => void;
}

export default function ConfiguracoesHeader({
  activeTab,
  onNewCategory,
  onNewMesa,
}: ConfiguracoesHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <PageHeader
        title="Configurações"
        subtitle="Gerencie categorias e mesas do seu restaurante"
      />
      {activeTab === "categorias" ? (
        <Button className="self-start sm:self-auto" onClick={onNewCategory}>
          <span className="flex items-center gap-2">
            <LuPlus className="size-3.5" />
            Nova Categoria
          </span>
        </Button>
      ) : (
        <Button className="self-start sm:self-auto" onClick={onNewMesa}>
          <span className="flex items-center gap-2">
            <LuPlus className="size-3.5" />
            Nova Mesa
          </span>
        </Button>
      )}
    </div>
  );
}
