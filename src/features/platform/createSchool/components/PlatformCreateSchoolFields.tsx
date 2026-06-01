import type { ReactNode } from "react";
import { formatPhone10, blockNonDigitKeys } from "@/utils/phone";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5 focus-within:border-blue-500">
        {icon ? <span className="mr-2">{icon}</span> : null}
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
    </label>
  );
}

export function PhoneField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5">
        <span className="text-sm font-semibold text-gray-700">+91</span>
        <span className="mx-2 h-5 w-px bg-gray-200" />
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(formatPhone10(event.target.value))}
          onKeyDown={blockNonDigitKeys}
          maxLength={11}
          placeholder="98765 43210"
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
    </label>
  );
}

export function CountryPhoneField({
  label,
  value,
  countryCode,
  onCountryChange,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  countryCode: string;
  onCountryChange: (value: string) => void;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5">
        <select
          value={countryCode}
          onChange={(event) => onCountryChange(event.target.value)}
          className="bg-transparent text-sm font-semibold text-gray-700 outline-none"
        >
          <option value="+91">+91</option>
          <option value="+1">+1</option>
        </select>
        <span className="mx-2 h-5 w-px bg-gray-200" />
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder="98765 43210"
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm text-gray-900 outline-none"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

export function SwitchField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left",
        checked
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-gray-200 bg-white text-gray-700",
      ].join(" ")}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span
        className={[
          "inline-flex h-5 w-10 items-center rounded-full p-0.5 transition-all",
          checked ? "bg-emerald-500" : "bg-gray-300",
        ].join(" ")}
      >
        <span
          className={[
            "h-4 w-4 rounded-full bg-white transition-all",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
