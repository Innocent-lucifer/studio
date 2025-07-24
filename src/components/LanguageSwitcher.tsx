
"use client";

import * as React from "react";
import { Check, Languages } from "lucide-react";
import { useI18n } from "@/locales/client";
import { useRouter, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
  const { getLocale, setLocale, getScopedI18n } = useI18n();
  const currentLocale = getLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = getScopedI18n("common");

  const changeLocale = (newLocale: 'en' | 'es') => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    
    // This is a client-side transition:
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.replace(newPath);
  };

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
                    if (currentValue !== currentLocale) {
                      changeLocale(currentValue as 'en' | 'es');
                    }
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
