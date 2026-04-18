import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { InvoiceDetail } from "@/components/billing/InvoiceDetailDialog";

interface TenantBranding {
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  address?: string;
  phone?: string;
  email?: string;
}

// Convert hex color to RGB array
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ];
  }
  return [59, 130, 246]; // Default blue
}

// Load image and convert to base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateInvoicePdf(
  invoice: InvoiceDetail,
  branding?: TenantBranding
): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors - use tenant branding or defaults
  const primaryColor: [number, number, number] = branding?.primaryColor 
    ? hexToRgb(branding.primaryColor) 
    : [59, 130, 246];
  const accentColor: [number, number, number] = branding?.accentColor
    ? hexToRgb(branding.accentColor)
    : [139, 92, 246];
  const textColor: [number, number, number] = [31, 41, 55];
  const mutedColor: [number, number, number] = [107, 114, 128];
  
  const tenantName = branding?.name || "NetPulse ISP";
  
  // Header with gradient effect (two rectangles)
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  // Add subtle accent stripe
  doc.setFillColor(...accentColor);
  doc.rect(0, 42, pageWidth, 3, "F");
  
  // Logo placement
  let logoEndX = 20;
  if (branding?.logoUrl) {
    const logoBase64 = await loadImageAsBase64(branding.logoUrl);
    if (logoBase64) {
      try {
        // Add logo with white background for visibility
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(15, 8, 30, 30, 2, 2, "F");
        doc.addImage(logoBase64, "PNG", 17, 10, 26, 26);
        logoEndX = 52;
      } catch (e) {
        console.error("Error adding logo to PDF:", e);
      }
    }
  }
  
  // Company name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(tenantName, logoEndX, 22);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Internet Service Provider", logoEndX, 30);
  
  // Invoice label
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 20, 22, { align: "right" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.id, pageWidth - 20, 32, { align: "right" });
  
  // Company contact info (left side)
  let infoY = 58;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  if (branding?.address) {
    doc.text(branding.address, 20, infoY);
    infoY += 5;
  }
  if (branding?.phone) {
    doc.text(`Tel: ${branding.phone}`, 20, infoY);
    infoY += 5;
  }
  if (branding?.email) {
    doc.text(branding.email, 20, infoY);
  }
  
  // Bill To section
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", pageWidth - 80, 55);
  
  doc.setFont("helvetica", "normal");
  doc.text(invoice.customerName, pageWidth - 80, 62);
  doc.setTextColor(...mutedColor);
  doc.text(invoice.customerPhone, pageWidth - 80, 68);
  
  let billToY = 74;
  if (invoice.customerEmail) {
    doc.text(invoice.customerEmail, pageWidth - 80, billToY);
    billToY += 6;
  }
  if (invoice.customerAddress) {
    const addressLines = doc.splitTextToSize(invoice.customerAddress, 60);
    doc.text(addressLines, pageWidth - 80, billToY);
  }
  
  // Invoice Details Box
  const detailsY = 90;
  doc.setDrawColor(...primaryColor);
  doc.setFillColor(249, 250, 251);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, detailsY, pageWidth - 40, 28, 3, 3, "FD");
  
  const col1 = 30;
  const col2 = 75;
  const col3 = 120;
  const col4 = 165;
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.setFontSize(8);
  doc.text("BILLING PERIOD", col1, detailsY + 9);
  doc.text("DUE DATE", col2, detailsY + 9);
  doc.text("PACKAGE", col3, detailsY + 9);
  doc.text("STATUS", col4, detailsY + 9);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.text(
    `${formatDate(invoice.billingPeriod.start)} - ${formatDate(invoice.billingPeriod.end)}`,
    col1,
    detailsY + 19
  );
  doc.text(formatDate(invoice.dueDate), col2, detailsY + 19);
  doc.text(invoice.packageName, col3, detailsY + 19);
  
  // Status badge with color
  const statusColors: Record<string, [number, number, number]> = {
    paid: [34, 197, 94],
    due: [156, 163, 175],
    partial: [234, 179, 8],
    overdue: [239, 68, 68],
  };
  const statusColor = statusColors[invoice.status] || mutedColor;
  
  // Status badge background
  const statusText = invoice.status.toUpperCase();
  const statusWidth = doc.getTextWidth(statusText) + 8;
  doc.setFillColor(...statusColor);
  doc.roundedRect(col4 - 2, detailsY + 13, statusWidth, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(statusText, col4 + 2, detailsY + 19);
  
  // Line Items Table
  const tableStartY = detailsY + 38;
  
  autoTable(doc, {
    startY: tableStartY,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: invoice.lineItems.map((item) => [
      item.description,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.total),
    ]),
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: textColor,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
    margin: { left: 20, right: 20 },
  });
  
  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 50;
  
  // Totals section with styled box
  const totalsBoxX = pageWidth - 95;
  let totalsY = finalY + 12;
  
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(totalsBoxX - 5, finalY + 5, 80, invoice.paidAmount > 0 ? 40 : 25, 2, 2, "FD");
  
  doc.setTextColor(...mutedColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Subtotal:", totalsBoxX, totalsY);
  doc.setTextColor(...textColor);
  doc.text(formatCurrency(invoice.amount), pageWidth - 20, totalsY, { align: "right" });
  
  if (invoice.paidAmount > 0) {
    totalsY += 10;
    doc.setTextColor(34, 197, 94);
    doc.text("Paid:", totalsBoxX, totalsY);
    doc.text(`-${formatCurrency(invoice.paidAmount)}`, pageWidth - 20, totalsY, { align: "right" });
  }
  
  totalsY += 12;
  doc.setDrawColor(...primaryColor);
  doc.line(totalsBoxX, totalsY - 5, pageWidth - 20, totalsY - 5);
  
  const remaining = invoice.amount - invoice.paidAmount;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text(remaining === 0 ? "Total:" : "Balance Due:", totalsBoxX, totalsY);
  doc.setTextColor(remaining > 0 ? 239 : 34, remaining > 0 ? 68 : 197, remaining > 0 ? 68 : 94);
  doc.text(formatCurrency(remaining), pageWidth - 20, totalsY, { align: "right" });
  
  // Payment History
  if (invoice.payments.length > 0) {
    let paymentY = totalsY + 25;
    
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Payment History", 20, paymentY);
    
    paymentY += 5;
    
    autoTable(doc, {
      startY: paymentY,
      head: [["Date", "Method", "Reference", "Amount"]],
      body: invoice.payments.map((p) => [
        formatDate(p.date),
        p.method.replace("_", " ").toUpperCase(),
        p.reference || "-",
        formatCurrency(p.amount),
      ]),
      theme: "plain",
      headStyles: {
        fillColor: [249, 250, 251],
        textColor: primaryColor,
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        textColor: textColor,
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
        3: { cellWidth: 35, halign: "right" },
      },
      margin: { left: 20, right: 20 },
    });
  }
  
  // Footer with branding
  const footerY = doc.internal.pageSize.getHeight() - 25;
  
  // Footer accent line
  doc.setFillColor(...primaryColor);
  doc.rect(0, footerY - 8, pageWidth, 2, "F");
  
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for choosing " + tenantName + "!", pageWidth / 2, footerY, { align: "center" });
  doc.setFontSize(8);
  doc.text(
    "For questions about this invoice, please contact our support team.",
    pageWidth / 2,
    footerY + 6,
    { align: "center" }
  );
  
  return doc;
}

export async function downloadInvoicePdf(
  invoice: InvoiceDetail,
  branding?: TenantBranding
): Promise<void> {
  const doc = await generateInvoicePdf(invoice, branding);
  doc.save(`Invoice-${invoice.id}.pdf`);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString()}`;
}
