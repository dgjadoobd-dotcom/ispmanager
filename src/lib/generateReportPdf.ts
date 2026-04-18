import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

interface ReportData {
  customers: any[];
  payments: any[];
  bills: any[];
  packages: any[];
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
  }
  return [59, 130, 246];
}

export function generateReportPdf(data: ReportData, tenantName?: string) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor: [number, number, number] = [59, 130, 246];
  let y = 15;

  // ── Header ──
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(tenantName || "NetPulse ISP", 14, 14);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Business Report - Last 6 Months", 14, 21);
  doc.text(`Generated: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`, 14, 27);
  y = 40;

  // ── Summary Stats ──
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, y);
  y += 8;

  const totalCustomers = data.customers.length;
  const activeCustomers = data.customers.filter((c) => c.connection_status === "active").length;
  const suspendedCustomers = data.customers.filter((c) => c.connection_status === "suspended").length;
  const totalDue = data.customers.reduce((s, c) => s + Number(c.due_balance || 0), 0);
  const totalAdvance = data.customers.reduce((s, c) => s + Number(c.advance_balance || 0), 0);
  const totalCollected = data.payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalBilled = data.bills.reduce((s, b) => s + Number(b.amount), 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  const summaryData = [
    ["Total Customers", String(totalCustomers)],
    ["Active", String(activeCustomers)],
    ["Suspended", String(suspendedCustomers)],
    ["Total Billed (6 months)", `BDT ${totalBilled.toLocaleString()}`],
    ["Total Collected (6 months)", `BDT ${totalCollected.toLocaleString()}`],
    ["Collection Rate", `${collectionRate}%`],
    ["Total Due Balance", `BDT ${totalDue.toLocaleString()}`],
    ["Total Advance Balance", `BDT ${totalAdvance.toLocaleString()}`],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: primaryColor, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Monthly Revenue ──
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Monthly Revenue & Collection", 14, y);
  y += 8;

  const monthlyData: string[][] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const label = format(date, "MMM yyyy");

    const billed = data.bills
      .filter((b) => isWithinInterval(parseISO(b.created_at), { start, end }))
      .reduce((s, b) => s + Number(b.amount), 0);

    const collected = data.payments
      .filter((p) => isWithinInterval(parseISO(p.created_at), { start, end }))
      .reduce((s, p) => s + Number(p.amount), 0);

    const rate = billed > 0 ? Math.round((collected / billed) * 100) : 0;
    monthlyData.push([label, `BDT ${billed.toLocaleString()}`, `BDT ${collected.toLocaleString()}`, `${rate}%`]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Month", "Billed", "Collected", "Rate"]],
    body: monthlyData,
    theme: "striped",
    headStyles: { fillColor: primaryColor, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Collection by Method ──
  if (y > 240) { doc.addPage(); y = 15; }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Collection by Payment Method", 14, y);
  y += 8;

  const methodMap: Record<string, number> = {};
  data.payments.forEach((p) => {
    const method = p.method || "cash";
    methodMap[method] = (methodMap[method] || 0) + Number(p.amount);
  });

  const methodLabels: Record<string, string> = { cash: "Cash", online: "Online", bank_transfer: "Bank Transfer" };
  const methodData = Object.entries(methodMap).map(([m, amt]) => [
    methodLabels[m] || m,
    `BDT ${amt.toLocaleString()}`,
    `${totalCollected > 0 ? Math.round((amt / totalCollected) * 100) : 0}%`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Method", "Amount", "Share"]],
    body: methodData,
    theme: "striped",
    headStyles: { fillColor: primaryColor, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Package Distribution ──
  if (y > 220) { doc.addPage(); y = 15; }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Package Distribution", 14, y);
  y += 8;

  const pkgMap: Record<string, number> = {};
  data.customers.forEach((c) => {
    const pkgId = c.package_id || "unassigned";
    pkgMap[pkgId] = (pkgMap[pkgId] || 0) + 1;
  });

  const pkgData = Object.entries(pkgMap)
    .map(([pkgId, count]) => {
      const pkg = data.packages.find((p) => p.id === pkgId);
      return [
        pkg ? pkg.name : "Unassigned",
        pkg ? pkg.speed_label : "-",
        pkg ? `BDT ${Number(pkg.monthly_price).toLocaleString()}` : "-",
        String(count),
        `${totalCustomers > 0 ? Math.round((count / totalCustomers) * 100) : 0}%`,
      ];
    })
    .sort((a, b) => parseInt(b[3]) - parseInt(a[3]));

  autoTable(doc, {
    startY: y,
    head: [["Package", "Speed", "Price", "Customers", "Share"]],
    body: pkgData,
    theme: "striped",
    headStyles: { fillColor: primaryColor, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Top Due Customers ──
  const topDue = [...data.customers]
    .filter((c) => Number(c.due_balance || 0) > 0)
    .sort((a, b) => Number(b.due_balance) - Number(a.due_balance))
    .slice(0, 15);

  if (topDue.length > 0) {
    if (y > 200) { doc.addPage(); y = 15; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Top Due Customers", 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Name", "Phone", "Status", "Due Balance"]],
      body: topDue.map((c) => [
        c.name,
        c.phone || "-",
        c.connection_status,
        `BDT ${Number(c.due_balance).toLocaleString()}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [220, 38, 38], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
  }

  // ── Footer on each page ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${totalPages} | Generated by NetPulse ISP Management`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  doc.save(`ISP-Report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
