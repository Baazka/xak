"use client";

import * as React from "react";
import Input from "../form/input/InputField";

type SearchInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChange, placeholder = "Хайх..." }: SearchInputProps) {
  return (
    <Input
      placeholder={placeholder}
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-64 mb-2"
    />
  );
}
