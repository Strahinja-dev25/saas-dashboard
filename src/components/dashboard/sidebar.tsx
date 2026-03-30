"use client"; // Ovo imamo je se koristi usePathname hook

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, Map, Users, Fuel, Settings } from "lucide-react";

const routes = [
  { label: "Overview", icon: LayoutDashboard, href: "/" },
  { label: "Fleet Status", icon: Truck, href: "/fleet" },
  { label: "Active Loads", icon: Map, href: "/loads" },
  { label: "Drivers", icon: Users, href: "/drivers" },
  { label: "Fuel & Tolls", icon: Fuel, href: "/expenses" },
  { label: "Company Profile", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 p-4">
      <div className="text-xl font-bold mb-10 px-2">
        <Truck className="text-sky-500" />
        STR4LE<span className="text-sky-500 text-sm">TMS</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        {routes.map((route) => {
          const isActive = pathname === route.href || (route.href !== "/" && pathname.startsWith(route.href));

          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center p-3 text-sm font-medium hover:bg-white/10 rounded-lg transition all ${isActive ? "bg-sky-600/20 text-sky-400" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              <route.icon className={`h-5 w-5 mr-3 ${isActive ? "text-sky-500" : "text-slate-500"}`} />
              {route.label}
          </Link>
          );
        })}
      </nav>
    </div>
  );
}
