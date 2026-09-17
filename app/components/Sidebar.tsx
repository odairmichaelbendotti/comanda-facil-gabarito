import { ReactNode } from "react";
import { LuLogOut } from "react-icons/lu";
import { PlanoInfo } from "../lib/store/auth-store";
import Logo from "./Logo";
import RefreshTimer from "./RefreshTimer";
import SidebarNavItem from "./SidebarNavItem";
import SidebarPlanIndicators from "./SidebarPlanIndicators";
import ThemeToggle from "./ThemeToggle";

interface SidebarItem {
  key: string;
  icon: ReactNode;
  label: string;
  href: string;
}

interface RefreshTimerConfig {
  secondsLeft: number;
  totalSeconds: number;
  onRefreshNow: () => void;
}

interface SidebarProps {
  items: SidebarItem[];
  activeHref?: string;
  userName?: string;
  plano?: PlanoInfo | null;
  showPlanIndicators?: boolean;
  planoLoading?: boolean;
  refreshTimer?: RefreshTimerConfig;
  onLogout?: () => void;
  onUpgradeClick?: () => void;
  className?: string;
}

export default function Sidebar({
  items,
  activeHref,
  userName = "Odair Michael",
  plano,
  showPlanIndicators = true,
  planoLoading = false,
  refreshTimer,
  onLogout,
  onUpgradeClick,
  className = "",
}: SidebarProps) {
  return (
    <nav
      className={`flex h-full w-60 flex-col gap-7 border border-[var(--color-border-subtle)] bg-[var(--color-bg-sidebar)] px-5 pt-7 pb-5 ${className}`}
    >
      <div className="flex flex-col gap-0.5">
        <Logo size="sm" className="self-start" />
        <p className="text-body-sm text-[color:var(--color-text-tertiary)]">
          Olá, {userName}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={item.href === activeHref}
          />
        ))}
      </div>

      {showPlanIndicators ? (
        <SidebarPlanIndicators
          loading={planoLoading}
          premium={plano?.premium}
          ordersUsed={plano?.pedidosUsados}
          ordersLimit={plano?.pedidosLimite ?? undefined}
          onUpgradeClick={onUpgradeClick}
        />
      ) : (
        // Empty spacer in place of SidebarPlanIndicators — it's the one
        // pushing the logout/theme footer down to the bottom of the sidebar.
        <div className="flex-1" />
      )}

      {refreshTimer && (
        <RefreshTimer
          secondsLeft={refreshTimer.secondsLeft}
          totalSeconds={refreshTimer.totalSeconds}
          onRefreshNow={refreshTimer.onRefreshNow}
        />
      )}

      <div className="flex flex-col gap-3">
        <div className="h-px w-full bg-[var(--color-border-default)]" />
        <div className="flex items-center justify-between py-2 pr-1 pl-3.5">
          <button
            type="button"
            onClick={onLogout}
            className="flex cursor-pointer items-center gap-2.5 rounded-md text-body-md font-semibold text-[color:var(--color-text-secondary)] transition-colors duration-150 motion-reduce:transition-none hover:text-[color:var(--color-status-danger-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
          >
            <LuLogOut className="size-5" />
            Sair
          </button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
