"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Truck, Map, Users, Fuel, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Fleet Status", icon: Truck, href: "/fleet" },
  { label: "Active Loads", icon: Map, href: "/loads" },
  { label: "Drivers", icon: Users, href: "/drivers" },
  { label: "Fuel & Tolls", icon: Fuel, href: "/expenses" },
  { label: "Company Profile", icon: Settings, href: "/settings" },
];

export function MobileSidebar({ role = "DISPATCHER" }: { role?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden text-slate-400 hover:text-white"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Zamucena tamna pozadina */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Meni */}
          <div className="relative flex w-64 flex-col bg-slate-900 text-white p-4 h-full shadow-2xl animate-in slide-in-from-left-full duration-300">
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 text-slate-400 hover:text-white"
                onClick={() => setIsOpen(false)}
            >
                <X className="h-6 w-6" />
            </Button>

            <div className="text-xl font-bold mb-10 mt-2 px-2 flex items-center">
              <Truck className="text-sky-500 mr-2" />
              STR4LE<span className="text-sky-500 text-sm">TMS</span>
            </div>
            
            <nav className="flex-1 space-y-2">
              {routes
                .filter(route => {
                    if (route.href === "/settings" && role !== "ADMIN") return false;
                    return true;
                })
                .map((route) => {
                const isActive = pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(route.href));

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center p-3 text-sm font-medium hover:bg-white/10 rounded-lg transition all ${isActive ? "bg-sky-600/20 text-sky-400" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                  >
                    <route.icon className={`h-5 w-5 mr-3 ${isActive ? "text-sky-500" : "text-slate-500"}`} />
                    {route.label}
                </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
