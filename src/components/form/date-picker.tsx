"use client";

import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PickerMode = "date" | "datetime" | "time" | "multiple" | "range";

type PropsType = {
  id: string;
  mode?: PickerMode;
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode = "date",
  onChange,
  label,
  defaultDate,
  placeholder,
}: PropsType) {
  useEffect(() => {
    const isTimeOnly = mode === "time";
    const isDateTime = mode === "datetime";

    const instance = flatpickr(`#${id}`, {
      mode: mode === "multiple" || mode === "range" ? mode : "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: isTimeOnly ? "H:i" : isDateTime ? "Y-m-d H:i" : "Y-m-d",
      enableTime: isTimeOnly || isDateTime,
      noCalendar: isTimeOnly,
      time_24hr: true,
      defaultDate,
      onChange,
    });

    return () => {
      if (!Array.isArray(instance)) {
        instance.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={
            placeholder ||
            (mode === "time"
              ? "Цаг сонгох"
              : mode === "datetime"
                ? "Огноо, цаг сонгох"
                : "Огноо сонгох")
          }
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
