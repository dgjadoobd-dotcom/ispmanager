import React, { useState, useMemo } from "react";
import { Store, ChevronRight, ChevronDown, Minus, Search, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface StockNode {
  id: string;
  name: string;
  description?: string;
  children?: StockNode[];
  itemCount?: number;
  stockQty?: number;
  lowStock?: boolean;
}

const demoData: StockNode[] = [
  { id: "1", name: "AC Test", description: "Air Conditioner Testing Equipment", children: [], itemCount: 2, stockQty: 5 },
  { id: "2", name: "Almirah", description: "Storage Cabinet", children: [], itemCount: 3, stockQty: 8 },
  {
    id: "3", name: "BB Cables", description: "Broadband Cables", itemCount: 15, stockQty: 450, children: [
      { id: "3-1", name: "Cat5e Cable", itemCount: 5, stockQty: 200 },
      { id: "3-2", name: "Cat6 Cable", itemCount: 6, stockQty: 150 },
      { id: "3-3", name: "Fiber Optic Cable", itemCount: 4, stockQty: 100 },
    ]
  },
  { id: "4", name: "CCTV Camera", description: "Surveillance Equipment", children: [], itemCount: 8, stockQty: 12 },
  {
    id: "5", name: "Computers", description: "Desktop & Laptop", itemCount: 12, stockQty: 18, children: [
      { id: "5-1", name: "Desktop PC", itemCount: 7, stockQty: 10 },
      { id: "5-2", name: "Laptop", itemCount: 3, stockQty: 5 },
      { id: "5-3", name: "Monitor", itemCount: 2, stockQty: 3 },
    ]
  },
  { id: "6", name: "Connector", description: "Network Connectors", children: [], itemCount: 25, stockQty: 500 },
  { id: "7", name: "Crimping Tool", children: [], itemCount: 4, stockQty: 6 },
  { id: "8", name: "Desk", description: "Office Furniture", children: [], itemCount: 6, stockQty: 10 },
  { id: "9", name: "Electric Wire", children: [], itemCount: 10, stockQty: 300 },
  { id: "10", name: "Fan", description: "Ceiling & Table Fan", children: [], itemCount: 5, stockQty: 8 },
  { id: "11", name: "Ferrule", children: [], itemCount: 20, stockQty: 1000 },
  { id: "12", name: "Fiber Adapter", children: [], itemCount: 8, stockQty: 50 },
  { id: "13", name: "Fiber Closure", children: [], itemCount: 3, stockQty: 2, lowStock: true },
  { id: "14", name: "Fiber Patch Cord", children: [], itemCount: 12, stockQty: 80 },
  { id: "15", name: "Fiber Splitter", description: "PLC Splitter", children: [], itemCount: 6, stockQty: 25 },
  { id: "16", name: "Generator", description: "Power Backup", children: [], itemCount: 2, stockQty: 1, lowStock: true },
  {
    id: "17", name: "Media Converter", description: "Fiber to Ethernet", itemCount: 9, stockQty: 30, children: [
      { id: "17-1", name: "Single Mode", itemCount: 5, stockQty: 18 },
      { id: "17-2", name: "Multi Mode", itemCount: 4, stockQty: 12 },
    ]
  },
  {
    id: "18", name: "OLT", description: "Optical Line Terminal", itemCount: 7, stockQty: 5, children: [
      { id: "18-1", name: "GPON OLT", itemCount: 3, stockQty: 2, lowStock: true },
      { id: "18-2", name: "EPON OLT", itemCount: 2, stockQty: 1, lowStock: true },
      { id: "18-3", name: "OLT SFP Module", itemCount: 2, stockQty: 2 },
    ]
  },
  {
    id: "19", name: "ONU/ONT", description: "Optical Network Unit", itemCount: 18, stockQty: 120, children: [
      { id: "19-1", name: "GPON ONU", itemCount: 10, stockQty: 60 },
      { id: "19-2", name: "EPON ONU", itemCount: 5, stockQty: 40 },
      { id: "19-3", name: "WiFi ONU", itemCount: 3, stockQty: 20 },
    ]
  },
  { id: "20", name: "OTDR", description: "Optical Time Domain Reflectometer", children: [], itemCount: 1, stockQty: 1, lowStock: true },
  { id: "21", name: "Patch Panel", children: [], itemCount: 4, stockQty: 10 },
  { id: "22", name: "PoE Injector", children: [], itemCount: 6, stockQty: 15 },
  { id: "23", name: "Power Supply", description: "Adapter & UPS", children: [], itemCount: 8, stockQty: 20 },
  { id: "24", name: "Printer", children: [], itemCount: 3, stockQty: 4 },
  { id: "25", name: "Rack", description: "Network Rack", children: [], itemCount: 5, stockQty: 3, lowStock: true },
  {
    id: "26", name: "Router", description: "Network Router", itemCount: 14, stockQty: 35, children: [
      { id: "26-1", name: "MikroTik Router", itemCount: 8, stockQty: 20 },
      { id: "26-2", name: "Cisco Router", itemCount: 3, stockQty: 5 },
      { id: "26-3", name: "TP-Link Router", itemCount: 3, stockQty: 10 },
    ]
  },
  { id: "27", name: "Screw & Clip", children: [], itemCount: 30, stockQty: 2000 },
  {
    id: "28", name: "Server", description: "Network Server", itemCount: 4, stockQty: 3, children: [
      { id: "28-1", name: "Rack Server", itemCount: 2, stockQty: 1, lowStock: true },
      { id: "28-2", name: "Tower Server", itemCount: 2, stockQty: 2 },
    ]
  },
  { id: "29", name: "Splicing Machine", description: "Fiber Splicing", children: [], itemCount: 2, stockQty: 2 },
  {
    id: "30", name: "Switch", description: "Network Switch", itemCount: 11, stockQty: 22, children: [
      { id: "30-1", name: "Managed Switch", itemCount: 5, stockQty: 8 },
      { id: "30-2", name: "Unmanaged Switch", itemCount: 6, stockQty: 14 },
    ]
  },
  { id: "31", name: "Tools Box", description: "Technician Tools", children: [], itemCount: 4, stockQty: 6 },
  { id: "32", name: "UPS", description: "Uninterruptible Power Supply", children: [], itemCount: 7, stockQty: 10 },
];

function getSubCategoryCount(node: StockNode): number {
  return node.children?.length ?? 0;
}

function countLowStock(nodes: StockNode[]): number {
  return nodes.reduce((count, node) => {
    let c = node.lowStock ? 1 : 0;
    if (node.children) c += countLowStock(node.children);
    return count + c;
  }, 0);
}

function filterTree(nodes: StockNode[], query: string): StockNode[] {
  if (!query) return nodes;
  const q = query.toLowerCase();
  return nodes.reduce<StockNode[]>((acc, node) => {
    const nameMatch = node.name.toLowerCase().includes(q) || node.description?.toLowerCase().includes(q);
    const filteredChildren = node.children ? filterTree(node.children, query) : [];
    if (nameMatch || filteredChildren.length > 0) {
      acc.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children });
    }
    return acc;
  }, []);
}

