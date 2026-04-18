import { useState } from "react";
import {
  Globe,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Users,
  Smartphone,
  UserX,
  Search,
  Bell,
  Server,
  Newspaper,
  Gauge,
  Image,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// ── Demo Data ──
const demoNotices = [
  { id: 1, title: "Server Maintenance", details: "Scheduled maintenance on March 15th from 2AM-4AM", createdOn: "10-03-2026", createdBy: "Admin" },
  { id: 2, title: "New Package Launch", details: "Introducing 200Mbps Ultra plan at special price", createdOn: "08-03-2026", createdBy: "Marketing" },
  { id: 3, title: "Payment Reminder", details: "Monthly bills are due by 15th of every month", createdOn: "05-03-2026", createdBy: "Billing" },
];

const demoMediaCategories = [
  { id: 1, category: "Movies", description: "Local movie server content" },
  { id: 2, category: "TV Series", description: "Web series and TV shows" },
  { id: 3, category: "Sports", description: "Live sports streaming" },
];

const demoNewsEvents = [
  { id: 1, photo: "", title: "Fiber Network Expansion", details: "We are expanding our fiber network to 5 new areas", createdOn: "12-03-2026", createdBy: "Admin" },
  { id: 2, photo: "", title: "Customer Appreciation Day", details: "Special discounts for loyal customers", createdOn: "10-03-2026", createdBy: "Marketing" },
];

const demoRegisteredClients = [
  { id: 1, dateTime: "12-03-2026 10:30", cCode: "C001", idIp: "192.168.1.10", name: "Rahim Uddin", mobile: "01711234567", zone: "Zone A", cType: "Home", package: "50Mbps/1250", server: "MK-01", bStatus: "Paid", lStatus: true, registeredOn: "01-01-2026", isAppUser: true },
  { id: 2, dateTime: "11-03-2026 14:15", cCode: "C002", idIp: "192.168.1.11", name: "Karim Hossain", mobile: "01819876543", zone: "Zone B", cType: "Home", package: "30Mbps/800", server: "MK-02", bStatus: "Due", lStatus: true, registeredOn: "15-02-2026", isAppUser: false },
  { id: 3, dateTime: "10-03-2026 09:00", cCode: "C003", idIp: "192.168.1.12", name: "Fatema Begum", mobile: "01912345678", zone: "Zone A", cType: "Corporate", package: "100Mbps/3000", server: "MK-01", bStatus: "Paid", lStatus: false, registeredOn: "20-01-2026", isAppUser: true },
];

// ── Tab config ──
const tabItems = [
  { value: "notices", label: "Notices", icon: Bell },
  { value: "media", label: "Media Servers", icon: Server },
  { value: "news", label: "News & Events", icon: Newspaper },
  { value: "speed", label: "Speed Test Server", icon: Gauge },
  { value: "clients", label: "Registered Clients", icon: Users },
];

export default function PortalManagePage() {
  const [activeTab, setActiveTab] = useState("notices");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState("100");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-primary text-primary-foreground rounded-lg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-bold">Client</h1>
            <p className="text-xs text-primary-foreground/70">Portal Management</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary-foreground/70">
          <span>Client</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary-foreground font-medium">Portal Manage</span>
        </div>
      </div>

      {/* Vertical Tab Layout */}
      <div className="flex gap-4">
        {/* Left Tab Menu */}
        <Card className="w-56 shrink-0 p-2">
          <div className="flex flex-col gap-1">
            {tabItems.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
                  activeTab === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Right Content */}
        <Card className="flex-1 p-4">
          {activeTab === "notices" && <NoticesTab search={search} setSearch={setSearch} pageSize={pageSize} setPageSize={setPageSize} />}
          {activeTab === "media" && <MediaServersTab />}
          {activeTab === "news" && <NewsEventsTab search={search} setSearch={setSearch} pageSize={pageSize} setPageSize={setPageSize} />}
          {activeTab === "speed" && <SpeedTestTab />}
          {activeTab === "clients" && <RegisteredClientsTab search={search} setSearch={setSearch} pageSize={pageSize} setPageSize={setPageSize} />}
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// NOTICES TAB
// ════════════════════════════════════
function NoticesTab({ search, setSearch, pageSize, setPageSize }: { search: string; setSearch: (v: string) => void; pageSize: string; setPageSize: (v: string) => void }) {
  const [noticeDialogOpen, setNoticeDialogOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDetails, setNoticeDetails] = useState("");

  const handleNoticeSubmit = () => {
    console.log("Notice submitted:", { noticeTitle, noticeDetails });
    setNoticeTitle("");
    setNoticeDetails("");
    setNoticeDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1.5" />Generate PDF</Button>
          <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 mr-1.5" />Generate CSV</Button>
        </div>
        <Button size="sm" onClick={() => setNoticeDialogOpen(true)}><Plus className="h-4 w-4 mr-1.5" />New Notice</Button>
      </div>

      {/* Add New Notice Dialog */}
      <Dialog open={noticeDialogOpen} onOpenChange={setNoticeDialogOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="bg-primary text-primary-foreground px-5 py-4">
            <DialogTitle className="text-base font-bold text-primary-foreground">Add New Notice</DialogTitle>
          </DialogHeader>

          <div className="p-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide">
                Notice Title <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter notice title"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide">
                Notice Details <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Enter notice details..."
                value={noticeDetails}
                onChange={(e) => setNoticeDetails(e.target.value)}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter className="border-t px-5 py-3 flex-row justify-between sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => setNoticeDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-1.5" />
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNoticeSubmit}
              disabled={!noticeTitle.trim() || !noticeDetails.trim()}
            >
              <Check className="h-4 w-4 mr-1.5" />
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show entries + Search */}
      <EntriesSearchBar search={search} setSearch={setSearch} pageSize={pageSize} setPageSize={setPageSize} />

      {/* Table */}
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="text-primary-foreground font-bold text-xs">SR.</TableHead>
              <TableHead className="text-primary-foreground font-bold text-xs">TITLE</TableHead>
              <TableHead className="text-primary-foreground font-bold text-xs">DETAILS</TableHead>
              <TableHead className="text-primary-foreground font-bold text-xs">CREATED ON</TableHead>
              <TableHead className="text-primary-foreground font-bold text-xs">CREATED BY</TableHead>
              <TableHead className="text-primary-foreground font-bold text-xs text-center">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoNotices.map((n, i) => (
              <TableRow key={n.id}>
                <TableCell className="text-xs">{i + 1}</TableCell>
                <TableCell className="text-xs font-medium">{n.title}</TableCell>
                <TableCell className="text-xs max-w-[250px] truncate">{n.details}</TableCell>
                <TableCell className="text-xs">{n.createdOn}</TableCell>
                <TableCell className="text-xs">{n.createdBy}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationInfo total={demoNotices.length} pageSize={parseInt(pageSize)} />
    </div>
  );
}

// ════════════════════════════════════
// MEDIA SERVERS TAB
// ════════════════════════════════════
const demoMediaServers = [
  { id: "ms1", title: "BDFlix", category: "Entertainment", mediaLink: "https://bdflix.com", details: "Bangla movie streaming" },
  { id: "ms2", title: "YouTube BD", category: "Video", mediaLink: "https://youtube.com", details: "Video streaming platform" },
  { id: "ms3", title: "Toffee", category: "Entertainment", mediaLink: "https://toffeelive.com", details: "Live TV and movies" },
  { id: "ms4", title: "Chorki", category: "Entertainment", mediaLink: "https://chorki.com", details: "Premium OTT platform" },
  { id: "ms5", title: "Bioscope", category: "Video", mediaLink: "https://bioscope.live", details: "Live streaming service" },
];

function MediaServersTab() {
  const [subTab, setSubTab] = useState("categories");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDetails, setCategoryDetails] = useState("");
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaPageSize, setMediaPageSize] = useState("10");

  const [serverDialogOpen, setServerDialogOpen] = useState(false);
  const [serverCategory, setServerCategory] = useState("");
  const [serverName, setServerName] = useState("");
  const [serverLogo, setServerLogo] = useState<File | null>(null);
  const [serverLink, setServerLink] = useState("");
  const [serverDetails, setServerDetails] = useState("");

  const handleCategorySubmit = () => {
    console.log("Category submitted:", { categoryName, categoryDetails });
    setCategoryName("");
    setCategoryDetails("");
    setCategoryDialogOpen(false);
  };

  const handleServerSubmit = () => {
    console.log("Server submitted:", { serverCategory, serverName, serverLogo, serverLink, serverDetails });
    setServerCategory("");
    setServerName("");
    setServerLogo(null);
    setServerLink("");
    setServerDetails("");
    setServerDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="categories">Server Categories</TabsTrigger>
          <TabsTrigger value="servers">Media Servers</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setCategoryDialogOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Add Server Category</Button>
          </div>

          {/* Add Media Server Category Dialog */}
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
              <DialogHeader className="bg-primary text-primary-foreground px-5 py-4">
                <DialogTitle className="text-base font-bold text-primary-foreground">Add Media Server Category</DialogTitle>
              </DialogHeader>

              <div className="p-5 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide">
                    Media Server Category <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide">
                    Details (Optional)
                  </Label>
                  <Textarea
                    placeholder="Enter category details..."
                    value={categoryDetails}
                    onChange={(e) => setCategoryDetails(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter className="border-t px-5 py-3 flex-row justify-between sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => setCategoryDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCategorySubmit}
                  disabled={!categoryName.trim()}
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground font-bold text-xs">SR.</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs">MEDIA CATEGORY</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs">DESCRIPTION</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs text-center">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoMediaCategories.map((c, i) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs">{i + 1}</TableCell>
                    <TableCell className="text-xs font-medium">{c.category}</TableCell>
                    <TableCell className="text-xs">{c.description}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="servers" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setServerDialogOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Add Media Server</Button>
          </div>

          {/* Add Media Server Dialog */}
          <Dialog open={serverDialogOpen} onOpenChange={setServerDialogOpen}>
            <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
              <DialogHeader className="bg-primary text-primary-foreground px-5 py-4">
                <DialogTitle className="text-base font-bold text-primary-foreground">Add Media Server</DialogTitle>
              </DialogHeader>

              <div className="p-5 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide">
                    Media Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={serverCategory} onValueChange={setServerCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {demoMediaCategories.map((c) => (
                        <SelectItem key={c.id} value={c.category}>{c.category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide">
                    Media Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Enter media server name"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide">
                    Media Logo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setServerLogo(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide">
                    Media Link <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Enter media server link"
                    value={serverLink}
                    onChange={(e) => setServerLink(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide">
                    Details (Optional)
                  </Label>
                  <Textarea
                    placeholder="Enter details..."
                    value={serverDetails}
                    onChange={(e) => setServerDetails(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="border-t px-5 py-3 flex-row justify-between sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => setServerDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleServerSubmit}
                  disabled={!serverCategory || !serverName.trim() || !serverLink.trim() || !serverLogo}
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <EntriesSearchBar search={mediaSearch} setSearch={setMediaSearch} pageSize={mediaPageSize} setPageSize={setMediaPageSize} />

          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground font-bold text-xs">SR.</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs">PHOTO</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs">TITLE</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs">CATEGORY</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs">MEDIA LINK</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs">DETAILS</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs text-center">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoMediaServers
                  .filter((s) => !mediaSearch || s.title.toLowerCase().includes(mediaSearch.toLowerCase()) || s.category.toLowerCase().includes(mediaSearch.toLowerCase()))
                  .map((s, i) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs">{i + 1}</TableCell>
                    <TableCell>
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                        <Image className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{s.title}</TableCell>
                    <TableCell className="text-xs">{s.category}</TableCell>
                    <TableCell className="text-xs">
                      <a href={s.mediaLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{s.mediaLink}</a>
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{s.details}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationInfo total={demoMediaServers.length} pageSize={parseInt(mediaPageSize)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ════════════════════════════════════
// NEWS & EVENTS TAB
// ════════════════════════════════════
function NewsEventsTab({ search, setSearch, pageSize, setPageSize }: { search: string; setSearch: (v: string) => void; pageSize: string; setPageSize: (v: string) => void }) {
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsDetails, setNewsDetails] = useState("");

  const handleNewsSubmit = () => {
    if (!newsTitle.trim() || !newsDetails.trim()) return;
    setNewsDialogOpen(false);
    setNewsTitle("");
    setNewsDetails("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1.5" />Generate PDF</Button>
          <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 mr-1.5" />Generate CSV</Button>
        </div>
        <Button size="sm" onClick={() => setNewsDialogOpen(true)}><Plus className="h-4 w-4 mr-1.5" />News & Events</Button>
      </div>

      <EntriesSearchBar search={search} setSearch={setSearch} pageSize={pageSize} setPageSize={setPageSize} />

      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="text-primary-foreground font-bold text-xs">SR.</TableHead>
              <TableHead className="text-primary-foreground font-bold text-xs">PHOTO</TableHead>
              <TableHead className="text-primary-foreground font-bold text-xs">TITLE</TableHead>
              <TableHead className="text-primary-foreground font-bold text-xs">DETAILS</TableHead>
              <TableHead className="text-primary-foreground font-bold text-xs">CREATED ON</TableHead>
              <TableHead className="text-primary-foreground font-bold text-xs">CREATED BY</TableHead>
              <TableHead className="text-primary-foreground font-bold text-xs text-center">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoNewsEvents.map((n, i) => (
              <TableRow key={n.id}>
                <TableCell className="text-xs">{i + 1}</TableCell>
                <TableCell>
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell className="text-xs font-medium">{n.title}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">{n.details}</TableCell>
                <TableCell className="text-xs">{n.createdOn}</TableCell>
                <TableCell className="text-xs">{n.createdBy}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationInfo total={demoNewsEvents.length} pageSize={parseInt(pageSize)} />

      {/* Add News & Events Dialog */}
      <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="bg-primary px-5 py-3">
            <DialogTitle className="text-primary-foreground text-base font-bold">Add News & Events</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-5 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide">
                News & Events Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                placeholder="Enter news or event title"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide">
                News & Events Details <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={newsDetails}
                onChange={(e) => setNewsDetails(e.target.value)}
                placeholder="Enter details..."
                rows={4}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide">
                News & Events Images <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*" className="flex-1" />
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="px-5 py-3 border-t flex-row justify-between sm:justify-between gap-2">
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setNewsDialogOpen(false)}>
              <X className="h-4 w-4 mr-1.5" />Cancel
            </Button>
            <Button variant="outline" onClick={handleNewsSubmit}>
              <Check className="h-4 w-4 mr-1.5" />Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ════════════════════════════════════
// SPEED TEST SERVER TAB
// ════════════════════════════════════
function SpeedTestTab() {
  const [speedTestType, setSpeedTestType] = useState("demo");
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wide">Set Demo/Custom Speed Test?</Label>
        <RadioGroup value={speedTestType} onValueChange={setSpeedTestType} className="flex gap-6">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="demo" id="demo" />
            <Label htmlFor="demo" className="text-sm cursor-pointer">Demo Speed Test</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom" className="text-sm cursor-pointer">Custom Speed Test</Label>
          </div>
        </RadioGroup>
      </div>

      {speedTestType === "custom" && (
        <div className="space-y-3 max-w-md">
          <div>
            <Label className="text-xs font-bold uppercase">Speed Test Server URL</Label>
            <Input placeholder="https://your-speedtest-server.com" className="mt-1" />
          </div>
        </div>
      )}

      <Button><FileText className="h-4 w-4 mr-1.5" />Save or Update</Button>
    </div>
  );
}

// ════════════════════════════════════
// REGISTERED CLIENTS TAB
// ════════════════════════════════════
function RegisteredClientsTab({ search, setSearch, pageSize, setPageSize }: { search: string; setSearch: (v: string) => void; pageSize: string; setPageSize: (v: string) => void }) {
  const totalRegistered = demoRegisteredClients.length;
  const appUsers = demoRegisteredClients.filter(c => c.isAppUser).length;
  const nonAppUsers = totalRegistered - appUsers;

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Registered" value={totalRegistered} gradient="from-blue-500 to-blue-600" icon={Users} />
        <StatCard label="App Users" value={appUsers} gradient="from-emerald-500 to-emerald-600" icon={Smartphone} />
        <StatCard label="Non-App Users" value={nonAppUsers} gradient="from-orange-500 to-orange-600" icon={UserX} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <Label className="text-xs font-bold uppercase">User Type</Label>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] h-9 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="app">App Users</SelectItem>
              <SelectItem value="non-app">Non-App Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <EntriesSearchBar search={search} setSearch={setSearch} pageSize={pageSize} setPageSize={setPageSize} />

      {/* Table */}
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              {["SR.", "DATE TIME", "C.CODE", "ID/IP", "NAME", "MOBILE NO.", "ZONE", "C.TYPE", "PACKAGE/SPEED", "SERVER", "B.STATUS", "L.STATUS", "REGISTERED ON", "APP USER", "ACTION"].map((h) => (
                <TableHead key={h} className="text-primary-foreground font-bold text-xs whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoRegisteredClients.map((c, i) => (
              <TableRow key={c.id}>
                <TableCell className="text-xs">{i + 1}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{c.dateTime}</TableCell>
                <TableCell className="text-xs">{c.cCode}</TableCell>
                <TableCell className="text-xs">{c.idIp}</TableCell>
                <TableCell className="text-xs font-medium whitespace-nowrap">{c.name}</TableCell>
                <TableCell className="text-xs">{c.mobile}</TableCell>
                <TableCell className="text-xs">{c.zone}</TableCell>
                <TableCell className="text-xs">{c.cType}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{c.package}</TableCell>
                <TableCell className="text-xs">{c.server}</TableCell>
                <TableCell>
                  <Badge variant={c.bStatus === "Paid" ? "default" : "destructive"} className="text-[10px]">
                    {c.bStatus}
                  </Badge>
                </TableCell>
                <TableCell><Switch checked={c.lStatus} className="scale-75" /></TableCell>
                <TableCell className="text-xs whitespace-nowrap">{c.registeredOn}</TableCell>
                <TableCell>
                  <Badge variant={c.isAppUser ? "default" : "secondary"} className="text-[10px]">
                    {c.isAppUser ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600"><Eye className="h-3.5 w-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationInfo total={demoRegisteredClients.length} pageSize={parseInt(pageSize)} />
    </div>
  );
}

// ════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════
function EntriesSearchBar({ search, setSearch, pageSize, setPageSize }: { search: string; setSearch: (v: string) => void; pageSize: string; setPageSize: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold uppercase">Show</span>
        <Select value={pageSize} onValueChange={setPageSize}>
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["10", "25", "50", "100"].map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="font-bold uppercase">Entries</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase">Search:</span>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-[200px] pl-7 text-xs"
            placeholder="Search..."
          />
        </div>
      </div>
    </div>
  );
}

function PaginationInfo({ total, pageSize }: { total: number; pageSize: number }) {
  return (
    <div className="text-xs text-muted-foreground">
      Showing 1 to {Math.min(total, pageSize)} of {total} entries
    </div>
  );
}

function StatCard({ label, value, gradient, icon: Icon }: { label: string; value: number; gradient: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className={cn("rounded-lg bg-gradient-to-r p-4 text-white", gradient)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium opacity-90">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="h-8 w-8 opacity-70" />
      </div>
    </div>
  );
}
