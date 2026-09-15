"use client";

import { ComponentType, useId, useState } from "react";
import { IMaskInput } from "react-imask";
import { getInputStateClasses } from "./Input";

// react-imask's mask prop type is a large discriminated union that can't be
// satisfied generically when the mask config is picked at runtime by `type`.
const MaskedIMaskInput = IMaskInput as unknown as ComponentType<
  Record<string, unknown>
>;

export type MaskedFieldType = "phone" | "cpf" | "cnpj" | "cep" | "date" | "currency";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isValidCpf(digits: string) {
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const calcDigit = (base: string) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * (base.length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  const d1 = calcDigit(digits.slice(0, 9));
  const d2 = calcDigit(digits.slice(0, 9) + d1);
  return digits === digits.slice(0, 9) + String(d1) + String(d2);
}

function isValidCnpj(digits: string) {
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  const calcDigit = (base: string) => {
    const weights =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += Number(base[i]) * weights[i];
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const d1 = calcDigit(digits.slice(0, 12));
  const d2 = calcDigit(digits.slice(0, 12) + d1);
  return digits === digits.slice(0, 12) + String(d1) + String(d2);
}

function isValidCalendarDate(digits: string) {
  if (digits.length !== 8) return false;
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

interface FieldConfig {
  mask: unknown;
  imaskProps?: Record<string, unknown>;
  placeholder: string;
  prefix?: string;
  isLengthOk: (digits: string) => boolean;
  isValid: (digits: string) => boolean;
  incompleteMessage: string;
  invalidMessage: string;
}

const fieldConfig: Record<MaskedFieldType, FieldConfig> = {
  phone: {
    mask: [{ mask: "(00) 0000-0000" }, { mask: "(00) 00000-0000" }],
    placeholder: "(00) 00000-0000",
    isLengthOk: (digits) => digits.length === 10 || digits.length === 11,
    isValid: () => true,
    incompleteMessage: "Telefone incompleto",
    invalidMessage: "Telefone inválido",
  },
  cpf: {
    mask: "000.000.000-00",
    placeholder: "000.000.000-00",
    isLengthOk: (digits) => digits.length === 11,
    isValid: isValidCpf,
    incompleteMessage: "CPF incompleto",
    invalidMessage: "CPF inválido",
  },
  cnpj: {
    mask: "00.000.000/0000-00",
    placeholder: "00.000.000/0000-00",
    isLengthOk: (digits) => digits.length === 14,
    isValid: isValidCnpj,
    incompleteMessage: "CNPJ incompleto",
    invalidMessage: "CNPJ inválido",
  },
  cep: {
    mask: "00000-000",
    placeholder: "00000-000",
    isLengthOk: (digits) => digits.length === 8,
    isValid: () => true,
    incompleteMessage: "CEP incompleto",
    invalidMessage: "CEP inválido",
  },
  date: {
    mask: "00/00/0000",
    placeholder: "dd/mm/aaaa",
    isLengthOk: (digits) => digits.length === 8,
    isValid: isValidCalendarDate,
    incompleteMessage: "Data incompleta",
    invalidMessage: "Data inválida",
  },
  currency: {
    mask: Number,
    imaskProps: {
      scale: 2,
      radix: ",",
      thousandsSeparator: ".",
      padFractionalZeros: true,
      normalizeZeros: true,
      min: 0,
    },
    placeholder: "0,00",
    prefix: "R$",
    isLengthOk: () => true,
    isValid: () => true,
    incompleteMessage: "Valor incompleto",
    invalidMessage: "Valor inválido",
  },
};

interface MaskedInputProps {
  type: MaskedFieldType;
  label: string;
  defaultValue?: string;
  onValueChange?: (rawValue: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export default function MaskedInput({
  type,
  label,
  defaultValue = "",
  onValueChange,
  required = false,
  disabled = false,
  className = "",
  id,
  name,
}: MaskedInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const config = fieldConfig[type];

  const [rawValue, setRawValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);

  const digits = onlyDigits(rawValue);
  const isEmpty = digits.length === 0;

  let errorMessage: string | undefined;
  if (touched) {
    if (isEmpty) {
      if (required) errorMessage = "Campo obrigatório";
    } else if (!config.isLengthOk(digits)) {
      errorMessage = config.incompleteMessage;
    } else if (!config.isValid(digits)) {
      errorMessage = config.invalidMessage;
    }
  }

  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={inputId}
        className="text-label-md font-semibold text-[color:var(--color-text-primary)]"
      >
        {label}
      </label>
      <div className="relative">
        {config.prefix && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-body-md text-[color:var(--color-text-tertiary)]">
            {config.prefix}
          </span>
        )}
        <MaskedIMaskInput
          id={inputId}
          name={name}
          mask={config.mask}
          {...(config.imaskProps ?? {})}
          disabled={disabled}
          placeholder={config.placeholder}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
          onAccept={(_value: unknown, maskRef: { unmaskedValue: string }) => {
            setRawValue(maskRef.unmaskedValue);
            onValueChange?.(maskRef.unmaskedValue);
          }}
          onBlur={() => setTouched(true)}
          className={`w-full rounded-md px-3.5 py-3 text-body-md text-[color:var(--color-text-primary)] outline-none transition-colors duration-150 motion-reduce:transition-none placeholder:text-[color:var(--color-text-tertiary)] disabled:cursor-not-allowed disabled:opacity-70 ${
            config.prefix ? "pl-9.5" : ""
          } ${getInputStateClasses(!!errorMessage)}`}
        />
      </div>
      {errorMessage && (
        <p
          id={`${inputId}-error`}
          className="text-body-sm text-[color:var(--color-status-danger-text)]"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
