
"use client";

import * as React from "react";
import { Check, Languages } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

export function LanguageSwitcher() {
  const [open, setOpen] = React.useState(false);
  // This is now just a local state for the UI demo.
  // It will be replaced with real logic later.
  const [currentLocale, setCurrentLocale] = React.useState("en");

  const selectedLanguage = languages.find((lang) => lang.value === currentLocale);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[150px] justify-between bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-100"
        >
          <Languages className="mr-2 h-4 w-4" />
          {selectedLanguage ? selectedLanguage.label : "Select language..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[150px] p-0 bg-slate-800 border-slate-700 text-white">
        <Command>
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={(currentValue) => {
                    setCurrentLocale(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentLocale === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
