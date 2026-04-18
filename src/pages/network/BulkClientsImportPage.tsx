import React, { useState, useMemo } from "react";
import { Users, FileSpreadsheet, Upload, Trash2, Download, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const columns = [
  "C.Code", "Name", "Mobile", "Email", "NationalID", "Address", "Zone",
  "Conn.Type", "Server", "Prot.Type", "Profile", "UserName", "Password",
  "C.Type", "Package", "B.Status", "M.Bill", "Bill.Month", "Join.Date",
  "Exp.Date", "Assign2Emp", "Eff.Date(Opt.)", "Date"
];

export default function BulkClientsImportPage() {
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("all");
  const [showTutorial, setShowTutorial] = useState(false);

  // No data by default — user uploads Excel
  const data: Record<string, string>[] = [];

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(v => v.toLowerCase().includes(q))
    );
  }, [data, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Bulk Clients Import</h1>
            <p className="text-sm text-muted-foreground">
              <span className="text-primary/80">Client</span>
              <span className="mx-1.5">›</span>
              <span>Bulk Import</span>
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <Alert className="border-warning/40 bg-warning/10">
        <Info className="h-4 w-4 text-warning" />
        <AlertDescription className="text-sm font-medium text-warning">
          Your Uploaded Data Will No Longer Available After 24 Hours!
        </AlertDescription>
      </Alert>

      {/* Tutorial Toggle + Action Buttons */}
      <Card className="border-border/60">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Learn How to Import Clients...</span>
            <Switch checked={showTutorial} onCheckedChange={setShowTutorial} />
          </div>

          {showTutorial && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Steps to Import Clients:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click <strong>"Download Sample Excel"</strong> to get the template file.</li>
                <li>Fill in client data following the column format exactly.</li>
                <li>Click <strong>"Upload Importable Clients (Excel)"</strong> to upload your filled file.</li>
                <li>Review the data in the table below, then confirm the import.</li>
              </ol>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => toast.info("Downloading sample Excel...")}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" />
              Download Sample Excel
            </Button>
            <Button variant="destructive" size="sm" onClick={() => toast.info("Clearing all clients...")}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Clear All Clients
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("Upload Excel file...")}>
              <Upload className="mr-1.5 h-4 w-4" />
              Upload Importable Clients (Excel)
            </Button>
            <Button variant="secondary" size="sm" className="sm:ml-auto" onClick={() => toast.info("Downloading edited data...")}>
              <Download className="mr-1.5 h-4 w-4" />
              Download Edited Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entries & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Show</span>
          <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
            <SelectTrigger className="h-8 w-[75px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["all", "10", "25", "50", "100"].map(v => (
                <SelectItem key={v} value={v}>{v === "all" ? "All" : v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entries</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 w-full pl-8 sm:w-56"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-border/60">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/70 hover:bg-muted/70">
                {columns.map(col => (
                  <TableHead key={col} className="whitespace-nowrap text-xs font-semibold">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : filtered.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map(col => (
                    <TableCell key={col} className="whitespace-nowrap text-sm">
                      {row[col] || "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 0 to 0 of 0 entries
        </p>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" className="border-primary text-primary">1</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}
