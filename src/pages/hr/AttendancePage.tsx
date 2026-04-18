import { useState } from "react";
import { Clock, FileText, FileSpreadsheet, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const demoEmployees = [
  { id: "EMP001", name: "Rahim Uddin" },
  { id: "EMP002", name: "Karim Hossain" },
  { id: "EMP003", name: "Fatema Akter" },
  { id: "EMP004", name: "Jamal Mia" },
  { id: "EMP005", name: "Nusrat Jahan" },
];

const demoAttendance = [
  { date: "2026-03-01", officeIn: "09:00 AM", officeOut: "06:00 PM", inTime: "09:05 AM", outTime: "06:10 PM", workingHour: "9h 5m", type: "Present", late: "5m", earlyOut: "—", overtimeReal: "10m", overtimeApproved: "0m" },
  { date: "2026-03-02", officeIn: "09:00 AM", officeOut: "06:00 PM", inTime: "08:55 AM", outTime: "06:00 PM", workingHour: "9h 5m", type: "Present", late: "—", earlyOut: "—", overtimeReal: "0m", overtimeApproved: "0m" },
  { date: "2026-03-03", officeIn: "09:00 AM", officeOut: "06:00 PM", inTime: "09:30 AM", outTime: "05:45 PM", workingHour: "8h 15m", type: "Late", late: "30m", earlyOut: "15m", overtimeReal: "0m", overtimeApproved: "0m" },
  { date: "2026-03-04", officeIn: "09:00 AM", officeOut: "06:00 PM", inTime: "—", outTime: "—", workingHour: "—", type: "Absent", late: "—", earlyOut: "—", overtimeReal: "—", overtimeApproved: "—" },
  { date: "2026-03-05", officeIn: "09:00 AM", officeOut: "06:00 PM", inTime: "09:00 AM", outTime: "08:00 PM", workingHour: "11h 0m", type: "Present", late: "—", earlyOut: "—", overtimeReal: "2h 0m", overtimeApproved: "1h 30m" },
  { date: "2026-03-06", officeIn: "09:00 AM", officeOut: "06:00 PM", inTime: "09:10 AM", outTime: "06:00 PM", workingHour: "8h 50m", type: "Present", late: "10m", earlyOut: "—", overtimeReal: "0m", overtimeApproved: "0m" },
];

const typeBadge = (type: string) => {
  switch (type) {
    case "Present": return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200 hover:bg-emerald-500/20">Present</Badge>;
    case "Late": return <Badge className="bg-amber-500/15 text-amber-700 border-amber-200 hover:bg-amber-500/20">Late</Badge>;
    case "Absent": return <Badge variant="destructive">Absent</Badge>;
    default: return <Badge variant="secondary">{type}</Badge>;
  }
};

const AttendancePage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("EMP001");
  const [startDate, setStartDate] = useState("2026-03-01");
  const [endDate, setEndDate] = useState("2026-03-06");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = demoAttendance.filter((row) =>
    searchTerm ? row.date.includes(searchTerm) || row.type.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const selectedEmp = demoEmployees.find((e) => e.id === selectedEmployee);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employee Wise Attendance</h1>
            <p className="text-sm text-muted-foreground">HR & Payroll &gt; Attendance &gt; Employee</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-4 w-4" /> Generate PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4" /> Generate Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col md:flex-row items-end gap-3">
            <div className="w-full md:w-64">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Search Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {demoEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-44">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="w-full md:w-44">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button className="gap-1.5">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {/* Show entries + Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-b">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["5", "10", "25", "50"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">entries</span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 h-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {/* Employee Info */}
          {selectedEmp && (
            <div className="px-4 py-2 bg-muted/30 border-b text-sm">
              <span className="font-medium text-foreground">{selectedEmp.name}</span>
              <span className="text-muted-foreground ml-2">({selectedEmp.id})</span>
              <span className="text-muted-foreground ml-3">| Period: {startDate} to {endDate}</span>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <tr className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground font-semibold">Date</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Office In Time</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Office Out Time</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">In Time</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Out Time</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Working Hour</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Type</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Late + Early Out</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-center">Over Time<br /><span className="text-xs font-normal opacity-80">Real → Approved</span></TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">No attendance records found.</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell>{row.officeIn}</TableCell>
                      <TableCell>{row.officeOut}</TableCell>
                      <TableCell>{row.inTime}</TableCell>
                      <TableCell>{row.outTime}</TableCell>
                      <TableCell>{row.workingHour}</TableCell>
                      <TableCell>{typeBadge(row.type)}</TableCell>
                      <TableCell>
                        {row.late !== "—" && <span className="text-amber-600">{row.late}</span>}
                        {row.late !== "—" && row.earlyOut !== "—" && " + "}
                        {row.earlyOut !== "—" && <span className="text-rose-600">{row.earlyOut}</span>}
                        {row.late === "—" && row.earlyOut === "—" && <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.overtimeReal === "—" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span>{row.overtimeReal} → {row.overtimeApproved}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={6} className="text-right font-semibold">Summary:</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {filtered.filter(r => r.type === "Present").length}P / {filtered.filter(r => r.type === "Absent").length}A / {filtered.filter(r => r.type === "Late").length}L
                    </span>
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">Showing 1 to {filtered.length} of {filtered.length} entries</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="sm" className="h-8 w-8 p-0">1</Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
