import { useState, useMemo } from "react";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, MapPin, Search, Building2, Map } from "lucide-react";

// ── Types ──
interface Division {
  id: string;
  name: string;
  bnName: string;
  isActive: boolean;
}

interface District {
  id: string;
  name: string;
  bnName: string;
  divisionId: string;
  isActive: boolean;
}

interface Upazilla {
  id: string;
  name: string;
  bnName: string;
  districtId: string;
  isActive: boolean;
}

// ── Initial Data ──
const initialDivisions: Division[] = [
  { id: "d1", name: "Dhaka", bnName: "ঢাকা", isActive: true },
  { id: "d2", name: "Chittagong", bnName: "চট্টগ্রাম", isActive: true },
  { id: "d3", name: "Rajshahi", bnName: "রাজশাহী", isActive: true },
  { id: "d4", name: "Khulna", bnName: "খুলনা", isActive: true },
  { id: "d5", name: "Barisal", bnName: "বরিশাল", isActive: true },
  { id: "d6", name: "Sylhet", bnName: "সিলেট", isActive: true },
  { id: "d7", name: "Rangpur", bnName: "রংপুর", isActive: true },
  { id: "d8", name: "Mymensingh", bnName: "ময়মনসিংহ", isActive: true },
];

const initialDistricts: District[] = [
  // Dhaka Division
  { id: "dt1", name: "Dhaka", bnName: "ঢাকা", divisionId: "d1", isActive: true },
  { id: "dt2", name: "Gazipur", bnName: "গাজীপুর", divisionId: "d1", isActive: true },
  { id: "dt3", name: "Narayanganj", bnName: "নারায়ণগঞ্জ", divisionId: "d1", isActive: true },
  { id: "dt4", name: "Tangail", bnName: "টাঙ্গাইল", divisionId: "d1", isActive: true },
  { id: "dt5", name: "Narsingdi", bnName: "নরসিংদী", divisionId: "d1", isActive: true },
  { id: "dt6", name: "Manikganj", bnName: "মানিকগঞ্জ", divisionId: "d1", isActive: true },
  { id: "dt7", name: "Munshiganj", bnName: "মুন্সিগঞ্জ", divisionId: "d1", isActive: true },
  { id: "dt8", name: "Madaripur", bnName: "মাদারীপুর", divisionId: "d1", isActive: true },
  { id: "dt9", name: "Gopalganj", bnName: "গোপালগঞ্জ", divisionId: "d1", isActive: true },
  { id: "dt10", name: "Faridpur", bnName: "ফরিদপুর", divisionId: "d1", isActive: true },
  { id: "dt11", name: "Rajbari", bnName: "রাজবাড়ী", divisionId: "d1", isActive: true },
  { id: "dt12", name: "Shariatpur", bnName: "শরীয়তপুর", divisionId: "d1", isActive: true },
  { id: "dt13", name: "Kishoreganj", bnName: "কিশোরগঞ্জ", divisionId: "d1", isActive: true },
  // Chittagong Division
  { id: "dt14", name: "Chittagong", bnName: "চট্টগ্রাম", divisionId: "d2", isActive: true },
  { id: "dt15", name: "Cox's Bazar", bnName: "কক্সবাজার", divisionId: "d2", isActive: true },
  { id: "dt16", name: "Comilla", bnName: "কুমিল্লা", divisionId: "d2", isActive: true },
  { id: "dt17", name: "Feni", bnName: "ফেনী", divisionId: "d2", isActive: true },
  { id: "dt18", name: "Brahmanbaria", bnName: "ব্রাহ্মণবাড়িয়া", divisionId: "d2", isActive: true },
  { id: "dt19", name: "Noakhali", bnName: "নোয়াখালী", divisionId: "d2", isActive: true },
  { id: "dt20", name: "Lakshmipur", bnName: "লক্ষ্মীপুর", divisionId: "d2", isActive: true },
  { id: "dt21", name: "Chandpur", bnName: "চাঁদপুর", divisionId: "d2", isActive: true },
  { id: "dt22", name: "Rangamati", bnName: "রাঙ্গামাটি", divisionId: "d2", isActive: true },
  { id: "dt23", name: "Khagrachari", bnName: "খাগড়াছড়ি", divisionId: "d2", isActive: true },
  { id: "dt24", name: "Bandarban", bnName: "বান্দরবান", divisionId: "d2", isActive: true },
  // Rajshahi Division
  { id: "dt25", name: "Rajshahi", bnName: "রাজশাহী", divisionId: "d3", isActive: true },
  { id: "dt26", name: "Bogra", bnName: "বগুড়া", divisionId: "d3", isActive: true },
  { id: "dt27", name: "Pabna", bnName: "পাবনা", divisionId: "d3", isActive: true },
  { id: "dt28", name: "Sirajganj", bnName: "সিরাজগঞ্জ", divisionId: "d3", isActive: true },
  { id: "dt29", name: "Natore", bnName: "নাটোর", divisionId: "d3", isActive: true },
  { id: "dt30", name: "Nawabganj", bnName: "নবাবগঞ্জ", divisionId: "d3", isActive: true },
  { id: "dt31", name: "Naogaon", bnName: "নওগাঁ", divisionId: "d3", isActive: true },
  { id: "dt32", name: "Joypurhat", bnName: "জয়পুরহাট", divisionId: "d3", isActive: true },
  // Khulna Division
  { id: "dt33", name: "Khulna", bnName: "খুলনা", divisionId: "d4", isActive: true },
  { id: "dt34", name: "Jessore", bnName: "যশোর", divisionId: "d4", isActive: true },
  { id: "dt35", name: "Satkhira", bnName: "সাতক্ষীরা", divisionId: "d4", isActive: true },
  { id: "dt36", name: "Bagerhat", bnName: "বাগেরহাট", divisionId: "d4", isActive: true },
  { id: "dt37", name: "Narail", bnName: "নড়াইল", divisionId: "d4", isActive: true },
  { id: "dt38", name: "Magura", bnName: "মাগুরা", divisionId: "d4", isActive: true },
  { id: "dt39", name: "Jhenaidah", bnName: "ঝিনাইদহ", divisionId: "d4", isActive: true },
  { id: "dt40", name: "Kushtia", bnName: "কুষ্টিয়া", divisionId: "d4", isActive: true },
  { id: "dt41", name: "Chuadanga", bnName: "চুয়াডাঙ্গা", divisionId: "d4", isActive: true },
  { id: "dt42", name: "Meherpur", bnName: "মেহেরপুর", divisionId: "d4", isActive: true },
  // Barisal Division
  { id: "dt43", name: "Barisal", bnName: "বরিশাল", divisionId: "d5", isActive: true },
  { id: "dt44", name: "Patuakhali", bnName: "পটুয়াখালী", divisionId: "d5", isActive: true },
  { id: "dt45", name: "Bhola", bnName: "ভোলা", divisionId: "d5", isActive: true },
  { id: "dt46", name: "Pirojpur", bnName: "পিরোজপুর", divisionId: "d5", isActive: true },
  { id: "dt47", name: "Jhalokati", bnName: "ঝালকাঠি", divisionId: "d5", isActive: true },
  { id: "dt48", name: "Barguna", bnName: "বরগুনা", divisionId: "d5", isActive: true },
  // Sylhet Division
  { id: "dt49", name: "Sylhet", bnName: "সিলেট", divisionId: "d6", isActive: true },
  { id: "dt50", name: "Moulvibazar", bnName: "মৌলভীবাজার", divisionId: "d6", isActive: true },
  { id: "dt51", name: "Habiganj", bnName: "হবিগঞ্জ", divisionId: "d6", isActive: true },
  { id: "dt52", name: "Sunamganj", bnName: "সুনামগঞ্জ", divisionId: "d6", isActive: true },
  // Rangpur Division
  { id: "dt53", name: "Rangpur", bnName: "রংপুর", divisionId: "d7", isActive: true },
  { id: "dt54", name: "Dinajpur", bnName: "দিনাজপুর", divisionId: "d7", isActive: true },
  { id: "dt55", name: "Kurigram", bnName: "কুড়িগ্রাম", divisionId: "d7", isActive: true },
  { id: "dt56", name: "Gaibandha", bnName: "গাইবান্ধা", divisionId: "d7", isActive: true },
  { id: "dt57", name: "Nilphamari", bnName: "নীলফামারী", divisionId: "d7", isActive: true },
  { id: "dt58", name: "Lalmonirhat", bnName: "লালমনিরহাট", divisionId: "d7", isActive: true },
  { id: "dt59", name: "Thakurgaon", bnName: "ঠাকুরগাঁও", divisionId: "d7", isActive: true },
  { id: "dt60", name: "Panchagarh", bnName: "পঞ্চগড়", divisionId: "d7", isActive: true },
  // Mymensingh Division
  { id: "dt61", name: "Mymensingh", bnName: "ময়মনসিংহ", divisionId: "d8", isActive: true },
  { id: "dt62", name: "Jamalpur", bnName: "জামালপুর", divisionId: "d8", isActive: true },
  { id: "dt63", name: "Netrokona", bnName: "নেত্রকোনা", divisionId: "d8", isActive: true },
  { id: "dt64", name: "Sherpur", bnName: "শেরপুর", divisionId: "d8", isActive: true },
];

