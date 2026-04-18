import { useState } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  FileText,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for Corporate Clients
const mockCorporateClients = [
  {
    id: "CORP-001",
    companyName: "TechFlow Solutions",
    contactPerson: "Ahmed Faisal",
    email: "admin@techflow.com",
    phone: "+880 1711-223344",
    package: "Corporate Dedicated 100M",
    status: "active",
    outstandingBalance: 12500,
    renewalDate: "2026-05-15",
  },
  {
    id: "CORP-002",
    companyName: "Apex Garments Ltd.",
    contactPerson: "Md. Karim",
    email: "it@apexgarments.com",
    phone: "+880 1812-998877",
    package: "Leased Line 50M",
    status: "active",
    outstandingBalance: 0,
    renewalDate: "2026-05-01",
  },
  {
    id: "CORP-003",
    companyName: "Incepta Pharma",
    contactPerson: "Dr. Rakib",
    email: "network@incepta.com",
    phone: "+880 1913-445566",
    package: "Fiber Premium 200M",
    status: "suspended",
    outstandingBalance: 45000,
    renewalDate: "2026-04-10",
  },
];

export default function CorporateClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = mockCorporateClients.filter(
    (client) =>
      client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Corporate Clients</h1>
          <p className="text-muted-foreground">Manage your high-value business subscribers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Corporate Account
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total Corporations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCorporateClients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Active Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mockCorporateClients.filter(c => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Overdue Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ৳{mockCorporateClients.reduce((sum, c) => sum + c.outstandingBalance, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/50 shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs">{client.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{client.companyName}</div>
                      <div className="text-xs text-muted-foreground">{client.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{client.contactPerson}</div>
                      <div className="text-xs text-muted-foreground">{client.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {client.package}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={client.status === "active" ? "text-success border-success/30 bg-success/5" : "text-destructive border-destructive/30 bg-destructive/5"}
                      >
                        {client.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ৳{client.outstandingBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <FileText className="h-4 w-4" /> View Contract
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Briefcase className="h-4 w-4" /> Billing History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive gap-2">
                            Suspend Service
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
