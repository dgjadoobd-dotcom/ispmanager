import React, { useState } from "react";
import { HardDrive, Download, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface BackupEntry {
  id: string;
  time: string;
  fileName: string;
}

// Demo data - empty for now as shown in reference
const demoBackups: BackupEntry[] = [];

const MikrotikBackupPage = () => {
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const perPage = parseInt(entriesPerPage);

  const filtered = demoBackups.filter(
    (b) =>
      b.fileName.toLowerCase().includes(search.toLowerCase()) ||
      b.time.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const showingFrom = filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const showingTo = Math.min(currentPage * perPage, filtered.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Mikrotik Backups
            </h1>
            <p className="text-sm text-muted-foreground">
              Mikrotik Server &gt; Server Backup
            </p>
          </div>
        </div>
        <Button
          onClick={() => toast.info("Create Backup feature coming soon")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Backup
        </Button>
      </div>

      {/* Card */}
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium uppercase">Show</span>
            <Select value={entriesPerPage} onValueChange={(v) => { setEntriesPerPage(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["5", "10", "25", "50"].map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="font-medium uppercase">Entries</span>
          </div>
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="h-8 pl-8"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="w-[60px] text-center font-semibold">#</TableHead>
                <TableHead className="font-semibold">Time</TableHead>
                <TableHead className="font-semibold">Backup File Name</TableHead>
                <TableHead className="w-[120px] text-center font-semibold">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((backup, idx) => (
                  <TableRow key={backup.id}>
                    <TableCell className="text-center font-medium">
                      {(currentPage - 1) * perPage + idx + 1}
                    </TableCell>
                    <TableCell>{backup.time}</TableCell>
                    <TableCell className="font-mono text-sm">{backup.fileName}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary/80"
                        onClick={() => toast.info("Download coming soon")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center justify-between gap-2 border-t px-4 py-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Showing {showingFrom} to {showingTo} of {filtered.length} entries
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MikrotikBackupPage;
