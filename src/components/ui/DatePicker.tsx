"use client";

import React, { useRef, forwardRef } from "react";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
  className?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value = "", onChange, onBlur, name, className = "" }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null);

    const setRef = (el: HTMLInputElement | null) => {
      (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    };

    const displayValue = value ? value.split("-").reverse().join("/") : "";

    const open = () => {
      const el = innerRef.current;
      if (!el) return;
      try {
        el.showPicker();
      } catch {
        el.click();
      }
    };

    return (
      <div
        className={`relative flex items-center bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 cursor-pointer hover:border-neutral-600 focus-within:ring-1 focus-within:ring-indigo-500 ${className}`}
        onClick={open}
      >
        <span className={`flex-1 text-sm select-none ${displayValue ? "text-white" : "text-neutral-500"}`}>
          {displayValue || "dd/mm/yyyy"}
        </span>
        <Calendar className="w-4 h-4 text-neutral-500 flex-shrink-0" />
        <input
          ref={setRef}
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
