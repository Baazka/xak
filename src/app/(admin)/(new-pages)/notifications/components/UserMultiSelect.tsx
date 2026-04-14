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

type UserItem = {
  user_id: number;
  user_firstname: string;
  user_phone: string;
  user_email: string;
  org_legal_name?: string;
  org_register_no?: string;
};

type Props = {
  users: UserItem[];
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function UserMultiSelect({
  users,
  value,
  onChange,
  placeholder = "Хэрэглэгч сонгох",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const selectedItems = useMemo(
    () => users.filter((user) => value.includes(user.user_id)),
    [users, value]
  );

  const toggleItem = (userId: number) => {
    if (disabled) return;

    if (value.includes(userId)) {
      onChange(value.filter((id) => id !== userId));
    } else {
      onChange([...value, userId]);
    }
  };

  const removeItem = (userId: number) => {
    if (disabled) return;
    onChange(value.filter((id) => id !== userId));
  };

  const clearAll = () => {
    if (disabled) return;
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
            <span
              className={cn(
                "truncate text-left",
                selectedItems.length > 0
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-400 dark:text-gray-500"
              )}
            >
              {selectedItems.length > 0
                ? `${selectedItems.length} хэрэглэгч сонгосон`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="z-[1100] w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0"
        >
          <Command>
            <CommandInput placeholder="Хэрэглэгч хайх..." />
            <CommandList className="max-h-72 overflow-y-auto">
              <CommandEmpty>Илэрц олдсонгүй</CommandEmpty>
              <CommandGroup>
                {users.map((user) => {
                  const checked = value.includes(user.user_id);

                  return (
                    <CommandItem
                      key={user.user_id}
                      value={`${user.user_firstname} ${user.user_email} ${user.user_phone} ${user.org_legal_name}`}
                      onSelect={() => toggleItem(user.user_id)}
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
                        <span>{user.user_firstname}</span>
                        {user.user_email && (
                          <span className="text-xs text-muted-foreground">
                            И-мэйл: {user.user_email}
                          </span>
                        )}
                        {user.user_phone && (
                          <span className="text-xs text-muted-foreground">
                            Утас: {user.user_phone}
                          </span>
                        )}
                        {user.org_legal_name && (
                          <span className="text-xs text-muted-foreground">
                            Байгууллага: {user.org_legal_name}
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
                  className="
  w-full rounded-md px-3 py-2 text-sm text-gray-600
  hover:bg-gray-100
  dark:text-gray-300 dark:hover:bg-gray-800
  disabled:pointer-events-none disabled:opacity-50
"
                >
                  Цэвэрлэх
                </button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((user) => (
            <span
              key={user.user_id}
              className="
    inline-flex items-center gap-1.5 rounded-full
    bg-gray-100 px-2 py-1 text-sm text-gray-800
    dark:bg-gray-800 dark:text-gray-100
  "
            >
              <span className="max-w-[220px] truncate">{user.user_firstname}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={disabled}
                onClick={() => removeItem(user.user_id)}
                className="
    ml-1 h-5 w-5 rounded-full p-0
    text-gray-500 hover:text-gray-700 hover:bg-gray-200
    dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700
  "
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
