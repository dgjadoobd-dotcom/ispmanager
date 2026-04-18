import { useState } from "react";
import { FileText, Plus, Trash2, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function InvoiceSetupPage() {
  const [showCompanyInfo, setShowCompanyInfo] = useState(true);
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    mobile: "",
    website: "",
    logo: null as File | null,
    address: "",
    invoiceTitle: "Invoice",
    invoicePosition: "left",
    invoicesPerPage: "1",
    marginTop: "0.5",
    marginBottom: "0.5",
  });
  const [notes, setNotes] = useState<string[]>([""]);

  const updateForm = (key: string, value: string | File | null) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addNote = () => setNotes((prev) => [...prev, ""]);
  const removeNote = (index: number) =>
    setNotes((prev) => prev.filter((_, i) => i !== index));
  const updateNote = (index: number, value: string) =>
    setNotes((prev) => prev.map((n, i) => (i === index ? value : n)));

  const handleSave = () => {
    toast.success("Invoice settings updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>System</span>
          <span>/</span>
          <span className="text-foreground font-medium">Invoice Setup</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice Setup</h1>
            <p className="text-sm text-muted-foreground">Setting Up Invoice</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invoice" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoice">Invoice Settings</TabsTrigger>
          <TabsTrigger value="receipt">Money Receipt</TabsTrigger>
        </TabsList>

        <TabsContent value="invoice" className="space-y-5">
          {/* Company Information */}
          <Card className="overflow-hidden border">
            <div className="flex items-center justify-between bg-primary px-4 py-2.5 text-primary-foreground">
              <h2 className="text-sm font-semibold">Company Information</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs">Show on Invoice</span>
                <Switch
                  checked={showCompanyInfo}
                  onCheckedChange={setShowCompanyInfo}
                  className="data-[state=checked]:bg-white/30"
                />
              </div>
            </div>
            {showCompanyInfo && (
              <CardContent className="pt-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Company Name</Label>
                    <Input
                      placeholder="Enter company name"
                      value={form.companyName}
                      onChange={(e) => updateForm("companyName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mobile Number</Label>
                    <Input
                      placeholder="Enter mobile number"
                      value={form.mobile}
                      onChange={(e) => updateForm("mobile", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Website</Label>
                    <Input
                      placeholder="Enter website URL"
                      value={form.website}
                      onChange={(e) => updateForm("website", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Upload Logo</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        updateForm("logo", e.target.files?.[0] ?? null)
                      }
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Address</Label>
                    <Textarea
                      placeholder="Enter company address"
                      rows={3}
                      value={form.address}
                      onChange={(e) => updateForm("address", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Invoice Settings */}
          <Card className="overflow-hidden border">
            <div className="bg-primary px-4 py-2.5 text-primary-foreground">
              <h2 className="text-sm font-semibold">Invoice Settings</h2>
            </div>
            <CardContent className="pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Invoice Title</Label>
                  <Input
                    placeholder="Invoice"
                    value={form.invoiceTitle}
                    onChange={(e) => updateForm("invoiceTitle", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label>Set Position of "Invoice" Word</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Position of the Invoice title on PDF</TooltipContent>
                    </Tooltip>
                  </div>
                  <RadioGroup
                    value={form.invoicePosition}
                    onValueChange={(v) => updateForm("invoicePosition", v)}
                    className="flex gap-4 pt-1"
                  >
                    {["left", "right", "none"].map((pos) => (
                      <div key={pos} className="flex items-center gap-1.5">
                        <RadioGroupItem value={pos} id={`pos-${pos}`} />
                        <Label htmlFor={`pos-${pos}`} className="cursor-pointer capitalize font-normal">
                          {pos}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-1.5">
                  <Label>Number of Invoice Per Page</Label>
                  <Select
                    value={form.invoicesPerPage}
                    onValueChange={(v) => updateForm("invoicesPerPage", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Margin Top (inches)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.marginTop}
                      onChange={(e) => updateForm("marginTop", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Margin Bottom (inches)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.marginBottom}
                      onChange={(e) => updateForm("marginBottom", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note for Invoice */}
          <Card className="overflow-hidden border">
            <div className="flex items-center justify-between bg-primary px-4 py-2.5 text-primary-foreground">
              <h2 className="text-sm font-semibold">Note for Invoice</h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={addNote}
                className="h-7 gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Note
              </Button>
            </div>
            <CardContent className="pt-5">
              <div className="space-y-3">
                {notes.map((note, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Note {i + 1}
                      </Label>
                      <Textarea
                        rows={2}
                        placeholder={`Enter note ${i + 1}`}
                        value={note}
                        onChange={(e) => updateNote(i, e.target.value)}
                      />
                    </div>
                    {notes.length > 1 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="mt-6 h-8 w-8 shrink-0"
                        onClick={() => removeNote(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="gap-2">
              <FileText className="h-4 w-4" />
              Update Invoice Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="receipt">
          <Card className="overflow-hidden border">
            <div className="bg-primary px-4 py-2.5 text-primary-foreground">
              <h2 className="text-sm font-semibold">Money Receipt Settings</h2>
            </div>
            <CardContent className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">Money Receipt settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
