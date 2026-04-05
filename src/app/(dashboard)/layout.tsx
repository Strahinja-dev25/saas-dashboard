import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-col flex-1 relative z-10 glass-panel ml-2 mr-2 my-2 rounded-2xl overflow-hidden">
        <Navbar />

        <main className="flex-1 bg-transparent overflow-y-auto p-8 relative">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none mix-blend-overlay"></div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
