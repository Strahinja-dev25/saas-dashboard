import { ShieldAlert, LogOut } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function DriverPortal() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-8 text-center space-y-6 shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="h-8 w-8 text-red-500" />
                </div>
                
                <h1 className="text-2xl font-bold text-white">Access Denied</h1>
                
                <div className="space-y-2 text-slate-300">
                    <p>Driver Portal is currently under construction.</p>
                    <p className="text-sm">This account is registered as a Driver and does not have access to the main dashboard.</p>
                </div>

                <div className="pt-6 border-t border-slate-700">
                    <SignOutButton>
                        <Button variant="outline" className="w-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-600">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </SignOutButton>
                </div>
            </div>
        </div>
    );
}
