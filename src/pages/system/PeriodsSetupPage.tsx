import React, { useState } from "react";
import { CalendarDays, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const initialYears = Array.from({ length: 11 }, (_, i) => ({
  year: 2027 - i,
  enabled: 2027 - i >= 2023,
}));

const PeriodsSetupPage = () => {
  const [periods, setPeriods] = useState(initialYears);

  const toggleYear = (year: number) => {
    setPeriods((prev) =>
      prev.map((p) => (p.year === year ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1 text-muted-foreground">
                <Home className="h-3.5 w-3.5" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>System</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Periods Setup</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3 mt-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Periods Setup
            </h1>
            <p className="text-sm text-muted-foreground">
              Bill Periods Enabling/Disabling
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary border-none">
                  <TableHead className="text-primary-foreground font-semibold text-sm w-24 text-center">
                    #
                  </TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-sm">
                    Year
                  </TableHead>
                  <TableHead className="text-primary-foreground font-semibold text-sm text-center">
                    Show On List
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period, index) => (
                  <TableRow
                    key={period.year}
                    className="border-border/40 hover:bg-muted/40"
                  >
                    <TableCell className="text-center font-medium text-muted-foreground text-sm">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-foreground text-sm">
                      {period.year}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={period.enabled}
                          onCheckedChange={() => toggleYear(period.year)}
                        />
                      </div>
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
};

export default PeriodsSetupPage;
