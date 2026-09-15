import { LuPlus } from "react-icons/lu";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";

interface GarconsHeaderProps {
  onNewWaiter: () => void;
}

export default function GarconsHeader({ onNewWaiter }: GarconsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <PageHeader
        title="Garçons"
        subtitle="Gerencie os garçons do seu restaurante"
      />
      <Button className="self-start sm:self-auto" onClick={onNewWaiter}>
        <span className="flex items-center gap-2">
          <LuPlus className="size-3.5" />
          Novo Garçom
        </span>
      </Button>
    </div>
  );
}
