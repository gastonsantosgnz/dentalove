"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { OTPInput, SlotProps } from "input-otp";
import { useId } from "react";
import React from "react";

interface OTPInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
}

type OTPInputSlotProps = {
  char: string | null;
  isActive: boolean;
  hasFakeCaret: boolean;
  error?: string;
};

export function OTPInputField({ value, onChange, disabled, label, error }: OTPInputFieldProps) {
  const id = useId();

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <OTPInput
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        containerClassName={cn(
          "flex items-center gap-2 has-[:disabled]:opacity-50",
          error && "border-red-500"
        )}
        maxLength={6}
        render={({ slots }) => (
          <div className="flex gap-2">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} error={error} />
            ))}
          </div>
        )}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

const Slot = ({ char, isActive, hasFakeCaret, error }: OTPInputSlotProps) => {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white font-medium text-gray-900 shadow-sm transition-all",
        "focus-within:border-[#0c7d74] focus-within:ring-1 focus-within:ring-[#0c7d74]",
        {
          "border-[#0c7d74] ring-1 ring-[#0c7d74]": isActive,
          "border-red-500 ring-1 ring-red-500": !!error
        }
      )}
    >
      {char !== null && char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-caret-blink">
          <div className="h-4 w-px bg-[#0c7d74] duration-150" />
        </div>
      )}
    </div>
  );
}; 