import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Shield, Search, Filter, Building2, UserPlus, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const mockUsers = [
  { id: "1", name: "Admin User", email: "admin@platform.com", role: "Super Admin", tenant: "Platform", status: "active", lastLogin: "2 min ago" },
  { id: "2", name: "Rahim Ahmed", email: "rahim@speedlink.com", role: "ISP Owner", tenant: "SpeedLink ISP", status: "active", lastLogin: "1 hour ago" },
  { id: "3", name: "Karim Hasan", email: "karim@fastnet.com", role: "Admin", tenant: "FastNet BD", status: "active", lastLogin: "3 hours ago" },
  { id: "4", name: "Jashim Uddin", email: "jashim@netzone.com", role: "Manager", tenant: "NetZone", status: "active", lastLogin: "1 day ago" },
  { id: "5", name: "Fatema Begum", email: "fatema@speedlink.com", role: "Accountant", tenant: "SpeedLink ISP", status: "active", lastLogin: "5 hours ago" },
  { id: "6", name: "Sumon Ali", email: "sumon@datastream.com", role: "Staff", tenant: "DataStream BD", status: "inactive", lastLogin: "1 week ago" },
  { id: "7", name: "Reseller One", email: "reseller1@gmail.com", role: "Reseller", tenant: "FastNet BD", status: "active", lastLogin: "30 min ago" },
];

const roleColors: Record<string, string> = {
  "Super Admin": "bg-destructive/10 text-destructive border-destructive/20",
  "ISP Owner": "bg-primary/10 text-primary border-primary/20",
  "Admin": "bg-info/10 text-info border-info/20",
  "Manager": "bg-success/10 text-success border-success/20",
  "Staff": "bg-muted text-muted-foreground",
  "Accountant": "bg-warning/10 text-warning border-warning/20",
  "Reseller": "bg-accent text-accent-foreground",
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = mockUsers.filter((u) => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users & Roles</h1>
          <p className="text-muted-foreground">Manage platform and ISP user access</p>
        </div>
        <Button className="gap-2"><UserPlus className="h-4 w-4" /> Invite User</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-xl font-bold">{mockUsers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10"><CheckCircle className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{mockUsers.filter(u => u.status === "active").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10"><Shield className="h-5 w-5 text-destructive" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Super Admins</p>
              <p className="text-xl font-bold">{mockUsers.filter(u => u.role === "Super Admin").length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>All Users</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="ISP Owner">ISP Owner</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Accountant">Accountant</SelectItem>
                <SelectItem value="Reseller">Reseller</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No users found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", roleColors[user.role])}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {user.tenant}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
