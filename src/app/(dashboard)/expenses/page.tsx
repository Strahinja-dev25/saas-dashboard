import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, Fuel, Wrench, ReceiptText, Trash2, ArrowUpDown } from "lucide-react";

import Link from "next/link";
import { Search } from "@/components/dashboard/search";
import { ExpenseModal } from "@/components/expenses/expense-modal";

import { ExpenseService } from "@/services/expenses/expense-service";
import { TruckService } from "@/services/fleet/truck-service";
import { LoadService } from "@/services/loads/load-service";
import { deleteExpense } from "@/lib/actions";

interface PageProps {
    searchParams: Promise<{ 
        query?: string;
        page?: string;
        sort?: string;
        order?: string;
    }>;
}

export default async function ExpensesPage({ searchParams }: PageProps) {
    const ITEMS_PER_PAGE = 20;
    
    const params = await searchParams;
    const query = params.query || "";
    const currentPage = Number(params.page) || 1;

    const sortBy = params.sort || "date";
    const sortOrder = (params.order as "asc" | "desc") || "desc";

    const [stats, { expenses, totalPages }, trucks, { loads }] = await Promise.all([
        ExpenseService.getExpenseStats(),
        ExpenseService.getExpenses(query, currentPage, 20, sortBy, sortOrder),
        TruckService.getTrucksForDropdown(), // Za Modal
        LoadService.getActiveLoads("", 1, 100) // Vucemo sve aktivne ture za Modal
    ]);

    const activeLoadsForModal = loads.map(load => ({
        id: load.id,
        truckId: load.truckId
    }));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Fuel & Tolls</h2>
                    <p className="text-muted-foreground">Manage fleet operating expenses and sync card data.</p>
                </div>

                <Search placeholder="Search vendor or truck..." />

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 font-semibold">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Fleet Card Data
                    </Button>
                    
                    {/* Modal */}
                    <ExpenseModal trucks={trucks} loads={activeLoadsForModal} />
                </div>
            </div>

            <hr />

            {/* Statistika */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses (This Month)</CardTitle>
                        <ReceiptText className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Fuel Costs</CardTitle>
                        <Fuel className="h-4 w-4 text-sky-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sky-700">${stats.fuelCosts.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Maintenance & Tolls</CardTitle>
                        <Wrench className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">${stats.maintAndTolls.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela troskova */}
            <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-24 text-center font-bold text-[11px] uppercase">ID</TableHead>
                            <TableHead className="w-32 text-center font-bold">
                                <Link href={`?query=${query}&page=${currentPage}&sort=date&order=${sortOrder === 'asc' ? 'desc' : 'asc'}`} className="flex items-center justify-center gap-1 hover:text-sky-600 transition-colors">
                                    Date <ArrowUpDown className="h-3 w-3" />
                                </Link>
                            </TableHead>
                            <TableHead className="w-32 text-center font-bold">Truck</TableHead>
                            <TableHead className="w-40 text-center font-bold">Category</TableHead>
                            <TableHead className="w-40 text-center font-bold">Vendor / Location</TableHead>
                            <TableHead className="w-40 text-center font-bold">Linked Load</TableHead>
                            <TableHead className="w-32 text-center font-bold">
                                <Link href={`?query=${query}&page=${currentPage}&sort=amount&order=${sortOrder === 'asc' ? 'desc' : 'asc'}`} className="flex items-center justify-center gap-1 hover:text-sky-600 transition-colors">
                                    Amount <ArrowUpDown className="h-3 w-3" />
                                </Link>
                            </TableHead>
                            <TableHead className="w-16 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {expenses.map((expense) => (
                            <TableRow key={expense.id} className="trasitions-colors">
                                <TableCell className="text-center font-mono text-xs">#{expense.id.slice(-6).toUpperCase()}</TableCell>
                                <TableCell className="text-center text-sm">
                                    {new Date(expense.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-center font-bold text-sky-700">{expense.truck.unitNumber}</TableCell>
                                
                                <TableCell className="text-center">
                                    {expense.type === "FUEL" && <span className="flex items-center w-max gap-1.5 text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded mx-auto"><Fuel className="h-3 w-3"/> Fuel</span>}
                                    {expense.type === "TOLL" && <span className="flex items-center w-max gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded mx-auto"><ReceiptText className="h-3 w-3"/> Toll</span>}
                                    {expense.type === "MAINTENANCE" && <span className="flex items-center w-max gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded mx-auto"><Wrench className="h-3 w-3"/> Maint.</span>}
                                    {expense.type === "OTHER" && <span className="flex items-center w-max gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded mx-auto">Other</span>}
                                </TableCell>
                                
                                <TableCell className="text-center font-medium">{expense.vendor || "-"}</TableCell>
                                
                                <TableCell className="text-center text-xs">
                                    {expense.loadId ? (
                                        <Link href={`/loads/${expense.loadId}`} className="font-mono text-slate-500 hover:text-sky-600 hover:underline">
                                            #{expense.loadId.slice(-6).toUpperCase()}
                                        </Link>
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </TableCell>
                                
                                <TableCell className="text-center font-bold text-red-600">
                                    -${expense.amount.toFixed(2)}
                                </TableCell>

                                <TableCell className="text-center">
                                    <form action={deleteExpense.bind(null, expense.id)}>
                                        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </TableCell>
                            </TableRow>
                        ))}
                        {expenses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground italic">
                                    No expenses recorded yet. Click "Add Manual Expense" to begin.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Paginacija */}
            <div className="mt-4 flex items-center justify-center gap-2">
                <Button variant="outline" disabled={currentPage <= 1} asChild={currentPage > 1}>
                    {currentPage <= 1 ? "Previous" : <Link href={`?query=${query}&sort=${sortBy}&order=${sortOrder}&page=${currentPage - 1}`}>Previous</Link>}
                </Button>
                <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" disabled={currentPage >= totalPages} asChild={currentPage < totalPages}>
                    {currentPage >= totalPages ? "Next" : <Link href={`?query=${query}&sort=${sortBy}&order=${sortOrder}&page=${currentPage + 1}`}>Next</Link>}
                </Button>
            </div>
        </div>
    );
}
