import { LuPlus } from "react-icons/lu";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";

interface FuncionariosHeaderProps {
  onNewFuncionario: () => void;
}

export default function FuncionariosHeader({
  onNewFuncionario,
}: FuncionariosHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <PageHeader
        title="Funcionários"
        subtitle="Gerencie os funcionários do seu restaurante"
      />
      <Button className="self-start sm:self-auto" onClick={onNewFuncionario}>
        <span className="flex items-center gap-2">
          <LuPlus className="size-3.5" />
          Novo Funcionário
        </span>
      </Button>
    </div>
  );
}
