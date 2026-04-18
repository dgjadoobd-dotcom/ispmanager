import React, { useState, useMemo } from "react";
import { MessageSquare, Send, ArrowRightLeft, Users, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";

const templates = [
  { id: "1", name: "Payment Reminder", body: "Dear {name}, your bill of ৳{amount} is due on {date}. Please pay soon." },
  { id: "2", name: "Welcome Message", body: "Welcome to our network, {name}! Your connection is now active." },
  { id: "3", name: "Service Disruption", body: "Dear {name}, we apologize for the service disruption. Our team is working on it." },
  { id: "4", name: "Package Upgrade", body: "Dear {name}, upgrade your package today and enjoy faster speeds!" },
];

const groups = [
  { id: "1", name: "All Client", count: 1245 },
  { id: "2", name: "Paid Client", count: 890 },
  { id: "3", name: "Due Client", count: 355 },
  { id: "4", name: "Collected Client", count: 720 },
  { id: "5", name: "Unpaid Client", count: 525 },
  { id: "6", name: "Active Client", count: 1100 },
  { id: "7", name: "Inactive Client", count: 145 },
  { id: "8", name: "Reseller", count: 28 },
  { id: "9", name: "Expired Client", count: 67 },
  { id: "10", name: "Free Client", count: 15 },
];

const demoUsers = [
  { id: "1", name: "Rahim Uddin", mobile: "01711234567", group: ["1", "2", "4", "6"] },
  { id: "2", name: "Karim Hossain", mobile: "01819876543", group: ["1", "3", "5", "6"] },
  { id: "3", name: "Fatema Begum", mobile: "01612345678", group: ["1", "2", "4", "6"] },
  { id: "4", name: "Jamal Ahmed", mobile: "01512349876", group: ["1", "3", "5", "7"] },
  { id: "5", name: "Nusrat Jahan", mobile: "01912341234", group: ["1", "2", "6"] },
  { id: "6", name: "Shahidul Islam", mobile: "01312345432", group: ["1", "3", "5", "6"] },
  { id: "7", name: "Ayesha Siddiqua", mobile: "01412348765", group: ["1", "2", "4", "6"] },
  { id: "8", name: "Monirul Haque", mobile: "01712340987", group: ["1", "7", "9"] },
  { id: "9", name: "Sumaiya Akter", mobile: "01812347654", group: ["1", "2", "6"] },
  { id: "10", name: "Rezaul Karim", mobile: "01612340123", group: ["1", "8"] },
  { id: "11", name: "Taslima Nasrin", mobile: "01512346789", group: ["1", "2", "4", "6"] },
  { id: "12", name: "Habibur Rahman", mobile: "01912340456", group: ["1", "3", "5", "6"] },
  { id: "13", name: "Nasima Khatun", mobile: "01312340789", group: ["1", "10"] },
  { id: "14", name: "Mizanur Rahman", mobile: "01412341122", group: ["1", "2", "6"] },
  { id: "15", name: "Rokeya Sultana", mobile: "01712343344", group: ["1", "3", "5", "7"] },
];

const SendSmsPage = () => {
  // Individual SMS state
  const [sendTo, setSendTo] = useState("");
  const [indTemplate, setIndTemplate] = useState("");
  const [smsBody, setSmsBody] = useState("");

  // Group SMS state
  const [grpTemplate, setGrpTemplate] = useState("");
  const [grpMessage, setGrpMessage] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [transferredUsers, setTransferredUsers] = useState<string[]>([]);

  const smsLength = smsBody.length;
  const smsCost = smsLength > 0 ? (Math.ceil(smsLength / 160) * 0.25).toFixed(2) : "0.00";

  const filteredUsers = useMemo(() => {
    if (selectedGroups.length === 0) return demoUsers;
    return demoUsers.filter(u => u.group.some(g => selectedGroups.includes(g)));
  }, [selectedGroups]);

  const handleIndTemplateChange = (val: string) => {
    setIndTemplate(val);
    const t = templates.find(t => t.id === val);
    if (t) setSmsBody(t.body);
  };

  const handleGrpTemplateChange = (val: string) => {
    setGrpTemplate(val);
    const t = templates.find(t => t.id === val);
    if (t) setGrpMessage(t.body);
  };

  const toggleGroup = (id: string) => {
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleTransfer = () => {
    setTransferredUsers(selectedUsers);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>SMS Service</span>
          <span>/</span>
          <span className="text-foreground font-medium">Send SMS</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Send SMS</h1>
            <p className="text-sm text-muted-foreground">Send individual or group SMS messages to clients</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="bg-muted/60 p-1 h-auto">
          <TabsTrigger value="individual" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-5 py-2.5">
            <User className="h-4 w-4" />
            Individual SMS
          </TabsTrigger>
          <TabsTrigger value="group" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-5 py-2.5">
            <Users className="h-4 w-4" />
            Group SMS
          </TabsTrigger>
        </TabsList>

        {/* Individual SMS */}
        <TabsContent value="individual">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-1.5 block">Send To</Label>
                    <Input
                      placeholder="Enter numbers separated by comma (e.g. 01711234567, 01812345678)"
                      value={sendTo}
                      onChange={e => setSendTo(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separate multiple numbers with commas</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-1.5 block">Select Template</Label>
                    <Select value={indTemplate} onValueChange={handleIndTemplateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Select Template --" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-foreground mb-1.5 block">Length</Label>
                      <Input value={`${smsLength} / ${Math.ceil(smsLength / 160) || 1} SMS`} readOnly className="bg-muted/50" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground mb-1.5 block">Cost (৳)</Label>
                      <Input value={smsCost} readOnly className="bg-muted/50" />
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">SMS Description</Label>
                  <Textarea
                    placeholder="Type your SMS message here..."
                    value={smsBody}
                    onChange={e => setSmsBody(e.target.value)}
                    className="flex-1 min-h-[200px] resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button className="gap-2 px-8">
                  <Send className="h-4 w-4" />
                  Send SMS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Group SMS */}
        <TabsContent value="group">
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-5">
              {/* Template + Message */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">Select Template</Label>
                  <Select value={grpTemplate} onValueChange={handleGrpTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select Template --" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-2">
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">Message</Label>
                  <Textarea
                    placeholder="Type your group SMS message..."
                    value={grpMessage}
                    onChange={e => setGrpMessage(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>

              {/* Groups + Users side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Groups Table */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Client Groups</h3>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-800 hover:bg-slate-800 border-b-0">
                          <TableHead className="text-white font-semibold w-10">#</TableHead>
                          <TableHead className="text-white font-semibold">Group Name</TableHead>
                          <TableHead className="text-white font-semibold text-right">Clients</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groups.map(g => (
                          <TableRow
                            key={g.id}
                            className={`cursor-pointer transition-colors ${selectedGroups.includes(g.id) ? "bg-primary/5" : ""}`}
                            onClick={() => toggleGroup(g.id)}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedGroups.includes(g.id)}
                                onCheckedChange={() => toggleGroup(g.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{g.name}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className="text-xs">{g.count}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Users Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-foreground">Users</h3>
                    <span className="text-xs text-muted-foreground">{filteredUsers.length} users found</span>
                  </div>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="max-h-[380px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-800 hover:bg-slate-800 border-b-0 sticky top-0 z-10">
                            <TableHead className="text-white w-10">
                              <Checkbox
                                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                onCheckedChange={toggleAllUsers}
                              />
                            </TableHead>
                            <TableHead className="text-white font-semibold">Name</TableHead>
                            <TableHead className="text-white font-semibold">Mobile</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map(u => (
                            <TableRow
                              key={u.id}
                              className={`cursor-pointer transition-colors ${selectedUsers.includes(u.id) ? "bg-primary/5" : ""}`}
                              onClick={() => toggleUser(u.id)}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={selectedUsers.includes(u.id)}
                                  onCheckedChange={() => toggleUser(u.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                              <TableCell className="text-muted-foreground">{u.mobile}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-border">
                <Button variant="outline" className="gap-2" onClick={handleTransfer}>
                  <ArrowRightLeft className="h-4 w-4" />
                  Transfer Selected
                </Button>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Total Client: <span className="font-semibold text-foreground">{filteredUsers.length}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Selected: <span className="font-semibold text-primary">{transferredUsers.length}</span>
                    </span>
                  </div>
                  <Button className="gap-2 px-6">
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SendSmsPage;
