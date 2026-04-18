import React, { useState, useMemo } from "react";
import { Store, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Vendor {
  id: number;
  company: string;
  contactPerson: string;
  email: string;
  mobile: string;
  balanceDue: number;
  initials: string;
  color: string;
}

const COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-purple-500",
  "bg-rose-500", "bg-cyan-500", "bg-amber-500", "bg-indigo-500",
  "bg-teal-500", "bg-pink-500",
];

const demoVendors: Vendor[] = [
  { id: 1, company: "Shadhin Wi Fi", contactPerson: "Md. Rahim Uddin", email: "info@shadhinwifi.com", mobile: "01712345678", balanceDue: 15000, initials: "SW", color: COLORS[0] },
  { id: 2, company: "E G Tach Wi Fi", contactPerson: "Kamal Hossain", email: "egtach@gmail.com", mobile: "01812345679", balanceDue: 0, initials: "EG", color: COLORS[1] },
  { id: 3, company: "Arifa Network", contactPerson: "Arifa Begum", email: "arifa@network.com", mobile: "01912345680", balanceDue: 8500, initials: "AN", color: COLORS[2] },
  { id: 4, company: "FiberTech Solutions", contactPerson: "Tanvir Ahmed", email: "tanvir@fibertech.bd", mobile: "01612345681", balanceDue: 22000, initials: "FT", color: COLORS[3] },
  { id: 5, company: "NetCom Distributors", contactPerson: "Sumon Das", email: "sumon@netcom.com", mobile: "01512345682", balanceDue: 0, initials: "ND", color: COLORS[4] },
  { id: 6, company: "OptiLink BD", contactPerson: "Rafiq Islam", email: "rafiq@optilink.bd", mobile: "01312345683", balanceDue: 45000, initials: "OL", color: COLORS[5] },
  { id: 7, company: "Cable World", contactPerson: "Jahangir Alam", email: "info@cableworld.com", mobile: "01412345684", balanceDue: 3200, initials: "CW", color: COLORS[6] },
  { id: 8, company: "Power Electronics", contactPerson: "Nasir Uddin", email: "nasir@powerelec.com", mobile: "01712345685", balanceDue: 0, initials: "PE", color: COLORS[7] },
  { id: 9, company: "DataPath Supplies", contactPerson: "Habibur Rahman", email: "habib@datapath.bd", mobile: "01812345686", balanceDue: 11500, initials: "DP", color: COLORS[8] },
  { id: 10, company: "SmartNet Hardware", contactPerson: "Shamim Hasan", email: "shamim@smartnet.com", mobile: "01912345687", balanceDue: 7800, initials: "SH", color: COLORS[9] },
];

const VendorsPage = () => {
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const perPage = parseInt(entriesPerPage);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return demoVendors.filter(
      (v) =>
        v.company.toLowerCase().includes(q) ||
        v.contactPerson.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.mobile.includes(q)
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Vendor added successfully!");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Purchase</span>
            <span>/</span>
            <span className="text-foreground font-medium">Vendor List</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Vendor List</h1>
              <p className="text-sm text-muted-foreground">All Vendors for Purchase</p>
            </div>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input placeholder="Enter company name" required />
              </div>
              <div className="space-y-2">
                <Label>Contact Person *</Label>
                <Input placeholder="Enter contact person" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email address" />
                </div>
                <div className="space-y-2">
                  <Label>Mobile *</Label>
                  <Input placeholder="Mobile number" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea placeholder="Enter address" rows={2} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Vendor</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select value={entriesPerPage} onValueChange={(v) => { setEntriesPerPage(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <Input
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="sm:max-w-xs h-8"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground font-semibold">Logo</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Company</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Contact Person</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Email</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Mobile Number</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-right">Balance Due</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No vendors found.</TableCell>
                  </TableRow>
                ) : (
                  paginated.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className={`${v.color} text-white text-xs font-bold`}>{v.initials}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{v.company}</TableCell>
                      <TableCell>{v.contactPerson}</TableCell>
                      <TableCell className="text-muted-foreground">{v.email}</TableCell>
                      <TableCell>{v.mobile}</TableCell>
                      <TableCell className={`text-right font-semibold ${v.balanceDue > 0 ? "text-destructive" : "text-success"}`}>
                        ৳{v.balanceDue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">
            <span className="text-sm text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorsPage;
