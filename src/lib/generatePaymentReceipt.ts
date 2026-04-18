import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TenantBranding {
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  phone?: string;
  address?: string;
  email?: string;
}

interface ReceiptData {
  receiptNumber: string;
  paymentDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  invoiceNumber?: string;
  billingPeriod?: string;
  branding?: TenantBranding;
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

export async function generatePaymentReceipt(data: ReceiptData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const branding = data.branding;
  const tenantName = branding?.name || "ISP Provider";
  
  // Colors
  const primaryColor: [number, number, number] = branding?.primaryColor 
    ? hexToRgb(branding.primaryColor) 
    : [59, 130, 246];
  const accentColor: [number, number, number] = branding?.accentColor
    ? hexToRgb(branding.accentColor)
    : [139, 92, 246];
  const successColor: [number, number, number] = [34, 197, 94];
  const textColor: [number, number, number] = [31, 41, 55];
  const mutedColor: [number, number, number] = [107, 114, 128];
  
  // Header with brand color
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, "F");
  
  // Accent stripe
  doc.setFillColor(...accentColor);
  doc.rect(0, 47, pageWidth, 3, "F");
  
  // Logo
  let logoEndX = 20;
  if (branding?.logoUrl) {
    const logoBase64 = await loadImageAsBase64(branding.logoUrl);
    if (logoBase64) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(15, 10, 32, 32, 2, 2, "F");
        doc.addImage(logoBase64, "PNG", 17, 12, 28, 28);
        logoEndX = 55;
      } catch (e) {
        console.error("Error adding logo to PDF:", e);
      }
    }
  }
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(tenantName, logoEndX, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Internet Service Provider", logoEndX, 33);
  
  // Contact info in header
  if (branding?.phone || branding?.address) {
    doc.setFontSize(9);
    let contactY = 42;
    if (branding?.phone) {
      doc.text(`Tel: ${branding.phone}`, logoEndX, contactY);
    }
  }
  
  // PAYMENT RECEIPT badge
  doc.setFillColor(...successColor);
  doc.roundedRect(pageWidth - 75, 15, 60, 22, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT", pageWidth - 45, 24, { align: "center" });
  doc.text("RECEIPT", pageWidth - 45, 32, { align: "center" });
  
  // Receipt details section
  const detailsY = 62;
  doc.setDrawColor(...primaryColor);
  doc.setFillColor(249, 250, 251);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, detailsY, pageWidth - 30, 28, 2, 2, "FD");
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("RECEIPT NO", 25, detailsY + 10);
  doc.text("DATE", 85, detailsY + 10);
  doc.text("PAYMENT METHOD", 130, detailsY + 10);
  
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.receiptNumber, 25, detailsY + 20);
  doc.text(data.paymentDate, 85, detailsY + 20);
  doc.text(formatMethod(data.method), 130, detailsY + 20);
  
  if (data.reference) {
    doc.setTextColor(...mutedColor);
    doc.setFontSize(8);
    doc.text(`Ref: ${data.reference}`, pageWidth - 20, detailsY + 20, { align: "right" });
  }
  
  // Customer Details
  const customerY = detailsY + 40;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Details", 15, customerY);
  
  doc.setDrawColor(229, 231, 235);
  doc.line(15, customerY + 3, pageWidth - 15, customerY + 3);
  
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name: ${data.customerName}`, 15, customerY + 12);
  doc.text(`Phone: ${data.customerPhone}`, 15, customerY + 20);
  if (data.customerAddress) {
    doc.text(`Address: ${data.customerAddress}`, 15, customerY + 28);
  }
  
  // Payment Details Table
  const tableStartY = data.customerAddress ? customerY + 40 : customerY + 32;
  
  const tableData = [];
  
  if (data.invoiceNumber) {
    tableData.push(["Invoice Number", data.invoiceNumber]);
  }
  if (data.billingPeriod) {
    tableData.push(["Billing Period", data.billingPeriod]);
  }
  tableData.push(["Payment Amount", `৳${data.amount.toLocaleString()}`]);
  tableData.push(["Payment Method", formatMethod(data.method)]);
  if (data.reference) {
    tableData.push(["Transaction Reference", data.reference]);
  }
  
  autoTable(doc, {
    startY: tableStartY,
    head: [["Description", "Details"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 10,
      textColor: textColor,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: "auto" },
    },
    margin: { left: 15, right: 15 },
  });
  
  // Amount Summary Box
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Large amount display with gradient effect
  doc.setFillColor(...successColor);
  doc.roundedRect(pageWidth - 110, finalY, 95, 40, 4, 4, "F");
  
  // Inner lighter area for depth
  doc.setFillColor(39, 207, 104);
  doc.roundedRect(pageWidth - 108, finalY + 2, 91, 36, 3, 3, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("AMOUNT PAID", pageWidth - 62.5, finalY + 14, { align: "center" });
  
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(`৳${data.amount.toLocaleString()}`, pageWidth - 62.5, finalY + 30, { align: "center" });
  
  // Notes section
  doc.setTextColor(...textColor);
  if (data.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 15, finalY + 8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mutedColor);
    doc.text(data.notes, 15, finalY + 16, { maxWidth: 85 });
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 35;
  
  // Footer accent line
  doc.setFillColor(...primaryColor);
  doc.rect(0, footerY - 10, pageWidth, 2, "F");
  
  // Signature line
  doc.setDrawColor(...mutedColor);
  doc.setLineWidth(0.3);
  doc.line(pageWidth - 85, footerY, pageWidth - 20, footerY);
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.text("Authorized Signature", pageWidth - 52.5, footerY + 6, { align: "center" });
  
  // Footer text
  doc.setFontSize(9);
  doc.text("This is a computer-generated receipt.", 15, footerY);
  doc.text(`Thank you for choosing ${tenantName}!`, 15, footerY + 6);
  
  // Download
  doc.save(`Receipt-${data.receiptNumber}.pdf`);
}

function formatMethod(method: string): string {
  const methods: Record<string, string> = {
    cash: "Cash",
    bkash: "bKash",
    nagad: "Nagad",
    rocket: "Rocket",
    online: "Online Payment",
    bank_transfer: "Bank Transfer",
  };
  return methods[method] || method;
}
