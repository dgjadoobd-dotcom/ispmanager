import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { toast } from "sonner";

interface PurchaseItem {
  id: string;
  item: string;
  description: string;
  sequenceable: boolean;
  startsWith: string;
  serialMac: string;
  storeRoom: string;
  unit: string;
  quantity: number;
  rate: number;
  vat: number;
}

const demoVendors = [
  "Shadhin Wi Fi",
  "E G Tach Wi Fi",
  "Arifa Network",
  "FiberTech Solutions",
  "NetCore Supplies",
  "Digital Cable BD",
  "BDCom Trading",
  "RuiJie Distributors",
];

const demoItems = [
  "ONU Device",
  "Fiber Cable (1km)",
  "Patch Cord",
  "OLT Module",
  "UTP Cable (Box)",
  "Connector RJ45",
  "Splitter 1:8",
  "Media Converter",
  "Router Board",
  "POE Switch",
];

const storeRooms = ["Main Store", "Branch Store", "Warehouse A", "Warehouse B"];
const units = ["Pcs", "Box", "Roll", "Meter", "Set", "Kg"];

const createEmptyItem = (): PurchaseItem => ({
  id: crypto.randomUUID(),
  item: "",
  description: "",
  sequenceable: false,
  startsWith: "",
  serialMac: "",
  storeRoom: "",
  unit: "",
  quantity: 1,
  rate: 0,
  vat: 0,
});

const PurchasePage = () => {
  const navigate = useNavigate();
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [vendor, setVendor] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([createEmptyItem()]);

  const purchaseId = useMemo(() => `PUR-${Date.now().toString(36).toUpperCase()}`, []);

  const updateItem = (id: string, field: keyof PurchaseItem, value: any) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => setItems((prev) => [...prev, createEmptyItem()]);

  const getRowTotal = (item: PurchaseItem) => {
    const subtotal = item.quantity * item.rate;
    return subtotal + subtotal * (item.vat / 100);
  };

  const grandTotal = items.reduce((sum, item) => sum + getRowTotal(item), 0);

  const handleSave = () => {
    if (!vendor) {
      toast.error("Please select a vendor");
      return;
    }
    toast.success("Purchase entry saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Purchase Entry</h1>
            <p className="text-sm text-muted-foreground">Purchase &gt; Purchase Entry</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>

      {/* Form Fields */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label>Purchase ID</Label>
              <Input value={purchaseId} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Auto Generated</p>
            </div>
            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select value={vendor} onValueChange={setVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  {demoVendors.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground font-semibold min-w-[140px]">Item</TableHead>
                  <TableHead className="text-primary-foreground font-semibold min-w-[120px]">Description</TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-center w-[90px]">Seq.</TableHead>
                  <TableHead className="text-primary-foreground font-semibold min-w-[100px]">Starts With</TableHead>
                  <TableHead className="text-primary-foreground font-semibold min-w-[120px]">Serial/Mac</TableHead>
                  <TableHead className="text-primary-foreground font-semibold min-w-[120px]">Store Room</TableHead>
                  <TableHead className="text-primary-foreground font-semibold min-w-[90px]">Unit</TableHead>
                  <TableHead className="text-primary-foreground font-semibold w-[80px] text-right">Qty</TableHead>
                  <TableHead className="text-primary-foreground font-semibold w-[90px] text-right">Rate</TableHead>
                  <TableHead className="text-primary-foreground font-semibold w-[70px] text-right">VAT%</TableHead>
                  <TableHead className="text-primary-foreground font-semibold w-[100px] text-right">Total</TableHead>
                  <TableHead className="text-primary-foreground font-semibold w-[50px] text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="p-1.5">
                      <Select value={item.item} onValueChange={(v) => updateItem(item.id, "item", v)}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {demoItems.map((i) => (
                            <SelectItem key={i} value={i}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input className="h-9 text-xs" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} />
                    </TableCell>
                    <TableCell className="p-1.5 text-center">
                      <Switch checked={item.sequenceable} onCheckedChange={(v) => updateItem(item.id, "sequenceable", v)} />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input className="h-9 text-xs" value={item.startsWith} onChange={(e) => updateItem(item.id, "startsWith", e.target.value)} disabled={!item.sequenceable} />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input className="h-9 text-xs" value={item.serialMac} onChange={(e) => updateItem(item.id, "serialMac", e.target.value)} />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select value={item.storeRoom} onValueChange={(v) => updateItem(item.id, "storeRoom", v)}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {storeRooms.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select value={item.unit} onValueChange={(v) => updateItem(item.id, "unit", v)}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input type="number" min={0} className="h-9 text-xs text-right" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input type="number" min={0} className="h-9 text-xs text-right" value={item.rate} onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))} />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input type="number" min={0} className="h-9 text-xs text-right" value={item.vat} onChange={(e) => updateItem(item.id, "vat", Number(e.target.value))} />
                    </TableCell>
                    <TableCell className="p-1.5 text-right font-medium text-sm">
                      ৳{getRowTotal(item).toFixed(2)}
                    </TableCell>
                    <TableCell className="p-1.5 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeItem(item.id)} disabled={items.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={10} className="text-right font-bold text-base">Grand Total</TableCell>
                  <TableCell className="text-right font-bold text-base text-primary">৳{grandTotal.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <div className="p-4">
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Remarks & Save */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>REMARKS / NOTE</Label>
            <Textarea placeholder="Enter remarks or notes..." value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} className="px-8">
              Save Purchase
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchasePage;