const initialUpazillas: Upazilla[] = [
  // Sample upazillas for Dhaka district
  { id: "u1", name: "Dhamrai", bnName: "ধামরাই", districtId: "dt1", isActive: true },
  { id: "u2", name: "Dohar", bnName: "দোহার", districtId: "dt1", isActive: true },
  { id: "u3", name: "Keraniganj", bnName: "কেরানীগঞ্জ", districtId: "dt1", isActive: true },
  { id: "u4", name: "Nawabganj", bnName: "নবাবগঞ্জ", districtId: "dt1", isActive: true },
  { id: "u5", name: "Savar", bnName: "সাভার", districtId: "dt1", isActive: true },
  // Gazipur
  { id: "u6", name: "Gazipur Sadar", bnName: "গাজীপুর সদর", districtId: "dt2", isActive: true },
  { id: "u7", name: "Kaliakair", bnName: "কালিয়াকৈর", districtId: "dt2", isActive: true },
  { id: "u8", name: "Kaliganj", bnName: "কালীগঞ্জ", districtId: "dt2", isActive: true },
  { id: "u9", name: "Kapasia", bnName: "কাপাসিয়া", districtId: "dt2", isActive: true },
  { id: "u10", name: "Sreepur", bnName: "শ্রীপুর", districtId: "dt2", isActive: true },
  // Chittagong
  { id: "u11", name: "Anwara", bnName: "আনোয়ারা", districtId: "dt14", isActive: true },
  { id: "u12", name: "Banshkhali", bnName: "বাঁশখালী", districtId: "dt14", isActive: true },
  { id: "u13", name: "Boalkhali", bnName: "বোয়ালখালী", districtId: "dt14", isActive: true },
  { id: "u14", name: "Hathazari", bnName: "হাটহাজারী", districtId: "dt14", isActive: true },
  { id: "u15", name: "Patiya", bnName: "পটিয়া", districtId: "dt14", isActive: true },
  // Comilla
  { id: "u16", name: "Comilla Sadar", bnName: "কুমিল্লা সদর", districtId: "dt16", isActive: true },
  { id: "u17", name: "Debidwar", bnName: "দেবিদ্বার", districtId: "dt16", isActive: true },
  { id: "u18", name: "Laksam", bnName: "লাকসাম", districtId: "dt16", isActive: true },
];

