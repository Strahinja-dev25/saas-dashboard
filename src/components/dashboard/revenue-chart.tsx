"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
  data: {
    name: string;
    total: number;
  }[];
};

export function RevenueChart ({ data }: RevenueChartProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Mesečni Prihod (Ova godina)</CardTitle>
            </CardHeader>

            <CardContent className="pl-2">
                <div className="h-78 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis 
                                dataKey="name" 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <YAxis 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(value) => `${value}€`} 
                            />
                            <Tooltip
                                formatter={(value: any) => [`${value.toLocaleString()}€`, "Prihod"]}
                                contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "4px 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                            <Bar 
                                dataKey="total" 
                                fill="#3b82f6" 
                                radius={[4, 4, 0, 0]} 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
