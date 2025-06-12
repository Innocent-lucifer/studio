
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
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export function HamburgerMenu() {
  const { toast } = useToast();
  const { user, logOut, loading } = useAuth(); // Get user and logOut from AuthContext

  const handleMenuItemClick = (featureName: string) => {
    toast({
      title: "Feature Coming Soon!",
      description: `${featureName} functionality will be implemented in a future update.`,
    });
    console.log(`${featureName} clicked`);
  };

  const handleSignOut = async () => {
    await logOut();
    // Toast for sign out is handled in AuthContext
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icons.menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-slate-200">
        <DropdownMenuLabel className="text-slate-400">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        {user && (
          <>
            <DropdownMenuItem onSelect={() => handleMenuItemClick("Credits & Plan")} className="hover:bg-slate-700 focus:bg-slate-700">
              <Icons.creditCard className="mr-2 h-4 w-4 text-primary" />
              <span>Credits & Plan</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleMenuItemClick("Settings")} className="hover:bg-slate-700 focus:bg-slate-700">
              <Icons.settings className="mr-2 h-4 w-4 text-primary" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700"/>
            <DropdownMenuItem onSelect={handleSignOut} disabled={loading} className="hover:bg-slate-700 focus:bg-slate-700">
              <Icons.logOut className="mr-2 h-4 w-4 text-red-400" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </>
        )}
        {!user && (
          <DropdownMenuItem 
            onSelect={() => {
              // Navigation to login/signup page is handled by the main page logic
              // This option can be removed or repurposed if login is always on main page
               toast({ title: "Authentication", description: "Please use the form on the main page to log in or sign up." });
            }} 
            className="hover:bg-slate-700 focus:bg-slate-700"
          >
            <Icons.logIn className="mr-2 h-4 w-4 text-primary" />
            <span>Login / Sign Up</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
