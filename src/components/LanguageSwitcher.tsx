"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages, Check } from "lucide-react";
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
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const currentLocale = useLocale();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[150px] justify-between bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 hover:text-slate-100"
        >
          {languages.find((lang) => lang.value === currentLocale)?.label}
          <Languages className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[150px] bg-slate-800 border-slate-700 text-white">
        {languages.map((language) => (
          <Link
            href={pathname}
            locale={language.value}
            key={language.value}
            passHref
          >
            <DropdownMenuItem className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700">
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  currentLocale === language.value ? "opacity-100" : "opacity-0"
                )}
              />
              {language.label}
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}