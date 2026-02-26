"use client";

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function Search () {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);

        if (term)
            params.set("query", term);
        else
            params.delete("query");
        
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="max-w-200 relative flex flex-1 shrink-0">
            <SearchIcon className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-500" />
            <Input
                placeholder="Search unit # or driver name..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get("query")?.toString()}
            />
        </div>
    );
}
