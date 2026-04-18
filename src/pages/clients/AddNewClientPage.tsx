import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  User, Phone, Globe, Wifi, Settings, CalendarIcon, Plus, ArrowLeft, Save,
  Upload, MapPin, Facebook, Linkedin, Twitter, Mail, Hash, Shield
} from "lucide-react";

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-t-lg">
      <Icon className="h-4 w-4" />
      <h3 className="font-semibold text-sm tracking-wide uppercase">{title}</h3>
    </div>
  );
}

function FormField({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function DateField({ label, required, value, onChange }: { label: string; required?: boolean; value?: Date; onChange: (d?: Date) => void }) {
  return (
    <FormField label={label} required={required}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-sm", !value && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {value ? format(value, "dd/MM/yyyy") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </FormField>
  );
}

function PhotoUpload({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 h-[120px] bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

export default function AddNewClientPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sameAddress, setSameAddress] = useState(false);
  const [vipClient, setVipClient] = useState(false);
  const [sendSms, setSendSms] = useState(true);
  const [sendGreetings, setSendGreetings] = useState(true);
  const [dob, setDob] = useState<Date>();
  const [joinDate, setJoinDate] = useState<Date>(new Date());
  const [billingStart, setBillingStart] = useState<Date>(new Date());
  const [expireDate, setExpireDate] = useState<Date>();
  const [purchaseDate, setPurchaseDate] = useState<Date>();

  const handleSave = () => {
    toast({ title: "✅ Client saved successfully!", description: "New client has been added to the system." });
    navigate("/dashboard/customers");
  };

  const inputCls = "h-9 text-sm";

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Add New Client</h1>
            <p className="text-xs text-muted-foreground">Client &gt; Add New Client</p>
          </div>
        </div>
      </div>

      {/* Section 1: Personal Information */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <SectionHeader icon={User} title="Personal Information" />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="row-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Profile Picture</label>
              <PhotoUpload label="Upload Photo" />
            </div>
            <FormField label="Customer Name" required>
              <Input placeholder="Full name" className={inputCls} />
            </FormField>
            <FormField label="Occupation">
              <Input placeholder="Occupation" className={inputCls} />
            </FormField>
            <FormField label="Remarks / Special Note">
              <Textarea placeholder="Any special notes..." className="text-sm min-h-[70px]" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="NID / Birth Certificate No" required>
              <Input placeholder="NID number" className={inputCls} />
            </FormField>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">NID Picture</label>
              <PhotoUpload label="Upload NID" />
            </div>
            <FormField label="Reg Form No">
              <Input placeholder="Registration form no" className={inputCls} />
            </FormField>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Registration Picture</label>
              <PhotoUpload label="Upload Reg Form" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Gender">
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Father's Name">
              <Input placeholder="Father's name" className={inputCls} />
            </FormField>
            <DateField label="Date of Birth" value={dob} onChange={setDob} />
            <FormField label="Mother's Name">
              <Input placeholder="Mother's name" className={inputCls} />
            </FormField>
          </div>
        </div>
      </div>

      {/* Section 2: Contact Information */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <SectionHeader icon={Phone} title="Contact Information" />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Map Latitude">
              <Input placeholder="e.g. 23.8103" className={inputCls} />
            </FormField>
            <FormField label="Mobile" required>
              <Input placeholder="01XXXXXXXXX" className={inputCls} />
            </FormField>
            <FormField label="District">
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select district" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dhaka">Dhaka</SelectItem>
                  <SelectItem value="chittagong">Chittagong</SelectItem>
                  <SelectItem value="rajshahi">Rajshahi</SelectItem>
                  <SelectItem value="khulna">Khulna</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Present Address">
              <Textarea placeholder="Present address" className="text-sm min-h-[70px]" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Map Longitude">
              <Input placeholder="e.g. 90.4125" className={inputCls} />
            </FormField>
            <FormField label="Phone">
              <Input placeholder="Phone number" className={inputCls} />
            </FormField>
            <FormField label="Upazilla">
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select upazilla" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mirpur">Mirpur</SelectItem>
                  <SelectItem value="uttara">Uttara</SelectItem>
                  <SelectItem value="dhanmondi">Dhanmondi</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <div className="space-y-2">
              <FormField label="Permanent Address">
                <Textarea placeholder="Permanent address" className="text-sm min-h-[70px]" disabled={sameAddress} />
              </FormField>
              <div className="flex items-center gap-2">
                <Checkbox id="sameAddr" checked={sameAddress} onCheckedChange={(v) => setSameAddress(!!v)} />
                <label htmlFor="sameAddr" className="text-xs text-muted-foreground cursor-pointer">Same as Present Address</label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Facebook">
              <Input placeholder="Facebook profile URL" className={inputCls} />
            </FormField>
            <FormField label="Email">
              <Input type="email" placeholder="email@example.com" className={inputCls} />
            </FormField>
            <FormField label="Road No">
              <Input placeholder="Road no" className={inputCls} />
            </FormField>
            <FormField label="House No">
              <Input placeholder="House no" className={inputCls} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="LinkedIn">
              <Input placeholder="LinkedIn URL" className={inputCls} />
            </FormField>
            <FormField label="Twitter">
              <Input placeholder="Twitter handle" className={inputCls} />
            </FormField>
          </div>
        </div>
      </div>

      {/* Section 3: Network & Product Info */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <SectionHeader icon={Wifi} title="Network & Product Information" />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Server" required>
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select server" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mikrotik-1">MikroTik-1</SelectItem>
                  <SelectItem value="mikrotik-2">MikroTik-2</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Protocol Type" required>
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select protocol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pppoe">PPPoE</SelectItem>
                  <SelectItem value="static">Static</SelectItem>
                  <SelectItem value="dhcp">DHCP</SelectItem>
                  <SelectItem value="hotspot">Hotspot</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Zone" required>
              <div className="flex gap-1">
                <Select>
                  <SelectTrigger className={cn(inputCls, "flex-1")}><SelectValue placeholder="Select zone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north">North Zone</SelectItem>
                    <SelectItem value="south">South Zone</SelectItem>
                    <SelectItem value="east">East Zone</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            </FormField>
            <FormField label="Connection Type" required>
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiber">Fiber</SelectItem>
                  <SelectItem value="cable">Cable</SelectItem>
                  <SelectItem value="wireless">Wireless</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Sub Zone">
              <div className="flex gap-1">
                <Select>
                  <SelectTrigger className={cn(inputCls, "flex-1")}><SelectValue placeholder="Select sub zone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sub1">Sub Zone A</SelectItem>
                    <SelectItem value="sub2">Sub Zone B</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            </FormField>
            <FormField label="Box">
              <div className="flex gap-1">
                <Select>
                  <SelectTrigger className={cn(inputCls, "flex-1")}><SelectValue placeholder="Select box" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="box1">Box 1</SelectItem>
                    <SelectItem value="box2">Box 2</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            </FormField>
            <FormField label="Cable Required">
              <Input placeholder="e.g. 100 meter" className={inputCls} />
            </FormField>
            <FormField label="Fiber Code">
              <Input placeholder="Fiber code" className={inputCls} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Number of Core">
              <Input placeholder="e.g. 4" className={inputCls} />
            </FormField>
            <FormField label="Core Color">
              <Input placeholder="e.g. Blue" className={inputCls} />
            </FormField>
            <FormField label="Device">
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select device" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="router">Router</SelectItem>
                  <SelectItem value="onu">ONU</SelectItem>
                  <SelectItem value="ont">ONT</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="MAC / Serial">
              <Input placeholder="MAC or Serial number" className={inputCls} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Vendor">
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tp-link">TP-Link</SelectItem>
                  <SelectItem value="huawei">Huawei</SelectItem>
                  <SelectItem value="mikrotik">MikroTik</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <DateField label="Purchase Date" value={purchaseDate} onChange={setPurchaseDate} />
          </div>
        </div>
      </div>

      {/* Section 4: Service Information */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <SectionHeader icon={Settings} title="Service Information" />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Client Code" required>
              <Input placeholder="Auto / Manual" className={inputCls} />
            </FormField>
            <FormField label="Package" required>
              <div className="flex gap-1">
                <Select>
                  <SelectTrigger className={cn(inputCls, "flex-1")}><SelectValue placeholder="Select package" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic 10Mbps</SelectItem>
                    <SelectItem value="standard">Standard 20Mbps</SelectItem>
                    <SelectItem value="premium">Premium 50Mbps</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            </FormField>
            <FormField label="Profile" required>
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select profile" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Client Type" required>
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select client type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Billing Status" required>
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Username / IP" required>
              <Input placeholder="Username or IP" className={inputCls} />
            </FormField>
            <FormField label="Password" required>
              <Input type="password" placeholder="Password" className={inputCls} />
            </FormField>
            <DateField label="Join Date" required value={joinDate} onChange={(d) => d && setJoinDate(d)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Monthly Bill" required>
              <Input type="number" placeholder="0.00" className={inputCls} />
            </FormField>
            <DateField label="Billing Start Date" required value={billingStart} onChange={(d) => d && setBillingStart(d)} />
            <DateField label="Expire Date" required value={expireDate} onChange={setExpireDate} />
            <FormField label="Referred By">
              <Input placeholder="Referral name" className={inputCls} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Connected By">
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="emp1">Employee 1</SelectItem>
                  <SelectItem value="emp2">Employee 2</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Assign To">
              <Select>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="emp1">Employee 1</SelectItem>
                  <SelectItem value="emp2">Employee 2</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Affiliator">
              <Input placeholder="Affiliator name" className={inputCls} />
            </FormField>
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Checkbox id="vip" checked={vipClient} onCheckedChange={(v) => setVipClient(!!v)} />
              <label htmlFor="vip" className="text-sm cursor-pointer flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-amber-500" /> VIP Client
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sms" checked={sendSms} onCheckedChange={(v) => setSendSms(!!v)} />
              <label htmlFor="sms" className="text-sm cursor-pointer">Send SMS</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="greet" checked={sendGreetings} onCheckedChange={(v) => setSendGreetings(!!v)} />
              <label htmlFor="greet" className="text-sm cursor-pointer">Send Greetings</label>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-4 border-t border-border">
        <Button variant="outline" onClick={() => navigate("/dashboard/customers")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go To List
        </Button>
        <Button onClick={handleSave} className="min-w-[140px]">
          <Save className="h-4 w-4 mr-2" /> Save & Exit
        </Button>
      </div>
    </div>
  );
}
