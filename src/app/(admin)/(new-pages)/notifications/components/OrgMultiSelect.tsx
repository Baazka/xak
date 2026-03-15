"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

type OrgItem = {
  org_id: number;
  org_legal_name: string;
  org_register_no?: string;
};

type Props = {
  orgs: OrgItem[];
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function OrgMultiSelect({
  orgs,
  value,
  onChange,
  placeholder = "Байгууллага сонгох",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const selectedItems = useMemo(
    () => orgs.filter((org) => value.includes(org.org_id)),
    [orgs, value]
  );

  const toggleItem = (orgId: number) => {
    if (value.includes(orgId)) {
      onChange(value.filter((id) => id !== orgId));
    } else {
      onChange([...value, orgId]);
    }
  };

  const removeItem = (orgId: number) => {
    onChange(value.filter((id) => id !== orgId));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="flex w-full min-h-10 items-center justify-between rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="truncate text-left">
              {selectedItems.length > 0
                ? `${selectedItems.length} байгууллага сонгосон`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="z-[1100] w-[460px] max-w-[80vw] p-0">
          <Command>
            <CommandInput placeholder="Байгууллага хайх..." />
            <CommandList>
              <CommandEmpty>Илэрц олдсонгүй</CommandEmpty>
              <CommandGroup>
                {orgs.map((org) => {
                  const checked = value.includes(org.org_id);

                  return (
                    <CommandItem
                      key={org.org_id}
                      value={`${org.org_legal_name} ${org.org_register_no ?? ""}`}
                      onSelect={() => toggleItem(org.org_id)}
                      className="flex items-start gap-2 py-2"
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-4 w-4 items-center justify-center rounded border",
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </div>

                      <div className="flex flex-col">
                        <span>{org.org_legal_name}</span>
                        {org.org_register_no && (
                          <span className="text-xs text-muted-foreground">
                            РД: {org.org_register_no}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            {value.length > 0 && (
              <div className="border-t p-2">
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={disabled}
                  className="w-full rounded-md px-3 py-2 text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                >
                  Цэвэрлэх
                </button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((org) => (
            <span
              key={org.org_id}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-1 py-1 text-sm"
            >
              <span className="max-w-[220px] truncate">{org.org_legal_name}</span>
              <Button
                type="button"
                disabled={disabled}
                onClick={() => removeItem(org.org_id)}
                className="rounded-full hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-50 text-sm"
              >
                <X />
              </Button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
