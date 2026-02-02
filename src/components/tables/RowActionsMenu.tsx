"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export type RowActionItem = {
  key: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;

  custom?: React.ReactNode;
};

type Props = {
  actions: RowActionItem[];
  disabled?: boolean;

  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function RowActionsMenu({ actions, disabled, open, onOpenChange }: Props) {
  if (!actions.length) return null;

  return (
    <div className="inline-block">
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={disabled}
            aria-label="Row actions"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={8}
          className="min-w-[180px] rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-[#1E2635]"
        >
          {actions.map((a) =>
            a.custom ? (
              <DropdownMenuItem key={a.key} asChild className="p-0">
                {a.custom}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                key={a.key}
                disabled={a.disabled}
                onSelect={(e) => {
                  e.preventDefault();
                  onOpenChange(false);
                  if (!a.disabled) a.onClick?.();
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                  hover:bg-gray-50 dark:hover:bg-white/5
                  ${
                    a.variant === "danger"
                      ? "text-red-600 focus:text-red-600"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
              >
                {a.icon}
                {a.label}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
