import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />

        <main className="flex-1 bg-slate-50 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
