// src/features/resumeBuild/ResumePreview.jsx
import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";
import TemplateBase from "./templates/TemplateBase";
import { Button } from "@/components/ui/button";

export default function ResumePreview({ data, cfg, font, margin, lineHeight, onOpenGallery }) {
  const resumeRef = useRef(null);

  // Text-based, clickable-links PDF (react-to-print v3)
  const handlePrint = useReactToPrint({
    contentRef: resumeRef, // v3 API
    documentTitle: data?.name ? `${data.name} - Resume` : "Resume",
    removeAfterPrint: true,
    pageStyle: `
      @page { size: A4; margin: 16mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .resumePage { box-shadow: none !important; }
        a[href]::after { content: "" !important; }
      }
    `,
  });

  // Legacy: image-based export fallback
  const downloadPDF_Legacy = async () => {
    const el = resumeRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const marginPt = 10;
    const contentW = pageW - marginPt * 2;
    const contentH = (canvas.height * contentW) / canvas.width;

    if (contentH <= pageH - marginPt * 2) {
      pdf.addImage(img, "PNG", marginPt, marginPt, contentW, contentH);
    } else {
      let y = 0;
      let page = 0;
      const sliceH = (canvas.width * (pageH - marginPt * 2)) / contentW;
      while (y < canvas.height) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(sliceH, canvas.height - y);
        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, y, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
        const pageImg = pageCanvas.toDataURL("image/png");
        if (page > 0) pdf.addPage();
        pdf.addImage(pageImg, "PNG", marginPt, marginPt, contentW, (pageCanvas.height * contentW) / canvas.width);
        y += sliceH;
        page++;
      }
    }
    pdf.save("resume.pdf");
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-base font-extrabold text-white">Preview</div>
        <div className="flex gap-2">
          <Button variant="secondary" className="bg-slate-800 text-slate-100 hover:bg-slate-700 cursor-pointer hover:text-orange-300" onClick={onOpenGallery}>
            Templates
          </Button>
          <Button className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black cursor-pointer" onClick={handlePrint}>
            PDF (Text & Links)
          </Button>
          <Button variant="secondary" className="bg-slate-800 text-slate-100 hover:bg-slate-700 cursor-pointer hover:text-orange-300" onClick={downloadPDF_Legacy} title="Image-based export">
            PDF (Legacy)
          </Button>
        </div>
      </div>

      <div
        ref={resumeRef}
        style={{
          "--accent": cfg.accent,
          "--resume-margin": `${margin}px`,
          "--resume-lineheight": lineHeight,
        }}
      >
        <TemplateBase data={data} cfg={cfg} font={font} />
      </div>
    </div>
  );
}
