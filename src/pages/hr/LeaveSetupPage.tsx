import { useState } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Settings2, CalendarDays } from "lucide-react";

interface Position {
  id: string;
  name: string;
  status: "Active" | "Inactive";
}

interface LeaveCategory {
  id: string;
  name: string;
}

interface LeaveAllocation {
  categoryId: string;
  days: number;
}

const initialPositions: Position[] = [
  { id: "1", name: "HR", status: "Active" },
  { id: "2", name: "App Admin", status: "Active" },
  { id: "3", name: "Accountant", status: "Active" },
  { id: "4", name: "Call Center Executive", status: "Active" },
  { id: "5", name: "Bill Collector", status: "Active" },
  { id: "6", name: "Service Man", status: "Active" },
  { id: "7", name: "Test", status: "Active" },
  { id: "8", name: "Field Executive", status: "Active" },
  { id: "9", name: "Card Counter", status: "Active" },
  { id: "10", name: "Extra", status: "Inactive" },
];

const leaveCategories: LeaveCategory[] = [
  { id: "1", name: "Full Day" },
  { id: "2", name: "Half Day" },
  { id: "3", name: "Casual" },
  { id: "4", name: "Sick" },
  { id: "5", name: "Unpaid Leave" },
];

export default function LeaveSetupPage() {
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState("10");
  const [page, setPage] = useState(1);

  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [allocations, setAllocations] = useState<LeaveAllocation[]>([]);

  // Store all allocations per position
  const [positionAllocations, setPositionAllocations] = useState<Record<string, LeaveAllocation[]>>({});

  const filtered = initialPositions.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase())
  );
  const pp = parseInt(perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pp));
  const paginated = filtered.slice((page - 1) * pp, page * pp);

  const openSetup = (position: Position) => {
    setSelectedPosition(position);
    const existing = positionAllocations[position.id] || leaveCategories.map((c) => ({ categoryId: c.id, days: 0 }));
    setAllocations(existing);
    setSetupDialogOpen(true);
  };

  const updateAllocation = (categoryId: string, days: number) => {
    setAllocations((prev) =>
      prev.map((a) => (a.categoryId === categoryId ? { ...a, days } : a))
    );
  };

  const handleSaveSetup = () => {
    if (selectedPosition) {
      setPositionAllocations((prev) => ({
        ...prev,
        [selectedPosition.id]: allocations,
      }));
    }
    setSetupDialogOpen(false);
  };

  const getTotalDays = (positionId: string) => {
    const allocs = positionAllocations[positionId];
    if (!allocs) return 0;
    return allocs.reduce((sum, a) => sum + a.days, 0);
  };

  return (
    <PageContainer
      title="Leave Setup"
      description="Configure leave allocations per position"
    >
      <Card>
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Show
              <Select value={perPage} onValueChange={(v) => { setPerPage(v); setPage(1); }}>
                <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["5", "10", "25", "50"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              entries
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary">
                <TableHead className="w-16 font-semibold text-primary-foreground">#</TableHead>
                <TableHead className="font-semibold text-primary-foreground">Position Name</TableHead>
                <TableHead className="font-semibold text-primary-foreground">Status</TableHead>
                <TableHead className="font-semibold text-primary-foreground text-center">Total Days</TableHead>
                <TableHead className="font-semibold w-36 text-center text-primary-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    No positions found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{(page - 1) * pp + idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "Active" ? "default" : "secondary"} className={item.status === "Active" ? "bg-success text-success-foreground" : ""}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {getTotalDays(item.id) > 0 ? (
                        <Badge variant="outline">{getTotalDays(item.id)} days</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openSetup(item)}>
                          <Settings2 className="h-3.5 w-3.5" />
                          Setup Leave
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t text-sm text-muted-foreground">
              <span>
                Showing {(page - 1) * pp + 1}–{Math.min(page * pp, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-8" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="h-8" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Leave Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Setup Leave — {selectedPosition?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Set the number of allowed leave days per category for this position.
            </p>
            {leaveCategories.map((cat) => {
              const alloc = allocations.find((a) => a.categoryId === cat.id);
              return (
                <div key={cat.id} className="flex items-center justify-between gap-4">
                  <Label className="min-w-[120px]">{cat.name}</Label>
                  <Input
                    type="number"
                    min={0}
                    className="w-24 h-9 text-center"
                    value={alloc?.days ?? 0}
                    onChange={(e) => updateAllocation(cat.id, Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span className="text-sm text-muted-foreground w-10">days</span>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSetup}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
