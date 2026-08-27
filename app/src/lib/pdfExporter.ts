import { jsPDF } from "jspdf";

export interface PdfExportOptions {
  fileName?: string;
  headerTitle?: string;
  patientName?: string;
  reportDate?: string;
  watermarkText?: string;
}

/**
 * High-definition Pure Client-Side A4 Multi-Page PDF Exporter
 * Zero server CPU/Memory footprint, 100% client-side privacy preserving.
 */
export async function exportElementToA4Pdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<boolean> {
  try {
    const {
      fileName = "OncoPath_门诊就医便签.pdf",
      headerTitle = "OncoPath 肺结节与肺腺癌临床数字档案 · 门诊会诊便签",
      reportDate = new Date().toISOString().split("T")[0],
    } = options;

    // 1. Dynamic import of html2canvas to optimize code splitting
    const html2canvas = (await import("html2canvas")).default;

    // 2. Render DOM to High-DPI Canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x Retina resolution for sharp text printing
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth || 800,
    });

    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;

    // 3. A4 Dimensions in millimeters (Portrait)
    const a4WidthMm = 210;
    const a4HeightMm = 297;
    
    const marginXMm = 10;
    const marginTopMm = 14;
    const marginBottomMm = 16;

    const printableWidthMm = a4WidthMm - marginXMm * 2; // 190mm
    const printableHeightMm = a4HeightMm - marginTopMm - marginBottomMm; // 267mm

    // Calculate scaling ratio from canvas pixels to PDF printable width mm
    const pxPerMm = imgWidthPx / printableWidthMm;
    const pageHeightPx = Math.floor(printableHeightMm * pxPerMm);
    const totalPages = Math.ceil(imgHeightPx / pageHeightPx);

    // 4. Initialize jsPDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // 5. Slice Canvas & Render Multi-page A4
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage("a4", "portrait");
      }

      // Calculate slice bounding box in source canvas pixels
      const srcY = page * pageHeightPx;
      const srcHeight = Math.min(pageHeightPx, imgHeightPx - srcY);

      // Create a sub-canvas for current page
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = imgWidthPx;
      pageCanvas.height = srcHeight;

      const ctx = pageCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          srcY,
          imgWidthPx,
          srcHeight,
          0,
          0,
          imgWidthPx,
          srcHeight
        );
      }

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95);
      const renderedHeightMm = srcHeight / pxPerMm;

      // Draw Top Header
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.text(headerTitle, marginXMm, 9);
      pdf.text(`归档日期: ${reportDate}`, a4WidthMm - marginXMm, 9, { align: "right" });

      pdf.setDrawColor(226, 232, 240); // slate-200
      pdf.setLineWidth(0.3);
      pdf.line(marginXMm, 11, a4WidthMm - marginXMm, 11);

      // Draw Main Content Slice
      pdf.addImage(
        pageImgData,
        "JPEG",
        marginXMm,
        marginTopMm,
        printableWidthMm,
        renderedHeightMm
      );

      // Draw Bottom Footer & Page Number
      pdf.line(marginXMm, a4HeightMm - 10, a4WidthMm - marginXMm, a4HeightMm - 10);
      
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.text(
        "本便签由 OncoPath 循证引擎生成 · 仅供就医参考，请以临床医师综合诊断为准",
        marginXMm,
        a4HeightMm - 6
      );
      pdf.text(
        `第 ${page + 1} / ${totalPages} 页`,
        a4WidthMm - marginXMm,
        a4HeightMm - 6,
        { align: "right" }
      );
    }

    // 6. Direct Client-side Trigger Download
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error("Failed to export client-side A4 PDF:", error);
    return false;
  }
}
