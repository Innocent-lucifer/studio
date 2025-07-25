
"use client";
import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { Check, Languages } from "lucide-react";
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
  const t = useTranslations('LanguageSwitcher');
  const [open, setOpen] = React.useState(false);
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 hover:text-slate-100"
        >
          {languages.find((lang) => lang.value === currentLocale)?.label}
          <Languages className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-slate-800 border-slate-700 text-white">
        <Command>
          <CommandInput placeholder={t('changeLanguage')} className="border-slate-700"/>
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  onSelect={() => {
                    router.replace(
                      // The `pathname` is the path without the locale (e.g. `/about-team`)
                      // The `searchParams` are the current search params (e.g. `?foo=bar`)
                      // The `locale` is the new locale to switch to (e.g. `es`)
                      { pathname, params: searchParams },
                      { locale: language.value }
                    );
                    setOpen(false);
                  }}
                  className="hover:bg-slate-700 aria-selected:bg-slate-700"
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
