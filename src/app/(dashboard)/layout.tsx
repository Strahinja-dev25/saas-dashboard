import { Sidebar } from "@/components/dashboard/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 bg-slate-50 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}