// ── Generic CRUD Table Component ──
function CrudTable<T extends { id: string; name: string; isActive: boolean }>({
  items,
  columns,
  search,
  setSearch,
  perPage,
  setPerPage,
  page,
  setPage,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  addLabel,
}: {
  items: T[];
  columns: { key: string; label: string; render: (item: T) => React.ReactNode }[];
  search: string;
  setSearch: (s: string) => void;
  perPage: string;
  setPerPage: (s: string) => void;
  page: number;
  setPage: (n: number) => void;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onToggle: (item: T) => void;
  addLabel: string;
}) {
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );
  const pp = parseInt(perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pp));
  const paginated = filtered.slice((page - 1) * pp, page * pp);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Show</span>
            <Select value={perPage} onValueChange={(v) => { setPerPage(v); setPage(1); }}>
              <SelectTrigger className="w-[70px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["5", "10", "25", "50"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
            </div>
            <Button size="sm" onClick={onAdd} className="shrink-0">
              <Plus className="h-4 w-4 mr-1" />{addLabel}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-center">#</TableHead>
                {columns.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead className="w-28 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={columns.length + 3} className="text-center py-8 text-muted-foreground">No data found</TableCell></TableRow>
              ) : paginated.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center text-muted-foreground">{(page - 1) * pp + idx + 1}</TableCell>
                  {columns.map((c) => <TableCell key={c.key}>{c.render(item)}</TableCell>)}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch checked={item.isActive} onCheckedChange={() => onToggle(item)} />
                      <Badge variant={item.isActive ? "default" : "secondary"} className="text-[10px]">
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary" onClick={() => onEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(item)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filtered.length === 0 ? 0 : (page - 1) * pp + 1} to {Math.min(page * pp, filtered.length)} of {filtered.length} entries</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i + 1} variant={page === i + 1 ? "default" : "outline"} size="sm" className="w-9" onClick={() => setPage(i + 1)}>{i + 1}</Button>
            )).slice(Math.max(0, page - 3), page + 2)}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──
