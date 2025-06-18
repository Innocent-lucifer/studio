
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext"; 
import Link from "next/link";

export function HamburgerMenu() {
  const { toast } = useToast();
  const { user, logOut, loading } = useAuth(); 

  const handleMenuItemClick = (featureName: string) => {
    toast({
      title: "Feature Coming Soon!",
      description: `${featureName} functionality will be implemented in a future update.`,
    });
    console.log(`${featureName} clicked`);
  };

  const handleSignOut = async () => {
    await logOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icons.menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-60 md:w-80 bg-slate-800 border-slate-700 text-slate-200 md:max-h-[80vh] md:overflow-y-auto md:p-2"
      >
        <DropdownMenuLabel className="text-slate-400 text-sm md:text-base md:px-3 md:py-2">Navigation</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700 my-1 md:my-2" />
        <Link href="/" passHref>
          <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer text-sm md:text-base md:px-3 md:py-2.5">
            <Icons.home className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
            <span>Home (All Tools)</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/quick-post" passHref>
          <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer text-sm md:text-base md:px-3 md:py-2.5">
            <Icons.edit className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
            <span>Quick Post</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/visual-post" passHref>
          <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer text-sm md:text-base md:px-3 md:py-2.5">
            <Icons.image className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
            <span>Image to Post</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/smart-campaign" passHref>
            <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer text-sm md:text-base md:px-3 md:py-2.5">
                <Icons.sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span>Smart Campaign</span>
            </DropdownMenuItem>
        </Link>
        <Link href="/trends" passHref>
            <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer text-sm md:text-base md:px-3 md:py-2.5">
                <Icons.flame className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span>Trends Explorer</span>
            </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator className="bg-slate-700 my-1 md:my-2" />
        <DropdownMenuLabel className="text-slate-400 text-sm md:text-base md:px-3 md:py-2">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700 my-1 md:my-2" />
        {user && (
          <>
            <Link href="/account" passHref>
              <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer text-sm md:text-base md:px-3 md:py-2.5">
                <Icons.user className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span>My Account</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuGroup>
                <DropdownMenuItem className="text-slate-400 text-xs md:text-sm md:px-3 md:py-1.5 pointer-events-none">
                    <Icons.creditCard className="mr-2 h-4 w-4 md:h-5 md:w-5 text-slate-500" />
                    <span>Credits: N/A (Coming Soon)</span>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            {/* <DropdownMenuItem onSelect={() => handleMenuItemClick("Settings")} className="hover:bg-slate-700 focus:bg-slate-700 text-sm md:text-base md:px-3 md:py-2.5">
              <Icons.settings className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span>Settings</span>
            </DropdownMenuItem> */}
            <DropdownMenuSeparator className="bg-slate-700 my-1 md:my-2"/>
            <DropdownMenuItem onSelect={handleSignOut} disabled={loading} className="hover:bg-slate-700 focus:bg-slate-700 text-sm md:text-base md:px-3 md:py-2.5">
              <Icons.logOut className="mr-2 h-4 w-4 md:h-5 md:w-5 text-red-400" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </>
        )}
        {!user && (
          <DropdownMenuItem 
            onSelect={() => {
               toast({ title: "Authentication", description: "Please use the form on the main page to log in or sign up." });
            }} 
            className="hover:bg-slate-700 focus:bg-slate-700 text-sm md:text-base md:px-3 md:py-2.5"
          >
            <Icons.logIn className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
            <span>Login / Sign Up</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
