import React, { useState } from "react";
import { Package, Plus, Search, Edit, Trash2, Eye, Copy, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const demoPackages = [
  { id: 1, name: "Basic 5Mbps", bandwidth: 5, details: "5Mbps Download / 2Mbps Upload, Shared" },
  { id: 2, name: "Standard 10Mbps", bandwidth: 10, details: "10Mbps Download / 5Mbps Upload, Shared" },
  { id: 3, name: "Premium 20Mbps", bandwidth: 20, details: "20Mbps Download / 10Mbps Upload, Dedicated" },
  { id: 4, name: "Business 50Mbps", bandwidth: 50, details: "50Mbps Download / 25Mbps Upload, Dedicated" },
  { id: 5, name: "Enterprise 100Mbps", bandwidth: 100, details: "100Mbps Download / 50Mbps Upload, Dedicated" },
];

const demoTariffs = [
  { id: 1, name: "Residential Basic", pops: 3, packages: 2, servers: 1, profiles: 2, createdOn: "2024-12-01", createdBy: "Admin" },
  { id: 2, name: "Residential Pro", pops: 5, packages: 4, servers: 2, profiles: 3, createdOn: "2024-12-05", createdBy: "Admin" },
  { id: 3, name: "Business Standard", pops: 2, packages: 3, servers: 1, profiles: 2, createdOn: "2025-01-10", createdBy: "Manager" },
  { id: 4, name: "Enterprise Plan", pops: 8, packages: 5, servers: 3, profiles: 4, createdOn: "2025-02-15", createdBy: "Admin" },
];

const ResellerPackageTariffPage = () => {
  const [pkgSearch, setPkgSearch] = useState("");
  const [tariffSearch, setTariffSearch] = useState("");
  const [pkgEntries, setPkgEntries] = useState("10");
  const [tariffEntries, setTariffEntries] = useState("10");

  const filteredPackages = demoPackages.filter(p =>
    p.name.toLowerCase().includes(pkgSearch.toLowerCase())
  );

  const filteredTariffs = demoTariffs.filter(t =>
    t.name.toLowerCase().includes(tariffSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Package / Tariff</h1>
            <p className="text-sm text-muted-foreground">MAC Reseller &gt; Package / Tariff Configuration</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="packages" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="packages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6">
            Packages
          </TabsTrigger>
          <TabsTrigger value="tariffs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6">
            Tariff Config
          </TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <Select value={pkgEntries} onValueChange={setPkgEntries}>
                      <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">entries</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search packages..."
                      value={pkgSearch}
                      onChange={e => setPkgSearch(e.target.value)}
                      className="pl-9 h-8 w-[200px] text-sm"
                    />
                  </div>
                  <Button size="sm" className="gap-1.5">
                    <Plus className="h-4 w-4" /> Package
                  </Button>
                </div>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    {["Serial No", "Package Name", "Bandwidth (MB)", "Package Details", "Action"].map(h => (
                      <TableHead key={h} className="text-primary-foreground text-xs font-semibold whitespace-nowrap">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No packages found</TableCell>
                    </TableRow>
                  ) : (
                    filteredPackages.map((pkg, i) => (
                      <TableRow key={pkg.id} className="hover:bg-muted/30">
                        <TableCell className="text-sm font-medium">{i + 1}</TableCell>
                        <TableCell className="text-sm font-medium">{pkg.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{pkg.bandwidth} MB</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{pkg.details}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Showing 1 to {filteredPackages.length} of {filteredPackages.length} entries
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="xs" disabled>Previous</Button>
                  <Button size="xs" className="min-w-[28px]">1</Button>
                  <Button variant="outline" size="xs" disabled>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tariff Config Tab */}
        <TabsContent value="tariffs">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <Select value={tariffEntries} onValueChange={setTariffEntries}>
                      <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">entries</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tariffs..."
                      value={tariffSearch}
                      onChange={e => setTariffSearch(e.target.value)}
                      className="pl-9 h-8 w-[200px] text-sm"
                    />
                  </div>
                  <Button size="sm" className="gap-1.5">
                    <Plus className="h-4 w-4" /> Add Tariff
                  </Button>
                </div>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    {["S/N", "Tariff Name", "Assigned POPs", "Packages", "Servers", "Profiles", "Created On", "Created By", "Action"].map(h => (
                      <TableHead key={h} className="text-primary-foreground text-xs font-semibold whitespace-nowrap">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTariffs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No tariffs found</TableCell>
                    </TableRow>
                  ) : (
                    filteredTariffs.map((t, i) => (
                      <TableRow key={t.id} className="hover:bg-muted/30">
                        <TableCell className="text-sm font-medium">{i + 1}</TableCell>
                        <TableCell className="text-sm font-medium">{t.name}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{t.pops}</Badge></TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{t.packages}</Badge></TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{t.servers}</Badge></TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{t.profiles}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.createdOn}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.createdBy}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary">
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary">
                              <Settings className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Showing 1 to {filteredTariffs.length} of {filteredTariffs.length} entries
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="xs" disabled>Previous</Button>
                  <Button size="xs" className="min-w-[28px]">1</Button>
                  <Button variant="outline" size="xs" disabled>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResellerPackageTariffPage;
