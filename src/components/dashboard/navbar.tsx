import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Store, LayoutDashboard } from "lucide-react";

export function Navbar() {
    return (
        <header className="border-b bg-white h-16 shadow-sm">
            <div className="grid grid-cols-4 items-center h-full px-6 gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-sky-600 p-1.5 rounded-lg">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden lg:block">
                        SaaS<span className="text-sky-600">Admin</span>
                    </span>
                </div>

                <div className="flex items-center border-l pl-4">
                    <Select defaultValue="bg">
                        <SelectTrigger className="w-full max-w-50 border-none bg-slate-50 hover:bg-slate-100 transition focus:ring-0">
                            <Store className="h-4 w-4 mr-2 text-sky-600" />
                            <div className="text-left overflow-hidden">
                                <SelectValue placeholder="Lokacija" />
                            </div>
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="bg">Magacin Beograd</SelectItem>
                            <SelectItem value="ns">Magacin Novi Sad</SelectItem>
                            <SelectItem value="ni">Magacin Niš</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Pretraži sistem..."
                        className="pl-8 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-sky-500 w-full"
                    />
                </div>

                <div className="flex items-center justify-end gap-3">
                    <div className="flex-col text-right hidden sm:flex">
                        <span className="text-md font-bold leading-none">Marko Marković</span>
                        <span className="text-[10px] text-sky-600 font-bold uppercase mt-1">Super Admin</span>
                    </div>

                    <Avatar className="h-9 w-9 border-2 border-sky-100">
                        <AvatarFallback className="bg-sky-500 text-white font-bold">MM</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
