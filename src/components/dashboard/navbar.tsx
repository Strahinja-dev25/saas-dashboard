import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Store, LayoutDashboard } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import { DashboardService } from "@/services/dashboard-service";

export async function Navbar() {
    const companyInfo = await DashboardService.getCompanyInfo();

    return (
        <header className="border-b bg-background h-16 shadow-sm">
            <div className="grid grid-cols-4 items-center h-full px-6 gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-sky-600 p-1.5 rounded-lg">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl hidden lg:block">
                        <p className="text-sm font-medium text-slate-500">
                            Company: <span className="text-sky-600 font-bold">{companyInfo?.name || "Independent Fleet"}</span>
                        </p>
                    </span>
                </div>

                <div className="flex items-center border-l pl-4">
                    <Select defaultValue="chi">
                        <SelectTrigger className="w-full max-w-55 border-none bg-slate-50 hover:bg-slate-100 transition focus:ring-0">
                            <Store className="h-4 w-4 mr-2 text-sky-600" />
                            <div className="text-left overflow-hidden">
                                <SelectValue placeholder="Lokacija" />
                            </div>
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="chi">Chicago Terminal (HQ)</SelectItem>
                            <SelectItem value="dal">Dallas Hub</SelectItem>
                            <SelectItem value="atl">Atlanta Hub</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Global Command Search..."
                        className="pl-8 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-sky-500 w-full"
                    />
                </div>

                <div className="flex items-center justify-end gap-3">
                    <ThemeToggle />

                    <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                    <div className="flex-col text-right hidden sm:flex">
                        <span className="text-sm font-bold leading-none">System Admin</span>
                        <span className="text-[10px] text-sky-600 font-bold uppercase mt-1">Authorized</span>
                    </div>

                    <div className="h-9 w-9 rounded-full border-2 border-sky-100 flex items-center justify-center hover:scale-105 transition-transform">
                        <UserButton />
                    </div>
                </div>
            </div>
        </header>
    );
}