export default function AreaManagementPage() {
  const [divisions, setDivisions] = useState<Division[]>(initialDivisions);
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [upazillas, setUpazillas] = useState<Upazilla[]>(initialUpazillas);

  // Tab search/pagination state
  const [divSearch, setDivSearch] = useState("");
  const [divPerPage, setDivPerPage] = useState("10");
  const [divPage, setDivPage] = useState(1);

  const [distSearch, setDistSearch] = useState("");
  const [distPerPage, setDistPerPage] = useState("10");
  const [distPage, setDistPage] = useState(1);
  const [distFilterDiv, setDistFilterDiv] = useState("all");

  const [upSearch, setUpSearch] = useState("");
  const [upPerPage, setUpPerPage] = useState("10");
  const [upPage, setUpPage] = useState(1);
  const [upFilterDist, setUpFilterDist] = useState("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"division" | "district" | "upazilla">("division");
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formBnName, setFormBnName] = useState("");
  const [formParentId, setFormParentId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  // Filtered districts/upazillas
  const filteredDistricts = useMemo(() => {
    let list = districts;
    if (distFilterDiv !== "all") list = list.filter((d) => d.divisionId === distFilterDiv);
    return list;
  }, [districts, distFilterDiv]);

  const filteredUpazillas = useMemo(() => {
    let list = upazillas;
    if (upFilterDist !== "all") list = list.filter((u) => u.districtId === upFilterDist);
    return list;
  }, [upazillas, upFilterDist]);

  // Helpers
  const getDivisionName = (id: string) => divisions.find((d) => d.id === id)?.name || "-";
  const getDistrictName = (id: string) => districts.find((d) => d.id === id)?.name || "-";

  // Dialog handlers
  const openAdd = (type: "division" | "district" | "upazilla") => {
    setDialogType(type);
    setEditId(null);
    setFormName("");
    setFormBnName("");
    setFormParentId(type === "district" ? (distFilterDiv !== "all" ? distFilterDiv : "") : type === "upazilla" ? (upFilterDist !== "all" ? upFilterDist : "") : "");
    setDialogOpen(true);
  };

  const openEdit = (type: "division" | "district" | "upazilla", item: any) => {
    setDialogType(type);
    setEditId(item.id);
    setFormName(item.name);
    setFormBnName(item.bnName);
    setFormParentId(type === "district" ? item.divisionId : type === "upazilla" ? item.districtId : "");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (dialogType === "division") {
      if (editId) {
        setDivisions((prev) => prev.map((d) => d.id === editId ? { ...d, name: formName, bnName: formBnName } : d));
      } else {
        setDivisions((prev) => [...prev, { id: `d${Date.now()}`, name: formName, bnName: formBnName, isActive: true }]);
      }
    } else if (dialogType === "district") {
      if (!formParentId) return;
      if (editId) {
        setDistricts((prev) => prev.map((d) => d.id === editId ? { ...d, name: formName, bnName: formBnName, divisionId: formParentId } : d));
      } else {
        setDistricts((prev) => [...prev, { id: `dt${Date.now()}`, name: formName, bnName: formBnName, divisionId: formParentId, isActive: true }]);
      }
    } else {
      if (!formParentId) return;
      if (editId) {
        setUpazillas((prev) => prev.map((u) => u.id === editId ? { ...u, name: formName, bnName: formBnName, districtId: formParentId } : u));
      } else {
        setUpazillas((prev) => [...prev, { id: `u${Date.now()}`, name: formName, bnName: formBnName, districtId: formParentId, isActive: true }]);
      }
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "division") setDivisions((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    else if (deleteTarget.type === "district") setDistricts((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    else setUpazillas((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const dialogTitle = editId
    ? `Edit ${dialogType === "division" ? "Division" : dialogType === "district" ? "District" : "Upazilla"}`
    : `Add ${dialogType === "division" ? "Division" : dialogType === "district" ? "District" : "Upazilla"}`;

  return (
    <PageContainer title="Area Management" description="Manage divisions, districts & upazillas of Bangladesh">
      <Tabs defaultValue="division">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="division" className="gap-1.5">
            <Map className="h-4 w-4" /> Division ({divisions.length})
          </TabsTrigger>
          <TabsTrigger value="district" className="gap-1.5">
            <Building2 className="h-4 w-4" /> District ({districts.length})
          </TabsTrigger>
          <TabsTrigger value="upazilla" className="gap-1.5">
            <MapPin className="h-4 w-4" /> Upazilla ({upazillas.length})
          </TabsTrigger>
        </TabsList>

        {/* Division Tab */}
        <TabsContent value="division">
          <CrudTable
            items={divisions}
            columns={[
              { key: "name", label: "Division Name", render: (d) => <span className="font-medium">{d.name}</span> },
              { key: "bnName", label: "বাংলা নাম", render: (d) => d.bnName },
            ]}
            search={divSearch} setSearch={setDivSearch}
            perPage={divPerPage} setPerPage={setDivPerPage}
            page={divPage} setPage={setDivPage}
            onAdd={() => openAdd("division")}
            onEdit={(d) => openEdit("division", d)}
            onDelete={(d) => setDeleteTarget({ type: "division", id: d.id, name: d.name })}
            onToggle={(d) => setDivisions((prev) => prev.map((x) => x.id === d.id ? { ...x, isActive: !x.isActive } : x))}
            addLabel="Division"
          />
        </TabsContent>

        {/* District Tab */}
        <TabsContent value="district">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter by Division:</span>
            <Select value={distFilterDiv} onValueChange={(v) => { setDistFilterDiv(v); setDistPage(1); }}>
              <SelectTrigger className="w-[200px] h-9"><SelectValue placeholder="All Divisions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                {divisions.filter((d) => d.isActive).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <CrudTable
            items={filteredDistricts}
            columns={[
              { key: "name", label: "District Name", render: (d) => <span className="font-medium">{d.name}</span> },
              { key: "bnName", label: "বাংলা নাম", render: (d) => (d as District).bnName },
              { key: "division", label: "Division", render: (d) => <Badge variant="outline">{getDivisionName((d as District).divisionId)}</Badge> },
            ]}
            search={distSearch} setSearch={setDistSearch}
            perPage={distPerPage} setPerPage={setDistPerPage}
            page={distPage} setPage={setDistPage}
            onAdd={() => openAdd("district")}
            onEdit={(d) => openEdit("district", d)}
            onDelete={(d) => setDeleteTarget({ type: "district", id: d.id, name: d.name })}
            onToggle={(d) => setDistricts((prev) => prev.map((x) => x.id === d.id ? { ...x, isActive: !x.isActive } : x))}
            addLabel="District"
          />
        </TabsContent>

        {/* Upazilla Tab */}
        <TabsContent value="upazilla">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter by District:</span>
            <Select value={upFilterDist} onValueChange={(v) => { setUpFilterDist(v); setUpPage(1); }}>
              <SelectTrigger className="w-[200px] h-9"><SelectValue placeholder="All Districts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.filter((d) => d.isActive).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <CrudTable
            items={filteredUpazillas}
            columns={[
              { key: "name", label: "Upazilla Name", render: (u) => <span className="font-medium">{u.name}</span> },
              { key: "bnName", label: "বাংলা নাম", render: (u) => (u as Upazilla).bnName },
              { key: "district", label: "District", render: (u) => <Badge variant="outline">{getDistrictName((u as Upazilla).districtId)}</Badge> },
            ]}
            search={upSearch} setSearch={setUpSearch}
            perPage={upPerPage} setPerPage={setUpPerPage}
            page={upPage} setPage={setUpPage}
            onAdd={() => openAdd("upazilla")}
            onEdit={(u) => openEdit("upazilla", u)}
            onDelete={(u) => setDeleteTarget({ type: "upazilla", id: u.id, name: u.name })}
            onToggle={(u) => setUpazillas((prev) => prev.map((x) => x.id === u.id ? { ...x, isActive: !x.isActive } : x))}
            addLabel="Upazilla"
          />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {dialogType === "district" && (
              <div className="space-y-2">
                <Label>Division *</Label>
                <Select value={formParentId} onValueChange={setFormParentId}>
                  <SelectTrigger><SelectValue placeholder="Select Division" /></SelectTrigger>
                  <SelectContent>
                    {divisions.filter((d) => d.isActive).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {dialogType === "upazilla" && (
              <div className="space-y-2">
                <Label>District *</Label>
                <Select value={formParentId} onValueChange={setFormParentId}>
                  <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                  <SelectContent>
                    {districts.filter((d) => d.isActive).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Name (English) *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Enter name" />
            </div>
            <div className="space-y-2">
              <Label>নাম (বাংলা)</Label>
              <Input value={formBnName} onChange={(e) => setFormBnName(e.target.value)} placeholder="বাংলায় নাম লিখুন" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.type || ""}`}
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
