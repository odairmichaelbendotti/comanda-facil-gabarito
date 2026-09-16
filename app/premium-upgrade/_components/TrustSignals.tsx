import { LuCalendarCheck, LuLock, LuShieldCheck } from "react-icons/lu";

const SIGNALS = [
  { icon: LuLock, label: "Pagamento seguro via Stripe" },
  { icon: LuCalendarCheck, label: "Cancele quando quiser" },
  { icon: LuShieldCheck, label: "Garantia de reembolso de 7 dias" },
];

export default function TrustSignals() {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-6 px-6 pt-6 pb-8 sm:gap-12 sm:px-20">
      {SIGNALS.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon className="size-4.5 shrink-0 text-(--color-text-secondary)" />
          <span className="text-body-md text-(--color-text-secondary)">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
