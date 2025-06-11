"use client"

import { X, Plus, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  selected: string[];
  setSelected: (selected: string[]) => void;
  options: Option[];
  placeholder?: string;
  allowCustomOptions?: boolean;
  className?: string;
}

export function MultiSelect({
  selected,
  setSelected,
  options,
  placeholder = "Chọn các tùy chọn...",
  allowCustomOptions = false,
  className,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on input value and already selected items
  const filteredOptions = options.filter(
    (option) =>
      !(selected || []).includes(option.value) &&
      option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleAddOption = (value: string) => {
    // Đảm bảo selected là một mảng
    const currentSelected = selected || [];
    if (!currentSelected.includes(value)) {
      setSelected([...currentSelected, value]);
      setInputValue("");
    }
  };

  const handleRemoveOption = (value: string) => {
    // Đảm bảo selected là một mảng
    const currentSelected = selected || [];
    setSelected(currentSelected.filter((item) => item !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();

      // Check if inputValue matches an existing option
      const matchingOption = options.find(
        option => option.label.toLowerCase() === inputValue.toLowerCase()
      );

      if (matchingOption) {
        handleAddOption(matchingOption.value);
      } else if (allowCustomOptions) {
        // Add custom option
        handleAddOption(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && (selected || []).length > 0) {
      // Remove the last selected option when backspace is pressed and input is empty
      const currentSelected = selected || [];
      handleRemoveOption(currentSelected[currentSelected.length - 1]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div
        className="flex flex-wrap items-center gap-1 min-h-10 p-1 border rounded-md focus-within:ring-1 focus-within:ring-ring"
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
      >
        {(selected || []).map((value) => {
          // Find matching option or create custom label
          const option = options.find(opt => opt.value === value);
          const label = option ? option.label : value;

          return (
            <span
              key={value}
              className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded"
            >
              {label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveOption(value);
                }}
                className="text-primary/50 hover:text-primary focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm px-1 py-1"
          placeholder={(selected || []).length === 0 ? placeholder : ""}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto bg-popover border rounded-md shadow-md z-10">
          {filteredOptions.length > 0 ? (
            <div className="p-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handleAddOption(option.value);
                    inputRef.current?.focus();
                  }}
                  className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                >
                  {option.label}
                  <Check className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          ) : (
            allowCustomOptions && inputValue ? (
              <button
                className="flex items-center gap-1 w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  handleAddOption(inputValue);
                  inputRef.current?.focus();
                }}
              >
                <Plus className="h-3 w-3" />
                Thêm &quot;{inputValue}&quot;
              </button>
            ) : (
              <div className="p-2 text-sm text-muted-foreground">
                {allowCustomOptions
                  ? "Nhập để thêm tùy chọn mới"
                  : "Không có tùy chọn nào"}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}