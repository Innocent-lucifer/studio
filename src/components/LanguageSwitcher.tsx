"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Globe, Check } from "lucide-react";
import { usePathname } from '@/navigation';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/navigation";

const languages = [
  { value: "en", label: "English", short: "EN" },
  { value: "es", label: "Español", short: "ES" },
];

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();

  const currentLanguage = languages.find((lang) => lang.value === currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="w-auto h-auto px-3 py-2 bg-background/50 border-border hover:bg-secondary/70 group"
        >
          <Globe className="h-5 w-5 text-foreground/70 group-hover:text-primary transition-colors" />
          {currentLanguage && <span className="ml-2 font-semibold text-sm">{currentLanguage.short}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] bg-secondary border-border text-foreground">
        {languages.map((language) => (
          <Link
            href={pathname}
            locale={language.value}
            key={language.value}
            passHref
          >
            <DropdownMenuItem className="cursor-pointer hover:!bg-primary/20 focus:!bg-primary/20">
              <span className="flex-grow">{language.label} ({language.short})</span>
              <Check
                className={cn(
                  "ml-2 h-4 w-4 text-primary",
                  currentLocale === language.value ? "opacity-100" : "opacity-0"
                )}
              />
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}