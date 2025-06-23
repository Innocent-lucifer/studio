import React from 'react';
import Link from 'next/link';
import { AppLogo } from '@/components/AppLogo';

export default function Header({ scrolled, menuOpen, toggleMenu, navLinks }) {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">SagePostAI</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href} onClick={link.onClick} className="font-medium text-gray-600 hover:text-indigo-600 transition">
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline-block font-medium text-gray-600 hover:text-indigo-600 transition">
                Log In
            </Link>
            <Link href="/dashboard" className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
                Get Started Free
            </Link>
            <button onClick={toggleMenu} className="md:hidden text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map(link => (
                 <Link key={link.name} href={link.href} onClick={(e) => { toggleMenu(); if (link.onClick) link.onClick(e); }} className="font-medium text-gray-600 hover:text-indigo-600 transition text-center">
                  {link.name}
                </Link>
              ))}
                <Link href="/login" onClick={toggleMenu} className="font-medium text-gray-600 hover:text-indigo-600 transition text-center">
                    Log In
                </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
