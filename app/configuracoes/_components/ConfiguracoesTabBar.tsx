import Tab from "../../components/Tab";

type ConfigTab = "categorias" | "mesas";

interface ConfiguracoesTabBarProps {
  activeTab: ConfigTab;
  onTabChange: (tab: ConfigTab) => void;
}

const tabs: { key: ConfigTab; label: string }[] = [
  { key: "categorias", label: "Categorias" },
  { key: "mesas", label: "Mesas" },
];

export default function ConfiguracoesTabBar({
  activeTab,
  onTabChange,
}: ConfiguracoesTabBarProps) {
  return (
    <div className="flex shrink-0 gap-8 overflow-x-auto">
      {tabs.map((tab) => (
        <Tab
          key={tab.key}
          label={tab.label}
          active={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
          className="shrink-0"
        />
      ))}
    </div>
  );
}
