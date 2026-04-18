import { useState, useMemo } from "react";
import { Banknote, FileText, FileSpreadsheet, ChevronLeft, ChevronRight, Pencil, Trash2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SalaryEntry {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  salaryPeriod: string;
  netSalary: number;
  paidSalary: number;
  remarks: string;
  paidBy: string;
}

const demoData: SalaryEntry[] = [
  { id: "1", date: "2025-03-01", employeeId: "EMP-001", employeeName: "Rahim Uddin", salaryPeriod: "March 2025", netSalary: 25000, paidSalary: 25000, remarks: "Full month", paidBy: "Admin" },
  { id: "2", date: "2025-03-01", employeeId: "EMP-002", employeeName: "Karim Hossain", salaryPeriod: "March 2025", netSalary: 18000, paidSalary: 18000, remarks: "Full month", paidBy: "Admin" },
  { id: "3", date: "2025-03-05", employeeId: "EMP-003", employeeName: "Jamal Ahmed", salaryPeriod: "March 2025", netSalary: 15000, paidSalary: 12000, remarks: "Advance deducted", paidBy: "Manager" },
  { id: "4", date: "2025-02-28", employeeId: "EMP-004", employeeName: "Nasir Uddin", salaryPeriod: "February 2025", netSalary: 20000, paidSalary: 20000, remarks: "Full month", paidBy: "Admin" },
  { id: "5", date: "2025-02-28", employeeId: "EMP-005", employeeName: "Salam Mia", salaryPeriod: "February 2025", netSalary: 22000, paidSalary: 22000, remarks: "Full month", paidBy: "Admin" },
];

export default function SalarySheetPage() {
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [payrollType, setPayrollType] = useState("all");
  const [period, setPeriod] = useState("all");
  const [employee, setEmployee] = useState("all");
  const [paidByFilter, setPaidByFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    return demoData.filter((e) => {
      const matchesSearch =
        e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        e.salaryPeriod.toLowerCase().includes(search.toLowerCase());
      const matchesPeriod = period === "all" || e.salaryPeriod === period;
      const matchesEmployee = employee === "all" || e.employeeId === employee;
      const matchesPaidBy = paidByFilter === "all" || e.paidBy === paidByFilter;
      const matchesFrom = !fromDate || e.date >= fromDate;
      const matchesTo = !toDate || e.date <= toDate;
      return matchesSearch && matchesPeriod && matchesEmployee && matchesPaidBy && matchesFrom && matchesTo;
    });
  }, [search, period, employee, paidByFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  const totalNet = filtered.reduce((s, e) => s + e.netSalary, 0);
  const totalPaid = filtered.reduce((s, e) => s + e.paidSalary, 0);

  const uniquePeriods = [...new Set(demoData.map((e) => e.salaryPeriod))];
  const uniqueEmployees = [...new Set(demoData.map((e) => e.employeeId))];
  const uniquePaidBy = [...new Set(demoData.map((e) => e.paidBy))];

  const renderTable = () => (
    <>
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <Select value={payrollType} onValueChange={setPayrollType}>
          <SelectTrigger><SelectValue placeholder="Payroll Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payroll</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={(v) => { setPeriod(v); setCurrentPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Periods" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            {uniquePeriods.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={employee} onValueChange={(v) => { setEmployee(v); setCurrentPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {uniqueEmployees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={paidByFilter} onValueChange={(v) => { setPaidByFilter(v); setCurrentPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Paid By" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {uniquePaidBy.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="From Date" />
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="To Date" />
      </div>

      {/* Export buttons */}
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" /> Generate PDF</Button>
        <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 mr-1" /> Generate Excel</Button>
      </div>

      {/* Show entries + Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span>Show</span>
          <Select value={String(entriesPerPage)} onValueChange={(v) => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 h-9" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="text-primary-foreground font-semibold">Date</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Employee Id</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Employee Name</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Salary Period</TableHead>
              <TableHead className="text-primary-foreground font-semibold text-right">Net Salary</TableHead>
              <TableHead className="text-primary-foreground font-semibold text-right">Paid Salary</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Remarks</TableHead>
              <TableHead className="text-primary-foreground font-semibold">Paid By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No records found</TableCell></TableRow>
            ) : (
              paginated.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.employeeId}</TableCell>
                  <TableCell className="font-medium">{entry.employeeName}</TableCell>
                  <TableCell>{entry.salaryPeriod}</TableCell>
                  <TableCell className="text-right">৳{entry.netSalary.toLocaleString()}</TableCell>
                  <TableCell className="text-right">৳{entry.paidSalary.toLocaleString()}</TableCell>
                  <TableCell>{entry.remarks}</TableCell>
                  <TableCell>{entry.paidBy}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {paginated.length > 0 && (
            <TableFooter>
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={4} className="text-right">Total</TableCell>
                <TableCell className="text-right">৳{totalNet.toLocaleString()}</TableCell>
                <TableCell className="text-right">৳{totalPaid.toLocaleString()}</TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 text-sm text-muted-foreground">
        <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i + 1} variant={currentPage === i + 1 ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
          ))}
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>HR & Payroll</span><span>/</span><span className="text-foreground">Salary</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Banknote className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Salary</h1>
            <p className="text-sm text-muted-foreground">View Salary List</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="history">
            <TabsList className="mb-4 w-full justify-start flex-wrap h-auto gap-1">
              <TabsTrigger value="history">Salary Payment History</TabsTrigger>
              <TabsTrigger value="payroll">Payroll wise salary sheet</TabsTrigger>
              <TabsTrigger value="employee">Employee wise salary sheet</TabsTrigger>
            </TabsList>
            <TabsContent value="history">{renderTable()}</TabsContent>
            <TabsContent value="payroll">
              <div className="py-12 text-center text-muted-foreground">Payroll wise salary sheet — coming soon</div>
            </TabsContent>
            <TabsContent value="employee">
              <div className="py-12 text-center text-muted-foreground">Employee wise salary sheet — coming soon</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
