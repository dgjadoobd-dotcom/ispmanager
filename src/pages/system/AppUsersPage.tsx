import { useState } from "react";
import { Users, Eye, Trash2, Plus, Search, Key } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";

// Demo data
const demoUsers = [
  { id: 1, username: "Tushar", employee: "Tushar", status: "Active", role: "IT", modules: "Configuration, Zone, Connection Type..." },
  { id: 2, username: "sunny69", employee: "", status: "Active", role: "Employee", modules: "Configuration, Zone, Connection Type..." },
  { id: 3, username: "mdnaim", employee: "Irfanul", status: "Active", role: "Support_1", modules: "Client, Add New, Client List..." },
  { id: 4, username: "Sobnombubli", employee: "Sobnom Bubli", status: "Active", role: "Collecting", modules: "Configuration, Zone, Connection Type..." },
  { id: 5, username: "admin08888", employee: "istiak", status: "Active", role: "SuperAdministrator", modules: "Configuration, Zone, Connection Type..." },
  { id: 6, username: "Abrar007", employee: "Muhamad Irfan", status: "Active", role: "Employee", modules: "Configuration, Zone, Connection Type..." },
  { id: 7, username: "tesla007", employee: "shishir", status: "InActive", role: "Employee", modules: "Configuration, Zone, Connection Type..." },
  { id: 8, username: "TestShariar", employee: "Numan", status: "Active", role: "Employee", modules: "Configuration, Zone, Connection Type..." },
  { id: 9, username: "zamanapptest", employee: "Zaman App Test", status: "Active", role: "mobile application permission test", modules: "Client, Add New, Client List..." },
  { id: 10, username: "FakharZaman", employee: "Irfanul", status: "Not Assigned", role: "Support", modules: "Configuration, Zone, Connection Type..." },
];

const demoRoles = [
  { id: 1, name: "SuperAdministrator", description: "Full system access", usersCount: 1 },
  { id: 2, name: "Employee", description: "Standard employee access", usersCount: 4 },
  { id: 3, name: "IT", description: "IT department access", usersCount: 1 },
  { id: 4, name: "Support", description: "Support team access", usersCount: 1 },
  { id: 5, name: "Support_1", description: "Support level 1", usersCount: 1 },
  { id: 6, name: "Collecting", description: "Collection team", usersCount: 1 },
];

function StatusBadge({ status }: { status: string }) {
  const variant = status === "Active"
    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
    : status === "InActive"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : "bg-amber-500/15 text-amber-600 border-amber-500/30";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variant}`}>
      {status}
    </span>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-primary text-primary-foreground px-4 py-2.5 font-semibold text-sm">
      {title}
    </div>
  );
}

export default function AppUsersPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [entriesCount, setEntriesCount] = useState("100");

  const filteredUsers = demoUsers.filter(u => {
    const matchSearch = !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.employee.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <span>System</span><span>/</span>
            <span className="text-foreground font-medium">App Users</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">App Users</h1>
              <p className="text-sm text-muted-foreground">All Users of Application</p>
            </div>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New User
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm">
            <Users className="h-3.5 w-3.5" /> Application Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5 text-xs sm:text-sm">
            User Roles (Groups)
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-1.5 text-xs sm:text-sm">
            Role Modules (Permissions)
          </TabsTrigger>
        </TabsList>

        {/* Application Users Tab */}
        <TabsContent value="users" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">User Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="InActive">InActive</SelectItem>
                  <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Employee</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {[...new Set(demoUsers.map(u => u.employee).filter(Boolean))].map(emp => (
                    <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">User Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {[...new Set(demoUsers.map(u => u.role))].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Entries + Search */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>SHOW</span>
              <Select value={entriesCount} onValueChange={setEntriesCount}>
                <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>ENTRIES</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">SEARCH:</span>
              <div className="relative">
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="h-8 w-48 pr-8"
                />
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <SectionHeader title="Application Users" />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                    <TableHead className="text-primary-foreground font-semibold w-16">Sr.No.</TableHead>
                    <TableHead className="text-primary-foreground font-semibold">User Name</TableHead>
                    <TableHead className="text-primary-foreground font-semibold">Password</TableHead>
                    <TableHead className="text-primary-foreground font-semibold text-center">Status</TableHead>
                    <TableHead className="text-primary-foreground font-semibold">Employee</TableHead>
                    <TableHead className="text-primary-foreground font-semibold">Role/Group</TableHead>
                    <TableHead className="text-primary-foreground font-semibold">Assigned Module</TableHead>
                    <TableHead className="text-primary-foreground font-semibold text-center w-24">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, idx) => (
                    <TableRow key={user.id} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                      <TableCell className="font-medium text-muted-foreground">{user.id}</TableCell>
                      <TableCell className="font-medium text-primary">{user.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="tracking-widest text-muted-foreground">••••••</span>
                          <Eye className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={user.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.employee || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{user.role}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[250px] truncate">{user.modules}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                            onClick={() => {
                              toast.info("Password reset is not available. Update credentials in src/lib/localAuth.ts");
                            }}
                            title="Send Password Reset Email"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing 1 to {filteredUsers.length} of {filteredUsers.length} entries
          </div>
        </TabsContent>

        {/* User Roles Tab */}
        <TabsContent value="roles" className="mt-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <SectionHeader title="User Roles (Groups)" />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                    <TableHead className="text-primary-foreground font-semibold w-16">Sr.No.</TableHead>
                    <TableHead className="text-primary-foreground font-semibold">Role Name</TableHead>
                    <TableHead className="text-primary-foreground font-semibold">Description</TableHead>
                    <TableHead className="text-primary-foreground font-semibold text-center">Users</TableHead>
                    <TableHead className="text-primary-foreground font-semibold text-center w-24">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoRoles.map((role, idx) => (
                    <TableRow key={role.id} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                      <TableCell className="font-medium text-muted-foreground">{role.id}</TableCell>
                      <TableCell className="font-medium text-foreground">{role.name}</TableCell>
                      <TableCell className="text-muted-foreground">{role.description}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{role.usersCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Role Modules Tab */}
        <TabsContent value="modules" className="mt-4">
          <div className="border border-border rounded-lg overflow-hidden bg-card p-8 text-center">
            <p className="text-muted-foreground">Role Modules (Permissions) management coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}