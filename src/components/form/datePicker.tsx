"use client";

import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import type { Instance } from "flatpickr/dist/types/instance";
import "flatpickr/dist/flatpickr.min.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import type { Hook, DateOption } from "flatpickr/dist/types/options";

type PropsType = {
  id?: string;
  mode?: "single" | "multiple" | "range";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  minDate?: DateOption;
  maxDate?: DateOption;
  value?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
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
  size = "md",
}: PropsType) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fpRef = useRef<Instance | null>(null);

  const sizeClassMap = {
    sm: "fp-sm",
    md: "fp-md",
    lg: "fp-lg",
  };

  const inputSizeMap = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm",
    lg: "h-11 text-base",
  };

  useEffect(() => {
    if (!inputRef.current) return;

    fpRef.current = flatpickr(inputRef.current, {
      mode,
      monthSelectorType: "static",
      defaultDate,
      minDate,
      maxDate,
      onChange,
      altInput: false,
      altFormat: "Y-m-d",
      dateFormat: "Y-m-d",
      appendTo: document.body,
      position: "auto",
      onReady: function (_, __, instance) {
        Object.values(sizeClassMap).forEach((cls) =>
          instance.calendarContainer.classList.remove(cls)
        );
        instance.calendarContainer.classList.add(sizeClassMap[size]);
      },
    });

    return () => {
      fpRef.current?.destroy();
      fpRef.current = null;
    };
  }, [mode, onChange, defaultDate, minDate, maxDate, size]);

  useEffect(() => {
    if (!fpRef.current) return;
    if (value !== undefined) {
      fpRef.current.setDate(value, false);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-transparent px-2 py-1 pr-10 ${inputSizeMap[size]} text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30`}
          readOnly
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <CalenderIcon
            className={size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5"}
          />
        </span>
      </div>
    </div>
  );
}
