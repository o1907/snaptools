"use client";
import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import { PDFDocument } from "pdf-lib";
import { Upload, Download, CheckCircle2, Globe, Crown, X, Sparkles } from "lucide-react";

export default function Home() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [tab, setTab] = useState<"img" | "conv" | "pdf" | "img2pdf">("img");
  const [showPro, setShowPro] = useState(false);
  const [origSize, setOrigSize] = useState(0);
  const [newSize, setNewSize] = useState(0);
  const [imgUrl, setImgUrl] = useState("");
  const [convSrc, setConvSrc] = useState("");
  const [fmt, setFmt] = useState<"image/webp" | "image/jpeg" | "image/png">("image/webp");
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [imgForPdf, setImgForPdf] = useState<File | null>(null);
   const handleImg = async (file?: File) => {
    if (!file) return;
    setOrigSize(file.size);
    const res = await imageCompression(file, { maxSizeMB: 2, initialQuality: 0.75 });
    setNewSize(res.size);
    setImgUrl(URL.createObjectURL(res));
  };

  const downloadConv = () => {
    if (!convSrc) return;
    const img = new Image();
    img.src = convSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `snaptools.${fmt.replace("image/", "")}`;
      a.href = canvas.toDataURL(fmt, 0.92);
      a.click();
    };
  };

  const mergePdf = async () => {
    if (pdfs.length < 2) return;
    const merged = await PDFDocument.create();
    for (const f of pdfs) {
      const doc = await PDFDocument.load(await f.arrayBuffer());
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }
    const blob = new Blob([new Uint8Array(await merged.save())], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "merged.pdf";
    a.click();
  };

  const convertImgToPdf = async () => {
    if (!imgForPdf) return;
    const pdfDoc = await PDFDocument.create();
    const bytes = await imgForPdf.arrayBuffer();
    const embedded = imgForPdf.type === "image/png" ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
    const page = pdfDoc.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
    const blob = new Blob([new Uint8Array(await pdfDoc.save())], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image-to-pdf.pdf";
    a.click();
  };
  const saved = origSize > 0 ? Math.max(0, Math.round(((origSize - newSize) / origSize) * 100)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-extrabold text-xl text-blue-600"><Sparkles className="w-6 h-6" /><span>SnapTools</span></div>
          <div className="flex gap-2">
            <button onClick={() => setLang(lang === "tr" ? "en" : "tr")} className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm font-medium cursor-pointer"><Globe className="w-4 h-4 text-blue-600" /><span>{lang === "tr" ? "EN" : "TR"}</span></button>
            <button onClick={() => setShowPro(true)} className="flex items-center gap-1 px-3.5 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-bold cursor-pointer"><Crown className="w-4 h-4" /><span>PRO</span></button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex gap-6 justify-center">
        <aside className="hidden lg:flex w-40 h-[600px] bg-slate-200/60 border border-dashed border-slate-300 rounded-xl items-center justify-center text-xs text-slate-400 text-center p-2 sticky top-24">AdSense<br/>160x600</aside>

        <main className="flex-1 max-w-2xl space-y-6">
          <div className="h-20 bg-slate-200/60 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400">AdSense Üst Banner (728x90)</div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 bg-slate-200/70 p-1.5 rounded-xl">
            <button onClick={() => setTab("img")} className={`py-2 rounded-lg font-semibold text-xs cursor-pointer ${tab === "img" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"}`}>{lang === "tr" ? "Görsel Sıkıştır" : "Compress"}</button>
            <button onClick={() => setTab("conv")} className={`py-2 rounded-lg font-semibold text-xs cursor-pointer ${tab === "conv" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600"}`}>{lang === "tr" ? "Format Dönüştür" : "Convert"}</button>
            <button onClick={() => setTab("pdf")} className={`py-2 rounded-lg font-semibold text-xs cursor-pointer ${tab === "pdf" ? "bg-white text-rose-600 shadow-sm" : "text-slate-600"}`}>{lang === "tr" ? "PDF Birleştir" : "Merge PDF"}</button>
            <button onClick={() => setTab("img2pdf")} className={`py-2 rounded-lg font-semibold text-xs cursor-pointer ${tab === "img2pdf" ? "bg-white text-purple-600 shadow-sm" : "text-slate-600"}`}>{lang === "tr" ? "Görsel → PDF" : "Image → PDF"}</button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            {tab === "img" && (
              <div className="space-y-4">
                <label className="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-xl p-10 flex flex-col items-center cursor-pointer">
                  <Upload className="w-10 h-10 text-blue-600 mb-2" /><span className="font-semibold text-sm">{lang === "tr" ? "Görsel Seçin" : "Select Image"}</span>
                  <input type="file" accept="image/*" onChange={(e) => handleImg(Array.from(e.target.files || []).shift())} className="hidden" />
                </label>
                {imgUrl && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between"><span className="font-bold text-emerald-800">%{saved} {lang === "tr" ? "Tasarruf!" : "Saved!"}</span><a href={imgUrl} download="compressed.jpg" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm">{lang === "tr" ? "İndir" : "Download"}</a></div>}
              </div>
            )}
             {tab === "conv" && (
              <div className="space-y-4">
                <label className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-xl p-10 flex flex-col items-center cursor-pointer">
                  <Upload className="w-10 h-10 text-emerald-600 mb-2" /><span className="font-semibold text-sm">{lang === "tr" ? "Görsel Seçin" : "Select Image"}</span>
                  <input type="file" accept="image/*" onChange={(e) => { const f = Array.from(e.target.files || []).shift(); if (f) setConvSrc(URL.createObjectURL(f)); }} className="hidden" />
                </label>
                <div className="grid grid-cols-3 gap-2">{(["image/webp", "image/jpeg", "image/png"] as const).map((f) => <button key={f} onClick={() => setFmt(f)} className={`py-2 rounded-xl border font-bold text-xs cursor-pointer ${fmt === f ? "bg-emerald-600 text-white" : "bg-slate-50"}`}>{f.replace("image/", "").toUpperCase()}</button>)}</div>
                {convSrc && <button onClick={downloadConv} className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl cursor-pointer">{lang === "tr" ? "Dönüştür ve İndir" : "Convert & Download"}</button>}
              </div>
            )}

            {tab === "pdf" && (
              <div className="space-y-4">
                <label className="border-2 border-dashed border-rose-300 bg-rose-50/40 rounded-xl p-10 flex flex-col items-center cursor-pointer">
                  <Upload className="w-10 h-10 text-rose-600 mb-2" /><span className="font-semibold text-sm">{lang === "tr" ? "PDF Seçin (En az 2)" : "Select PDFs (Min 2)"}</span>
                  <input type="file" accept="application/pdf" multiple onChange={(e) => setPdfs(Array.from(e.target.files || []))} className="hidden" />
                </label>
                {pdfs.length >= 2 && <button onClick={mergePdf} className="w-full py-3 bg-rose-600 text-white font-semibold rounded-xl cursor-pointer">{lang === "tr" ? "Birleştir ve İndir" : "Merge & Download"}</button>}
              </div>
            )}

            {tab === "img2pdf" && (
              <div className="space-y-4">
                <label className="border-2 border-dashed border-purple-300 bg-purple-50/40 rounded-xl p-10 flex flex-col items-center cursor-pointer">
                  <Upload className="w-10 h-10 text-purple-600 mb-2" /><span className="font-semibold text-sm">{lang === "tr" ? "JPG veya PNG Seçin" : "Select JPG or PNG"}</span>
                  <input type="file" accept="image/jpeg,image/png" onChange={(e) => setImgForPdf(Array.from(e.target.files || []).shift() || null)} className="hidden" />
                </label>
                {imgForPdf && <button onClick={convertImgToPdf} className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl cursor-pointer">{lang === "tr" ? "PDF Olarak İndir" : "Download as PDF"}</button>}
              </div>
            )}
          </div>

          <div className="h-24 bg-slate-200/60 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400">AdSense Alt Banner (728x90)</div>
        </main>

        <aside className="hidden lg:flex w-40 h-[600px] bg-slate-200/60 border border-dashed border-slate-300 rounded-xl items-center justify-center text-xs text-slate-400 text-center p-2 sticky top-24">AdSense<br/>160x600</aside>
      </div>

      {showPro && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative space-y-4">
            <button onClick={() => setShowPro(false)} className="absolute top-4 right-4 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold">SnapTools PRO</h3>
            <p className="text-sm text-slate-600">{lang === "tr" ? "Reklamsız kullanım ve sınırsız dosya boyutu." : "Ad-free experience and unlimited file size."}</p>
            <button onClick={() => setShowPro(false)} className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl cursor-pointer">$7 / {lang === "tr" ? "Ay" : "Month"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
