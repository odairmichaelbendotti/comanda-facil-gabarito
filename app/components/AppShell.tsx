"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LuBox,
  LuClipboardList,
  LuMenu,
  LuTag,
  LuUsers,
  LuX,
} from "react-icons/lu";
import { useAuthStore } from "../lib/store/auth-store";
import { getAllowedRoles } from "../lib/permissions";
import Logo from "./Logo";
import Sidebar from "./Sidebar";

const navItems = [
  {
    key: "pedidos",
    icon: <LuClipboardList className="size-4.5" />,
    label: "Pedidos",
    href: "/pedidos",
  },
  {
    key: "produtos",
    icon: <LuBox className="size-4.5" />,
    label: "Produtos",
    href: "/produtos",
  },
  {
    key: "configuracoes",
    icon: <LuTag className="size-4.5" />,
    label: "Configurações",
    href: "/configuracoes",
  },
  {
    key: "funcionarios",
    icon: <LuUsers className="size-4.5" />,
    label: "Funcionários",
    href: "/funcionarios",
  },
];

interface AppShellProps {
  activeHref: string;
  children: ReactNode;
}

export default function AppShell({ activeHref, children }: AppShellProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const plano = useAuthStore((state) => state.plano);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function handleUpgradeClick() {
    router.push("/premium-upgrade");
  }

  const visibleNavItems = user
    ? navItems.filter((item) => {
        const allowedRoles = getAllowedRoles(item.href);
        return !allowedRoles || allowedRoles.includes(user.role);
      })
    : [];

  // Only the admin owns the establishment's plan — a garçom/cozinha has no
  // reason to see or manage it.
  const showPlanIndicators = user?.role === "admin";

  return (
    <div className="flex h-screen overflow-hidden bg-(--color-bg-canvas)">
      <Sidebar
        items={visibleNavItems}
        activeHref={activeHref}
        userName={user?.name}
        plano={plano}
        showPlanIndicators={showPlanIndicators}
        onLogout={handleLogout}
        onUpgradeClick={handleUpgradeClick}
        className="hidden md:flex"
      />

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-(--color-border-subtle) bg-(--color-bg-sidebar) px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className="flex size-10 cursor-pointer items-center justify-center rounded-md text-(--color-text-primary) transition-colors duration-150 motion-reduce:transition-none hover:bg-(--color-bg-input) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
        >
          <LuMenu className="size-4.5" />
        </button>
        <Logo size="sm" />
        <span className="size-10" aria-hidden="true" />
      </div>

      {/* Mobile drawer */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-150 motion-reduce:transition-none md:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-y-0 left-0 z-50 w-70 transition-[translate] duration-150 motion-reduce:transition-none md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          items={visibleNavItems}
          activeHref={activeHref}
          userName={user?.name}
          plano={plano}
          showPlanIndicators={showPlanIndicators}
          onLogout={handleLogout}
          onUpgradeClick={handleUpgradeClick}
        />
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Fechar menu"
          className="absolute top-3.5 right-3.5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-(--color-bg-input) text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:bg-(--color-status-neutral-bg) hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
        >
          <LuX className="size-3" />
        </button>
      </div>

      <main className="animate-fade-in-up flex flex-1 flex-col gap-6 overflow-y-auto scroll-smooth px-4 pt-20 pb-10 sm:px-6 md:p-12 md:pt-8 motion-reduce:scroll-auto">
        {children}
      </main>
    </div>
  );
}