const StockTreeRow: React.FC<{ node: StockNode; depth: number }> = ({ node, depth }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const subCount = getSubCategoryCount(node);

  return (
    <>
      <div
        className={`flex items-center gap-2 py-2.5 px-3 border-b border-border/50 hover:bg-muted/40 transition-colors cursor-pointer select-none ${depth > 0 ? 'bg-muted/20' : ''} ${node.lowStock ? 'bg-destructive/5' : ''}`}
        style={{ paddingLeft: `${12 + depth * 24}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground/50 shrink-0" />
        )}

        <span className="font-medium text-foreground text-sm">{node.name}</span>
        {node.description && (
          <span className="text-muted-foreground text-xs">({node.description})</span>
        )}

        {node.lowStock && (
          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
        )}

        <div className="ml-auto flex items-center gap-3">
          {subCount > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">
              {subCount} Sub-Categories
            </Badge>
          )}
          <Badge variant="outline" className="text-xs font-normal">
            {node.itemCount ?? 0} Items
          </Badge>
          {node.stockQty !== undefined && (
            <Badge variant={node.lowStock ? "destructive" : "default"} className="text-xs font-normal min-w-[60px] justify-center">
              Stock: {node.stockQty}
            </Badge>
          )}
        </div>
      </div>
      {expanded && hasChildren && node.children!.map((child) => (
        <StockTreeRow key={child.id} node={child} depth={depth + 1} />
      ))}
    </>
  );
};

const StockPage: React.FC = () => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => filterTree(demoData, search), [search]);

  const totalCategories = demoData.length;
  const totalItems = demoData.reduce((s, n) => s + (n.itemCount ?? 0), 0);
  const lowStockCount = countLowStock(demoData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Inventory</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Stock</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Stock</h1>
              <p className="text-sm text-muted-foreground">Stock Monitor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant="secondary" className="text-sm px-3 py-1">{totalCategories} Categories</Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">{totalItems} Total Items</Badge>
        {lowStockCount > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1 gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            {lowStockCount} Low Stock
          </Badge>
        )}
      </div>

      {/* Tree Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">Items</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stock items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table header */}
          <div className="flex items-center gap-2 py-2.5 px-3 bg-primary text-primary-foreground text-sm font-semibold">
            <span className="ml-6">Name</span>
            <span className="ml-auto mr-3">Details</span>
          </div>
          {/* Tree rows */}
          <div className="max-h-[600px] overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((node) => <StockTreeRow key={node.id} node={node} depth={0} />)
            ) : (
              <div className="p-8 text-center text-muted-foreground">No stock items found.</div>
            )}
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
            <span>Showing {filtered.length} of {demoData.length} categories</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockPage;
