import { LuCalendarCheck, LuLock, LuShieldCheck } from "react-icons/lu";

const SIGNALS = [
  { icon: LuLock, label: "Pagamento seguro via Stripe" },
  { icon: LuCalendarCheck, label: "Cancele quando quiser" },
  { icon: LuShieldCheck, label: "Garantia de reembolso de 7 dias" },
];

export default function TrustSignals() {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-4 px-6 pt-2 pb-4 sm:gap-8 sm:px-20">
      {SIGNALS.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon className="size-4 shrink-0 text-(--color-text-secondary)" />
          <span className="text-body-sm text-(--color-text-secondary)">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
