import { LucideIcon } from "lucide-react";
import { LoadStatus } from "@prisma/client";

// Koristi se za kartice na Dashboardu
export interface StatItem {
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
    color: string;
}

// Koristi se za veliku tabelu na Dashboardu
export interface DetailedLoadItem {
    id: string;
    amount: number;
    miles: number;
    status: LoadStatus;
    createdAt: Date;
    truck: {
        unitNumber: string;
        driver: {
            name: string;
        } | null;
    } | null;
}

// Koristi se za malu komponentu "Active Loads"
export interface ActiveLoadDashboardItem {
    id: string;
    amount: number;
    createdAt: Date;
    truck: {
        unitNumber: string;
        driver: {
            name: string;
        } | null;
    } | null;
}
