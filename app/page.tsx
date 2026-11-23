"use client";
import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import { PDFDocument } from "pdf-lib";
import { Upload, Globe, Crown, X, Sparkles, ShieldCheck, Zap, HelpCircle } from "lucide-react";

const PRO_URL = "https://balkanoguzhan.gumroad.com/l/ibggtz";

export default function Home() {
  const [lang, setLang] = useState<"tr" | "en">("en");
  const [tab, setTab] = useState<"img" | "conv" | "pdf" | "img2pdf">("img");
  const [showPro, setShowPro] = useState(false);
  const [legal, setLegal] = useState<"privacy" | "terms" | "contact" | null>(null);
  const [origSize, setOrigSize] = useState(0);
  const [newSize, setNewSize] = useState(0);
  const [imgUrl, setImgUrl] = useState("");
  const [convSrc, setConvSrc] = useState("");
  const [fmt, setFmt] = useState<"image/webp" | "image/jpeg" | "image/png">("image/webp");
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [imgForPdf, setImgForPdf] = useState<File | null>(null);

  const handleImg = async (file: File | null | undefined) => {
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
          <div className="text-center space-y-1"><h1 className="text-2xl font-extrabold text-slate-900">{lang === "tr" ? "Ücretsiz Çevrimiçi Görsel ve PDF Araçları" : "Free Online Image & PDF Utilities"}</h1><p className="text-sm text-slate-500">{lang === "tr" ? "Dosyalarınız sunucuya yüklenmeden tarayıcınızda güvenle işlenir." : "100% browser-based processing. Your files never leave your device."}</p></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 bg-slate-200/70 p-1.5 rounded-xl">
            <button onClick={() => setTab("img")} className={`py-2 rounded-lg font-semibold text-xs cursor-pointer ${tab === "img" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"}`}>{lang === "tr" ? "Görsel Sıkıştır" : "Compress"}</button>
            <button onClick={() => setTab("conv")} className={`py-2 rounded-lg font-semibold text-xs cursor-pointer ${tab === "conv" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600"}`}>{lang === "tr" ? "Format Dönüştür" : "Convert"}</button>
            <button onClick={() => setTab("pdf")} className={`py-2 rounded-lg font-semibold text-xs cursor-pointer ${tab === "pdf" ? "bg-white text-rose-600 shadow-sm" : "text-slate-600"}`}>{lang === "tr" ? "PDF Birleştir" : "Merge PDF"}</button>
            <button onClick={() => setTab("img2pdf")} className={`py-2 rounded-lg font-semibold text-xs cursor-pointer ${tab === "img2pdf" ? "bg-white text-purple-600 shadow-sm" : "text-slate-600"}`}>{lang === "tr" ? "Görsel → PDF" : "Image → PDF"}</button>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            {tab === "img" && (<div className="space-y-4"><label className="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-xl p-10 flex flex-col items-center cursor-pointer"><Upload className="w-10 h-10 text-blue-600 mb-2" /><span className="font-semibold text-sm">{lang === "tr" ? "Görsel Seçin" : "Select Image"}</span><input type="file" accept="image/*" onChange={(e) => handleImg(e.target.files?.item(0))} className="hidden" /></label>{imgUrl && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between"><span className="font-bold text-emerald-800">%{saved} {lang === "tr" ? "Tasarruf!" : "Saved!"}</span><a href={imgUrl} download="compressed.jpg" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm">{lang === "tr" ? "İndir" : "Download"}</a></div>}</div>)}
            {tab === "conv" && (<div className="space-y-4"><label className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-xl p-10 flex flex-col items-center cursor-pointer"><Upload className="w-10 h-10 text-emerald-600 mb-2" /><span className="font-semibold text-sm">{lang === "tr" ? "Görsel Seçin" : "Select Image"}</span><input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.item(0); if (f) setConvSrc(URL.createObjectURL(f)); }} className="hidden" /></label><div className="grid grid-cols-3 gap-2">{(["image/webp", "image/jpeg", "image/png"] as const).map((f) => <button key={f} onClick={() => setFmt(f)} className={`py-2 rounded-xl border font-bold text-xs cursor-pointer ${fmt === f ? "bg-emerald-600 text-white" : "bg-slate-50"}`}>{f.replace("image/", "").toUpperCase()}</button>)}</div>{convSrc && <button onClick={downloadConv} className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl cursor-pointer">{lang === "tr" ? "Dönüştür ve İndir" : "Convert & Download"}</button>}</div>)}
            {tab === "pdf" && (<div className="space-y-4"><label className="border-2 border-dashed border-rose-300 bg-rose-50/40 rounded-xl p-10 flex flex-col items-center cursor-pointer"><Upload className="w-10 h-10 text-rose-600 mb-2" /><span className="font-semibold text-sm">{lang === "tr" ? "PDF Seçin (En az 2)" : "Select PDFs (Min 2)"}</span><input type="file" accept="application/pdf" multiple onChange={(e) => setPdfs(Array.from(e.target.files || []))} className="hidden" /></label>{pdfs.length >= 2 && <button onClick={mergePdf} className="w-full py-3 bg-rose-600 text-white font-semibold rounded-xl cursor-pointer">{lang === "tr" ? "Birleştir ve İndir" : "Merge & Download"}</button>}</div>)}
            {tab === "img2pdf" && (<div className="space-y-4"><label className="border-2 border-dashed border-purple-300 bg-purple-50/40 rounded-xl p-10 flex flex-col items-center cursor-pointer"><Upload className="w-10 h-10 text-purple-600 mb-2" /><span className="font-semibold text-sm">{lang === "tr" ? "JPG veya PNG Seçin" : "Select JPG or PNG"}</span><input type="file" accept="image/jpeg,image/png" onChange={(e) => setImgForPdf(e.target.files?.item(0) || null)} className="hidden" /></label>{imgForPdf && <button onClick={convertImgToPdf} className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl cursor-pointer">{lang === "tr" ? "PDF Olarak İndir" : "Download as PDF"}</button>}</div>)}
          </div>
          <section className="grid md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1"><ShieldCheck className="w-5 h-5 text-blue-600" /><h3 className="font-bold text-sm">100% Private & Secure</h3><p className="text-xs text-slate-500">Files are processed locally in your browser without server uploads.</p></div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1"><Zap className="w-5 h-5 text-amber-500" /><h3 className="font-bold text-sm">Instant Processing</h3><p className="text-xs text-slate-500">Compress images, convert WebP/PNG/JPG, and merge PDFs in seconds.</p></div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1"><HelpCircle className="w-5 h-5 text-emerald-600" /><h3 className="font-bold text-sm">No Sign-Up Required</h3><p className="text-xs text-slate-500">Start optimizing your documents immediately for free on any device.</p></div>
          </section>
        </main>
        <aside className="hidden lg:flex w-40 h-[600px] bg-slate-200/60 border border-dashed border-slate-300 rounded-xl items-center justify-center text-xs text-slate-400 text-center p-2 sticky top-24">AdSense<br/>160x600</aside>
      </div>
      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-center text-sm text-slate-500 space-y-3 mt-12">
        <div className="flex justify-center gap-6 font-medium">
          <button onClick={() => setLegal("privacy")} className="hover:text-blue-600 cursor-pointer">Privacy Policy</button>
          <button onClick={() => setLegal("terms")} className="hover:text-blue-600 cursor-pointer">Terms of Service</button>
          <button onClick={() => setLegal("contact")} className="hover:text-blue-600 cursor-pointer">Contact</button>
        </div>
        <p>© 2026 SnapTools (getsnaptools.site). All rights reserved.</p>
      </footer>
      {showPro && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-2xl max-w-sm w-full p-6 relative space-y-4"><button onClick={() => setShowPro(false)} className="absolute top-4 right-4 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button><h3 className="text-xl font-bold">SnapTools PRO</h3><p className="text-sm text-slate-600">Ad-free experience and unlimited batch file processing.</p><a href={PRO_URL} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl">Get PRO ($15)</a></div></div>}
      {legal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-2xl max-w-lg w-full p-6 relative space-y-4 text-sm text-slate-600"><button onClick={() => setLegal(null)} className="absolute top-4 right-4 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button><h3 className="text-lg font-bold text-slate-900">{legal === "privacy" ? "Privacy Policy" : legal === "terms" ? "Terms of Service" : "Contact Us"}</h3><p>{legal === "contact" ? "For support or business inquiries: support@getsnaptools.site" : legal === "privacy" ? "SnapTools processes all images and PDFs locally in your web browser. We do not store or upload your files to any server. We use Google AdSense cookies to serve relevant ads." : "By using getsnaptools.site, you agree to use our browser-based file utilities lawfully."}</p></div></div>}
    </div>
  );
}
