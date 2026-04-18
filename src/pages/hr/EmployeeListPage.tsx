import React, { useState, useMemo } from "react";
import { Users, Eye, Pencil, Trash2, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const demoEmployees = [
  { id: "E0184", name: "Md. Rahim Uddin", mobile: "01711223344", office: "02-9876543", comment: "Skilled technician", department: "Technical", designation: "Sr. Technician", position: "Field Engineer", status: "active" },
  { id: "E0185", name: "Fatema Akter", mobile: "01855667788", office: "02-9876544", comment: "Team lead", department: "Support", designation: "Manager", position: "Support Lead", status: "active" },
  { id: "E0186", name: "Kamal Hossain", mobile: "01922334455", office: "02-9876545", comment: "New hire", department: "Sales", designation: "Executive", position: "Sales Rep", status: "active" },
  { id: "E0187", name: "Nasrin Sultana", mobile: "01633445566", office: "02-9876546", comment: "On probation", department: "Accounts", designation: "Jr. Accountant", position: "Accountant", status: "active" },
  { id: "E0188", name: "Jahangir Alam", mobile: "01744556677", office: "02-9876547", comment: "Experienced", department: "Technical", designation: "Technician", position: "NOC Engineer", status: "inactive" },
  { id: "E0189", name: "Sumaiya Islam", mobile: "01566778899", office: "02-9876548", comment: "Part-time", department: "HR", designation: "Assistant", position: "HR Assistant", status: "active" },
  { id: "E0190", name: "Rafiqul Islam", mobile: "01877889900", office: "02-9876549", comment: "Senior staff", department: "Admin", designation: "Officer", position: "Admin Officer", status: "active" },
];

const EmployeeListPage = () => {
  const [statusFilter, setStatusFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return demoEmployees.filter((e) => {
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      const matchSearch = !search || Object.values(e).some((v) => v.toLowerCase().includes(search.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span>HR & PAYROLL</span>
          <span>/</span>
          <span className="text-foreground font-medium">Employee List</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Employee List</h1>
            <p className="text-sm text-muted-foreground">View All Employees</p>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">STATUS</span>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Show entries + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">SHOW</span>
          <Select value={String(entriesPerPage)} onValueChange={(v) => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">SEARCH</span>
          <Input className="w-[200px] h-9" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary">
                <TableHead className="text-primary-foreground font-semibold">Name</TableHead>
                <TableHead className="text-primary-foreground font-semibold">ID</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Mobile No.</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Office No.</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Comment</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Department</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Designation</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Position Name</TableHead>
                <TableHead className="text-primary-foreground font-semibold text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No employees found</TableCell>
                </TableRow>
              ) : (
                paginated.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium text-foreground">{emp.name}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.id}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.mobile}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.office}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.comment}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.department}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.designation}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.position}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-accent-foreground"><CalendarDays className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" className="min-w-[32px]" onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
          ))}
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeListPage;
