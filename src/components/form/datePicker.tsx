"use client";

import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import type { Hook, DateOption, Instance } from "flatpickr/dist/types/options";

type PropsType = {
  id?: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  minDate?: DateOption;
  maxDate?: DateOption;
  value?: string;
  name?: string;
};

export default function DatePicker({
  id,
  mode = "single",
  onChange,
  label,
  defaultDate,
  placeholder,
  minDate,
  maxDate,
  value,
  name,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fpRef = useRef<Instance | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    fpRef.current = flatpickr(inputRef.current, {
      mode: mode === "time" ? "single" : mode,
      static: true,
      monthSelectorType: "static",
      defaultDate,
      minDate,
      maxDate,
      onChange,
      altInput: mode !== "time",
      altFormat: mode === "time" ? "H:i" : "Y-m-d",
      dateFormat: mode === "time" ? "H:i" : "Y-m-d",
      enableTime: mode === "time",
      noCalendar: mode === "time",
      time_24hr: true,
    });

    return () => {
      fpRef.current?.destroy();
      fpRef.current = null;
    };
  }, [mode, onChange, defaultDate, minDate, maxDate]);

  useEffect(() => {
    if (!fpRef.current) return;
    if (value !== undefined) {
      fpRef.current.setDate(value, false);
    }
  }, [value]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          readOnly
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
