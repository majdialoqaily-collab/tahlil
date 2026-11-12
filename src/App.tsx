import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Search, Download, Save, FolderOpen, Trash2, Pencil, GraduationCap, Users, Award, Calculator, ClipboardPaste, FileText, School, CheckCircle2, XCircle, ArrowDownWideNarrow, MapPin, RotateCcw, ListPlus, Smartphone, X } from "lucide-react";
import logoUrl from "./logo.png";

type Student = { uid: string; name: string; studentId: string; mark: number };
type Settings = { school: string; year: string; semester: string; grade: string; section: string; subject: string; track: string; governorate: string; directorate: string; teacher: string; principal: string; maxMark: number; passMark: number };
type AnalysisValue = { name: string; settings: Settings; students: Student[]; savedAt: string };
type SavedAnalysis = { id: string; value: AnalysisValue; created_at: string; updated_at: string };

const GRADES = ["الأول","الثاني","الثالث","الرابع","الخامس","السادس","السابع","الثامن","التاسع","العاشر","الحادي عشر","الثاني عشر"];
const SECTIONS = ["أ","ب","ج","د"];
const TRACKS = ["عام","علمي - علوم وتكنولوجيا وهندسة","صحي","أعمال","إنساني واجتماعي - أدبي","شريعة","قانون","لغات"];

const SUBJECTS: Record<string,string[]> = {
  "الأول": ["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم","التربية الإسلامية","التربية الاجتماعية والوطنية","التربية الفنية","التربية الرياضية","التربية المهنية"],
  "الثاني": ["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم","التربية الإسلامية","التربية الاجتماعية والوطنية","التربية الفنية","التربية الرياضية","التربية المهنية"],
  "الثالث": ["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم","التربية الإسلامية","التربية الاجتماعية والوطنية","التربية الفنية","التربية الرياضية","التربية المهنية"],
  "الرابع": ["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم","التربية الإسلامية","الدراسات الاجتماعية","التربية الفنية","التربية الرياضية","التربية المهنية","المهارات الرقمية","الثقافة المالية"],
  "الخامس": ["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم","التربية الإسلامية","الدراسات الاجتماعية","التربية الفنية","التربية الرياضية","التربية المهنية","المهارات الرقمية","الثقافة المالية"],
  "السادس": ["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم","التربية الإسلامية","الدراسات الاجتماعية","التربية الفنية","التربية الرياضية","التربية المهنية","المهارات الرقمية","الثقافة المالية"],
  "السابع": ["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم (كيمياء، فيزياء، أحياء، علوم أرض)","التربية الإسلامية","الدراسات الاجتماعية","المهارات الرقمية","الثقافة المالية","التربية المهنية","التربية الفنية","التربية الرياضية"],
  "الثامن": ["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم (كيمياء، فيزياء، أحياء، علوم أرض)","التربية الإسلامية","الدراسات الاجتماعية","المهارات الرقمية","الثقافة المالية","التربية المهنية","التربية الفنية","التربية الرياضية"],
  "التاسع": ["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم (كيمياء، فيزياء، أحياء، علوم أرض)","التربية الإسلامية","الدراسات الاجتماعية","المهارات الرقمية","الثقافة المالية","التربية المهنية","التربية الفنية","التربية الرياضية"],
  "العاشر": ["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم (كيمياء، فيزياء، أحياء، علوم أرض)","التربية الإسلامية","الدراسات الاجتماعية","المهارات الرقمية","الثقافة المالية","التربية المهنية","التربية الفنية","التربية الرياضية"],
  "الحادي عشر": ["اللغة العربية","اللغة الإنجليزية","الرياضيات","التربية الإسلامية","تاريخ الأردن","العلوم","الثقافة المالية","المهارات الرقمية"],
  "الثاني عشر": ["اللغة العربية","اللغة الإنجليزية","التربية الإسلامية","تاريخ الأردن","الرياضيات","الفيزياء","الكيمياء","العلوم الحياتية","علوم الأرض والبيئة","التاريخ","الجغرافيا","رياضيات الأعمال","اللغة الإنجليزية المتقدمة","الفلسفة","الأدب العربي","علم النفس والاجتماع"],
};
const GOVERNORATES: Record<string,string[]> = {
  "العاصمة عمان": ["لواء الجامعة","لواء وادي السير","لواء ماركا","لواء القويسمة","لواء سحاب","لواء الجيزة","لواء الموقر","لواء ناعور","لواء عين الباشا"],
  "إربد": ["إربد الأولى","إربد الثانية","الرمثا","بني كنانة","الكورة","الأغوار الشمالية","المزار الشمالي","الطيبة والوسطية"],
  "الزرقاء": ["الزرقاء الأولى","الزرقاء الثانية","الرصيفة"],
  "البلقاء": ["السلط","عين الباشا","دير علا","الشونة الجنوبية"],
  "المفرق": ["المفرق","البادية الشمالية الغربية","البادية الشمالية الشرقية","الرويشد"],
  "جرش": ["جرش"],
  "عجلون": ["عجلون"],
  "مادبا": ["مادبا","ذيبان"],
  "الكرك": ["الكرك","المزار الجنوبي","القصر","الأغوار الجنوبية"],
  "الطفيلة": ["الطفيلة","بصيرا"],
  "معان": ["معان","البترا","الشوبك","الحسينية"],
  "العقبة": ["العقبة","القويرة"],
};

const initialSettings: Settings = { school:"", year:"2026 / 2027", semester:"الفصل الأول", grade:"", section:"", subject:"", track:"", governorate:"", directorate:"", teacher:"", principal:"", maxMark:100, passMark:50 };

function normalizeSettings(s: any): Settings {
  const base = { ...initialSettings, ...(s || {}) };
  if (base.grade && !SUBJECTS[base.grade]) { base.grade = ""; base.subject = ""; }
  if (base.grade && base.subject && !(SUBJECTS[base.grade] || []).includes(base.subject)) base.subject = "";
  if (!base.grade) base.subject = base.subject && Object.values(SUBJECTS).some(list=>list.includes(base.subject)) ? base.subject : "";
  if (base.governorate && !GOVERNORATES[base.governorate]) { base.governorate = ""; base.directorate = ""; }
  if (base.governorate && base.directorate && !(GOVERNORATES[base.governorate] || []).includes(base.directorate)) base.directorate = "";
  if (!base.governorate) base.directorate = "";
  if (base.section && !SECTIONS.includes(base.section)) base.section = "";
  base.track = "";
  if (base.semester !== "الفصل الأول" && base.semester !== "الفصل الثاني") base.semester = "الفصل الأول";
  if (!base.year) base.year = "2026 / 2027";
  return base;
}

async function callApi(action: string, args: any) {
  const res = await fetch("actions", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({action, args}) });
  const json = await res.json().catch(()=>({}));
  if (!res.ok || json.error) throw new Error(json.error || "تعذر الاتصال بالخدمة");
  return json.data;
}
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function gradeFor(mark:number, s:Settings) {
  if (mark < s.passMark) return "راسب";
  const pct = s.maxMark > 0 ? (mark / s.maxMark) * 100 : 0;
  if (pct >= 90) return "ممتاز";
  if (pct >= 80) return "جيد جدًا";
  if (pct >= 70) return "جيد";
  if (pct >= 60) return "مقبول";
  return "ضعيف";
}
function gradeColor(g:string) {
  if(g==="ممتاز") return {bg:"#e7f7ed", fg:"#116c3f"};
  if(g==="جيد جدًا") return {bg:"#e4f0ff", fg:"#215f96"};
  if(g==="جيد") return {bg:"#fff3d4", fg:"#8b6000"};
  if(g==="مقبول") return {bg:"#ffe9d8", fg:"#8b4b13"};
  if(g==="ضعيف") return {bg:"#fff0c5", fg:"#7f5b00"};
  return {bg:"#ffe7e6", fg:"#9c2d2a"};
}
function median(values:number[]) {
  if(!values.length) return 0;
  const s=[...values].sort((a,b)=>a-b);
  const mid=Math.floor(s.length/2);
  return s.length%2 ? s[mid] : (s[mid-1]+s[mid])/2;
}
function normalizeDigits(raw:string): string {
  const map: Record<string,string> = {"٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"};
  return String(raw||"").split("").map(ch=>map[ch] ?? ch).join("");
}
function parseSmartMark(raw:string): number | null {
  let s = normalizeDigits(String(raw||"").trim()).replace(/%/g,"").replace(/\s+/g,"").replace(/٬/g,"");
  if (!s) return null;
  if (/^-?\d+,\d+$/.test(s)) s = s.replace(",", ".");
  else s = s.replace(/,/g,"");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default function App(){
  const [tab,setTab]=useState("entry");
  // PWA-style install (desktop icon) — no change to any existing workflow.
  type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  useEffect(() => {
    document.title = "نظام المهارات الرقمية - تحليل نتائج الامتحانات";
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    let theme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!theme) { theme = document.createElement("meta"); theme.name = "theme-color"; document.head.appendChild(theme); }
    theme.content = "#0f6a4d";
    // Install metadata: standalone display, Arabic RTL, ministry logo as the app icon.
    try {
      const manifest = {
        name: "نظام المهارات الرقمية - تحليل نتائج الامتحانات",
        short_name: "تحليل النتائج",
        description: "تحليل نتائج الامتحانات — إدخال بالنسخ واللصق، إحصائيات وتقرير.",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "portrait",
        dir: "rtl",
        lang: "ar",
        theme_color: "#0f6a4d",
        background_color: "#f4f1e8",
        icons: [{ src: logoUrl, sizes: "512x512", type: "image/png", purpose: "any maskable" }]
      };
      const manifestUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" }));
      let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
      if (!link) { link = document.createElement("link"); link.rel = "manifest"; document.head.appendChild(link); }
      link.href = manifestUrl;
      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
      if (!appleIcon) { appleIcon = document.createElement("link"); appleIcon.rel = "apple-touch-icon"; document.head.appendChild(appleIcon); }
      appleIcon.href = logoUrl;
      let appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]') as HTMLMetaElement | null;
      if (!appleCapable) { appleCapable = document.createElement("meta"); appleCapable.name = "apple-mobile-web-app-capable"; document.head.appendChild(appleCapable); }
      appleCapable.content = "yes";
    } catch { /* Install metadata is best-effort; the app itself must keep working. */ }
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) setIsInstalled(true);
    const onBeforeInstall = (e: Event) => { e.preventDefault(); setDeferredPrompt(e as BeforeInstallPromptEvent); };
    const onInstalled = () => { setIsInstalled(true); setDeferredPrompt(null); setShowInstallGuide(false); };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onBeforeInstall); window.removeEventListener("appinstalled", onInstalled); };
  }, []);
  async function handleInstallClick() {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome !== "accepted") setShowInstallGuide(true);
      } catch { setShowInstallGuide(true); }
      setDeferredPrompt(null);
      return;
    }
    setShowInstallGuide(true);
  }
  const [settings,setSettings]=useState<Settings>(initialSettings);
  const [students,setStudents]=useState<Student[]>([]);
  // Copy-paste ONLY entry state — entry lives in the Students tab only.
  const [namesText,setNamesText]=useState("");
  const [marksText,setMarksText]=useState("");
  const [entryMode,setEntryMode]=useState<"marks"|"names">("marks");
  const [bulkFeedback,setBulkFeedback]=useState("");
  const [message,setMessage]=useState("");
  const [query,setQuery]=useState(""); const [sort,setSort]=useState("mark-desc"); const [filter,setFilter]=useState("all");
  const [saved,setSaved]=useState<SavedAnalysis[]>([]);
  const [analysisName,setAnalysisName]=useState("");
  const [renameId,setRenameId]=useState(""); const [renameValue,setRenameValue]=useState("");
  const [busy,setBusy]=useState(false); const [loadError,setLoadError]=useState(""); const [saveResult,setSaveResult]=useState("");
  const [confirmClear,setConfirmClear]=useState(false);
  // Auto-filled signature date: device date at the moment this report renders.
  // Recomputed on every render, so reopening / re-rendering the report picks up the current day.
  const autoDate = (() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = String(now.getFullYear());
    return `${dd} / ${mm} / ${yyyy}`;
  })();
  const subjectOptions = settings.grade ? (SUBJECTS[settings.grade] || []) : [];
  const directorateOptions = settings.governorate ? (GOVERNORATES[settings.governorate] || []) : [];

  const locationParts: string[] = [];
  if (settings.directorate) locationParts.push(`مديرية التربية والتعليم — ${settings.directorate}`);
  if (settings.governorate) locationParts.push(`محافظة ${settings.governorate}`);
  const locationLine = locationParts.join(" · ");
  const detailParts: string[] = [];
  if (settings.year.trim()) detailParts.push(`العام الدراسي ${settings.year.trim()}`);
  if (settings.semester) detailParts.push(settings.semester);
  if (settings.grade) detailParts.push(`الصف ${settings.grade}`);
  if (settings.section) detailParts.push(`الشعبة ${settings.section}`);
  if (settings.subject) detailParts.push(settings.subject);
  const detailLine = detailParts.join(" · ");
  const contextLine = [settings.school.trim() || "—", detailLine].filter(Boolean).join(" · ");
  const hasAnyHeader = Boolean(settings.school.trim() || locationLine || detailLine);

  const stats = useMemo(()=>{
    const marks=students.map(s=>s.mark).filter(n=>Number.isFinite(n));
    const passed=students.filter(s=>s.mark>=settings.passMark).length;
    const failed=students.length-passed;
    const avg=marks.length?marks.reduce((a,b)=>a+b,0)/marks.length:0;
    const variance=marks.length?marks.reduce((a,b)=>a+Math.pow(b-avg,2),0)/marks.length:0;
    const max = settings.maxMark || 100;
    const pct = (m:number)=> max>0 ? m/max*100 : 0;
    const dist=[
      {name:"ممتاز",range:`${Math.round(max*0.9)} - ${max}`,count:students.filter(s=>gradeFor(s.mark,settings)==="ممتاز").length,color:"#16794f"},
      {name:"جيد جدًا",range:`${Math.round(max*0.8)} - ${Math.round(max*0.9)-1}`,count:students.filter(s=>gradeFor(s.mark,settings)==="جيد جدًا").length,color:"#286b9c"},
      {name:"جيد",range:`${Math.round(max*0.7)} - ${Math.round(max*0.8)-1}`,count:students.filter(s=>gradeFor(s.mark,settings)==="جيد").length,color:"#d49a13"},
      {name:"مقبول",range:`${Math.round(max*0.6)} - ${Math.round(max*0.7)-1}`,count:students.filter(s=>gradeFor(s.mark,settings)==="مقبول").length,color:"#c9721d"},
      {name:"ضعيف",range:`${settings.passMark} - ${Math.round(max*0.6)-1}`,count:students.filter(s=>gradeFor(s.mark,settings)==="ضعيف").length,color:"#8b6000"},
      {name:"راسب",range:`أقل من ${settings.passMark}`,count:students.filter(s=>gradeFor(s.mark,settings)==="راسب").length,color:"#b93634"},
    ];
    const bins=Array.from({length:10},(_,i)=>{
      const lo = Math.round(max*i/10); const hi = i===9 ? max : Math.round(max*(i+1)/10)-1;
      return {name:`${lo} - ${hi}`, count: students.filter(s=>{ const p=pct(s.mark); return i===9 ? p>=90 : p>=i*10 && p<(i+1)*10; }).length};
    });
    const top=[...students].sort((a,b)=>b.mark-a.mark).slice(0,10);
    return {marks,passed,failed,rate:students.length?passed/students.length*100:0,failRate:students.length?failed/students.length*100:0,avg,highest:marks.length?Math.max(...marks):0,lowest:marks.length?Math.min(...marks):0,median:median(marks),std:Math.sqrt(variance),range:marks.length?Math.max(...marks)-Math.min(...marks):0,dist,bins,top};
  },[students,settings]);

  const reloadRecords = async()=>{
    try{
      const data=await callApi("records.list",{collection:"analyses"});
      setSaved(data.records||[]); setLoadError("");
    }catch(e){ setLoadError("تعذر تحميل التحليلات المحفوظة الآن. ستظل بياناتك الحالية ظاهرة في هذه الجلسة."); }
  };
  useEffect(()=>{ reloadRecords(); },[]);
  // Toasts live outside the report and auto-dismiss after 3 seconds.
  useEffect(()=>{
    if(!message) return;
    const t = setTimeout(()=>setMessage(""), 3000);
    return ()=>clearTimeout(t);
  },[message]);

  function updateGrade(grade:string){
    if (!grade) { setSettings(prev=>({...prev, grade:"", subject:"", track:""})); return; }
    setSettings(prev=>({...prev, grade, subject:"", track: grade==="الثاني عشر" ? prev.track : ""}));
  }
  function updateGovernorate(gov:string){
    if (!gov) { setSettings(prev=>({...prev, governorate:"", directorate:""})); return; }
    setSettings(prev=>({...prev, governorate: gov, directorate: ""}));
  }

  function columnLines(text:string): {line:number; value:string}[] {
    return text.split("\n").map((raw,i)=>({ line: i+1, value: raw.trim() })).filter(x=>x.value!=="");
  }
  function isValidMark(raw:string): boolean {
    const m = parseSmartMark(raw);
    return m !== null && m >= 0 && m <= settings.maxMark;
  }
  function importMarksOnly(){
    const marks = columnLines(marksText);
    if (!marks.length) { setBulkFeedback("الصق عمود العلامات في الخانة أولًا."); return; }
    const startAt = students.length;
    const parsed: Student[] = [];
    const skipped: number[] = [];
    marks.forEach((m)=>{
      const val = parseSmartMark(m.value);
      if (val===null || val < 0 || val > settings.maxMark) { skipped.push(m.line); return; }
      parsed.push({ uid: uid(), name: `طالب ${startAt + parsed.length + 1}`, studentId:"", mark: val });
    });
    if (!parsed.length) { setBulkFeedback(`لم نجد علامات صالحة. الأسطر المتخطاة: ${skipped.join("، ")} — يجب أن تكون أرقامًا بين 0 و ${settings.maxMark}.`); return; }
    setStudents(prev=>[...parsed, ...prev]);
    const msg = `تمت إضافة ${parsed.length} علامة دفعة واحدة.${skipped.length>0 ? ` تم تخطي الأسطر: ${skipped.join("، ")} لأنها ليست أرقامًا صالحة بين 0 و ${settings.maxMark}.` : ""} إجمالي القائمة الآن: ${students.length + parsed.length} طالبًا.`;
    setBulkFeedback(msg); setMessage(msg);
    setMarksText("");
  }
  function importTwoColumns(){
    const names = columnLines(namesText);
    const marks = columnLines(marksText);
    if (!names.length && !marks.length) { setBulkFeedback("الصق عمود الأسماء في الخانة اليمنى وعمود العلامات في الخانة اليسرى أولًا."); return; }
    if (names.length !== marks.length) { setBulkFeedback(`عدد الأسماء (${names.length}) لا يساوي عدد العلامات (${marks.length}) - راجع اللصق`); return; }
    const parsed: Student[] = [];
    const skipped: number[] = [];
    names.forEach((n,i)=>{
      const val = parseSmartMark(marks[i].value);
      if (val===null || val < 0 || val > settings.maxMark) { skipped.push(marks[i].line); return; }
      parsed.push({ uid: uid(), name: n.value, studentId:"", mark: val });
    });
    if (!parsed.length) { setBulkFeedback(`لم نجد صفوفًا صالحة. الأسطر المتخطاة: ${skipped.join("، ")} — يجب أن تكون العلامات أرقامًا بين 0 و ${settings.maxMark}.`); return; }
    setStudents(prev=>[...parsed, ...prev]);
    const msg = `تمت إضافة ${parsed.length} طالبًا دفعة واحدة.${skipped.length>0 ? ` تم تخطي الأسطر: ${skipped.join("، ")} لأن علاماتها ليست أرقامًا صالحة بين 0 و ${settings.maxMark}.` : ""} إجمالي القائمة الآن: ${students.length + parsed.length} طالبًا.`;
    setBulkFeedback(msg); setMessage(msg);
    setNamesText(""); setMarksText("");
  }
  function clearMarksOnly(){
    setMarksText(""); setBulkFeedback("تم مسح العمود.");
  }
  function clearTwoColumns(){
    setNamesText(""); setMarksText(""); setBulkFeedback("تم مسح العمودين.");
  }
  function clearAll(){
    setSettings(initialSettings);
    setStudents([]);
    setNamesText(""); setMarksText(""); setBulkFeedback("");
    setAnalysisName("");
    setQuery(""); setSort("mark-desc"); setFilter("all");
    setSaveResult(""); setConfirmClear(false);
    setMessage("تم مسح الكل والعودة إلى بداية جديدة — جميع الحقول فارغة الآن.");
    setTab("home");
  }
  function exportCsv(){
    const rows=[["الاسم","الرقم","العلامة","التقدير","النتيجة"],...students.map(s=>[s.name,s.studentId,s.mark,gradeFor(s.mark,settings),s.mark>=settings.passMark?"ناجح":"راسب"])];
    const csv="\uFEFF"+rows.map(r=>r.map(c=>`"${String(c).replaceAll('"','""')}"`).join(",")).join("\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const a=document.createElement("a"); a.href=url; a.download="نتائج-الطلاب.csv"; a.click(); URL.revokeObjectURL(url);
    setMessage("تم تجهيز ملف البيانات للتنزيل بصيغة CSV.");
  }
  async function createRow(row:AnalysisValue){
    await callApi("records.create",{collection:"analyses",value:row,idempotency_key:`analysis-${Date.now()}-${Math.random().toString(36).slice(2)}`});
  }
  async function saveAnalysis(){
    if(!analysisName.trim()){setSaveResult("اكتب اسمًا للتحليل قبل الحفظ.");return;}
    const row:AnalysisValue={name:analysisName.trim(),settings,students,savedAt:new Date().toISOString()};
    setBusy(true); let savedCount=0; let error:string|null=null;
    try{ await createRow(row); savedCount=1; }catch(e){ error=e instanceof Error?e.message:String(e); }
    let reloadError:string|null=null;
    try{ await reloadRecords(); }catch(e){ reloadError=e instanceof Error?e.message:String(e); }
    setSaveResult(error?`تم حفظ ${savedCount} من 1 — بقي ${1-savedCount}. الخطأ: ${error}`:`تم حفظ التحليل بنجاح. عدد المحفوظ: 1.`);
    if(reloadError) setSaveResult(prev=>prev+` تعذر تحديث القائمة: ${reloadError}`);
    setBusy(false);
  }
  async function deleteAnalysis(id:string){ setBusy(true); try{ await callApi("records.delete",{collection:"analyses",id}); await reloadRecords(); setSaveResult("تم حذف التحليل."); }catch(e){ setSaveResult("تعذر حذف التحليل."); } setBusy(false); }
  async function loadAnalysis(item:SavedAnalysis){ const st=normalizeSettings(item.value.settings); setSettings(st); setStudents(item.value.students); setAnalysisName(item.value.name); setTab("home"); setSaveResult(`تم فتح «${item.value.name}».`); }
  async function renameAnalysis(){ if(!renameId||!renameValue.trim())return; setBusy(true); try{ const item=saved.find(x=>x.id===renameId); if(item){ await callApi("records.replace",{collection:"analyses",id:renameId,value:{...item.value,name:renameValue.trim()}}); await reloadRecords(); setRenameId(""); setSaveResult("تمت إعادة تسمية التحليل."); } }catch{ setSaveResult("تعذر إعادة التسمية."); } setBusy(false); }

  const filtered=useMemo(()=>{
    let list=students.filter(s=>s.name.includes(query.trim())||s.studentId.includes(query.trim()));
    if(filter==="pass") list=list.filter(s=>s.mark>=settings.passMark);
    if(filter==="fail") list=list.filter(s=>s.mark<settings.passMark);
    if(filter!=="all"&&filter!=="pass"&&filter!=="fail") list=list.filter(s=>gradeFor(s.mark,settings)===filter);
    if(sort==="mark-desc") list.sort((a,b)=>b.mark-a.mark);
    if(sort==="mark-asc") list.sort((a,b)=>a.mark-b.mark);
    if(sort==="name") list.sort((a,b)=>a.name.localeCompare(b.name,"ar"));
    return list;
  },[students,query,sort,filter,settings]);

  const nameLines = columnLines(namesText);
  const markLines = columnLines(marksText);
  const invalidMarkLines = markLines.filter(m=>!isValidMark(m.value)).map(m=>m.line);
  const countsMatch = nameLines.length>0 && nameLines.length===markLines.length;
  const validMarkCount = markLines.length - invalidMarkLines.length;
  const pairedPreview = nameLines.slice(0,5).map((n,i)=>({ name: n.value, mark: markLines[i]?.value ?? "" }));

  const tabs=[{id:"home",label:"الرئيسية",icon:School},{id:"students",label:"الطلاب",icon:Users},{id:"save",label:"الحفظ والتقارير",icon:FileText}];

  // Copy-paste ONLY entry — lives ONLY in the Students tab. No grid, no file import.
  const bulkEntry = (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black text-xl sm:text-2xl">إدخال العلامات — نسخ ولصق فقط</h2>
          <p className="small mt-1">الإدخال يتم من هنا فقط (خانة الطلاب) — الصق العمود أو العمودين ثم اضغط «إضافة الكل دفعة واحدة». لا توجد طريقة إدخال أخرى.</p>
        </div>
        <span className="badge" style={{background:"var(--surface-2)",color:"var(--primary)"}}>{students.length} طالبًا في القائمة</span>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-lg">طريقة إدخال العلامات</h3>
            <p className="small mt-1">الإحصائيات لا تحتاج أسماء الطلاب — الصق العلامات فقط وسيتم ترقيم الطلاب تلقائيًا. تغيير الوضع لا يحذف الطلاب المدخلين أبدًا، بل يغيّر طريقة إضافة الجديد فقط.</p>
          </div>
          <span className="badge" style={{background:"var(--surface-2)",color:"var(--primary)"}}>الوضع الحالي: {entryMode==="marks" ? "علامات فقط" : "أسماء + علامات"}</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="طريقة إدخال العلامات">
          <button type="button" role="radio" aria-checked={entryMode==="marks"} onClick={()=>setEntryMode("marks")} className="text-right rounded-2xl border-2 p-4" style={{borderColor: entryMode==="marks" ? "var(--primary)" : "var(--line)", background: entryMode==="marks" ? "var(--surface-2)" : "var(--surface)"}}>
            <span className="flex items-center justify-between gap-2"><b className="text-base sm:text-lg">علامات فقط - بدون أسماء</b>{entryMode==="marks" && <span className="badge" style={{background:"var(--primary)",color:"#fff"}}>الوضع الافتراضي · موصى به</span>}</span>
            <span className="small block mt-1">الصق عمود العلامات فقط، وسيتم ترقيم الطلاب تلقائيًا: طالب 1، طالب 2، طالب 3 …</span>
          </button>
          <button type="button" role="radio" aria-checked={entryMode==="names"} onClick={()=>setEntryMode("names")} className="text-right rounded-2xl border-2 p-4" style={{borderColor: entryMode==="names" ? "var(--primary)" : "var(--line)", background: entryMode==="names" ? "var(--surface-2)" : "var(--surface)"}}>
            <span className="flex items-center justify-between gap-2"><b className="text-base sm:text-lg">أسماء + علامات</b>{entryMode==="names" && <span className="badge" style={{background:"var(--primary)",color:"#fff"}}>محدد الآن</span>}</span>
            <span className="small block mt-1">الصق عمود الأسماء بجانب عمود العلامات، مع مطابقة عدد الأسطر.</span>
          </button>
        </div>
      </div>

      {bulkFeedback && <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-sm font-bold">{bulkFeedback}</div>}

      {entryMode==="marks" && (
      <div className="mt-6 rounded-2xl border-2 border-[var(--primary)] p-4 sm:p-5" style={{background:"var(--surface)"}}>
        <div className="flex flex-wrap items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white font-black text-sm">1</span><ClipboardPaste size={20} color="var(--primary)"/><h3 className="font-black text-lg sm:text-xl">إدخال عمودي: علامات فقط</h3></div>
        <p className="small mt-2">الإحصائيات لا تحتاج أسماء الطلاب - الصق العلامات فقط وسيتم ترقيم الطلاب تلقائيًا: طالب 1، طالب 2، طالب 3 … علامة واحدة في كل سطر، بالترتيب نفسه كما في الكشف. تُتجاهل الأسطر الفارغة، وتُحوَّل الأرقام العربية وتُحذف علامة % تلقائيًا.</p>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-black" htmlFor="marks-only-column">العلامات النهائية - الصق عمود العلامات هنا</label>
          <textarea id="marks-only-column" rows={10} value={marksText} onChange={e=>setMarksText(e.target.value)} placeholder={"85\n92\n78\n..."} className="leading-8" dir="ltr" style={{textAlign:"center"}} aria-label="العلامات النهائية - الصق عمود العلامات هنا" />
          <p className="mt-2 text-sm font-bold" aria-live="polite">عدد العلامات: {markLines.length}{markLines.length>0 && ` — سيتم ترقيمها من طالب ${students.length + 1} إلى طالب ${students.length + markLines.length}`}</p>
        </div>
        {invalidMarkLines.length>0 && <p className="mt-3 rounded-xl border border-[var(--danger)] bg-[#fff1f0] px-4 py-3 text-sm font-black text-[var(--danger)]" role="alert">علامات غير صالحة في الأسطر: {invalidMarkLines.join("، ")} — يجب أن تكون أرقامًا بين 0 و {settings.maxMark}. ستُتخطى هذه الأسطر عند الإضافة، وتُتجاهل الأسطر الفارغة.</p>}
        {markLines.length>0 && invalidMarkLines.length===0 && <div className="mt-4 rounded-xl border border-[var(--line)] p-3"><p className="text-sm font-black">معاينة — أول {Math.min(5, markLines.length)} من أصل {markLines.length}:</p><div className="mt-2 space-y-1">{markLines.slice(0,5).map((m,i)=><p key={i} className="flex justify-between gap-3 text-sm"><span>{i+1}. طالب {students.length + i + 1}</span><b>{m.value}</b></p>)}</div></div>}
        <div className="flex flex-wrap gap-2 mt-4">
          <button className="btn btn-primary" onClick={importMarksOnly} disabled={validMarkCount===0}><ListPlus size={18}/>إضافة الكل دفعة واحدة</button>
          <button className="btn btn-soft" onClick={clearMarksOnly}>مسح</button>
        </div>
        <p className="small mt-2">يبقى زر الإضافة معطّلًا حتى تكون هناك علامة صالحة واحدة على الأقل. الأسطر غير الصالحة تُتخطى ويُعرض رقمها بعد الإضافة.</p>
      </div>
      )}
      {entryMode==="names" && (
      <div className="mt-6 rounded-2xl border-2 border-[var(--primary)] p-4 sm:p-5" style={{background:"var(--surface)"}}>
        <div className="flex flex-wrap items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white font-black text-sm">1</span><ClipboardPaste size={20} color="var(--primary)"/><h3 className="font-black text-lg sm:text-xl">إدخال عمودي: أسماء + علامات</h3></div>
        <p className="small mt-2">انسخ عمود الأسماء والصقه في الخانة اليمنى، ثم انسخ عمود العلامات النهائية وحده والصقه في الخانة اليسرى — كل عمود على حدة، واسم واحد في كل سطر وعلامة واحدة في كل سطر. تُقترن الأسطر بالترتيب: الاسم الأول مع العلامة الأولى، وهكذا. تُتجاهل الأسطر الفارغة، وتُحوَّل الأرقام العربية وتُحذف علامة % تلقائيًا.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-black" htmlFor="names-column">أسماء الطلاب - الصق عمود الأسماء هنا</label>
            <textarea id="names-column" rows={10} value={namesText} onChange={e=>setNamesText(e.target.value)} placeholder={"أحمد محمد\nسارة علي\nخالد يوسف\n..."} className="leading-8" aria-label="أسماء الطلاب - الصق عمود الأسماء هنا" />
            <p className="mt-2 text-sm font-bold" aria-live="polite">عدد الأسماء: {nameLines.length}</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-black" htmlFor="marks-column">العلامات النهائية - الصق عمود العلامات هنا</label>
            <textarea id="marks-column" rows={10} value={marksText} onChange={e=>setMarksText(e.target.value)} placeholder={"85\n92\n78\n..."} className="leading-8" dir="ltr" style={{textAlign:"center"}} aria-label="العلامات النهائية - الصق عمود العلامات هنا" />
            <p className="mt-2 text-sm font-bold" aria-live="polite">عدد العلامات: {markLines.length}</p>
          </div>
        </div>
        {(nameLines.length>0 || markLines.length>0) && !countsMatch && <p className="mt-3 rounded-xl border border-[var(--danger)] bg-[#fff1f0] px-4 py-3 text-sm font-black text-[var(--danger)]" role="alert">عدد الأسماء ({nameLines.length}) لا يساوي عدد العلامات ({markLines.length}) - راجع اللصق</p>}
        {invalidMarkLines.length>0 && <p className="mt-3 rounded-xl border border-[var(--danger)] bg-[#fff1f0] px-4 py-3 text-sm font-black text-[var(--danger)]" role="alert">علامات غير صالحة في الأسطر: {invalidMarkLines.join("، ")} — يجب أن تكون أرقامًا بين 0 و {settings.maxMark}. ستُتخطى هذه الأسطر عند الإضافة.</p>}
        {countsMatch && <div className="mt-4 rounded-xl border border-[var(--line)] p-3">
          <p className="text-sm font-black">معاينة الإقران — أول {pairedPreview.length} صفوف من أصل {nameLines.length}:</p>
          <div className="mt-2 space-y-1">{pairedPreview.map((row,i)=><p key={i} className="flex justify-between gap-3 text-sm"><span>{i+1}. {row.name}</span><b>{row.mark}</b></p>)}</div>
          {nameLines.length>5 && <p className="small mt-2">… و {nameLines.length-5} صفًا آخر سيُضاف بنفس الترتيب.</p>}
        </div>}
        <div className="flex flex-wrap gap-2 mt-4">
          <button className="btn btn-primary" onClick={importTwoColumns} disabled={!countsMatch}><ListPlus size={18}/>إضافة الكل دفعة واحدة</button>
          <button className="btn btn-soft" onClick={clearTwoColumns}>مسح العمودين</button>
        </div>
        <p className="small mt-2">يبقى زر الإضافة معطّلًا حتى يتساوى عدد الأسماء مع عدد العلامات. الأسطر غير الصالحة تُتخطى ويُعرض رقمها بعد الإضافة.</p>
      </div>
      )}
    </div>
  );

  return <div data-safe-area-inset-root dir="rtl" lang="ar" style={{boxSizing:"border-box",paddingTop:"var(--safe-area-inset-top)",minHeight:"100vh",background:"var(--bg)",color:"var(--ink)"}}>
    <header data-safe-area-sticky-top className="no-print" style={{position:"sticky",top:"var(--safe-area-inset-top)",zIndex:20,background:"var(--surface)",borderBottom:"2px solid var(--primary)",color:"var(--ink)"}}>
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 text-center">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[var(--muted)]">{isInstalled ? "يعمل الآن كتطبيق مثبّت" : ""}</span>
          {isInstalled ? (
            <span className="btn btn-soft !py-2 !px-3 text-xs"><CheckCircle2 size={15} />تم تثبيت التطبيق</span>
          ) : (
            <button type="button" className="btn btn-soft !py-2 !px-3 text-xs" onClick={handleInstallClick}><Smartphone size={15} />تثبيت التطبيق</button>
          )}
        </div>
        {showInstallGuide && (
          <div role="dialog" aria-label="كيفية تثبيت التطبيق" className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4 text-right">
            <div className="flex items-start justify-between gap-2">
              <p className="font-black text-sm sm:text-base">تثبيت التطبيق كأيقونة على سطح المكتب</p>
              <button type="button" aria-label="إغلاق دليل التثبيت" className="btn btn-soft !py-1 !px-2 text-xs" onClick={() => setShowInstallGuide(false)}><X size={15} /></button>
            </div>
            <p className="mt-2 text-sm font-bold">من قائمة المتصفح اختر: تثبيت التطبيق / Add to Home Screen / Install App</p>
            <ul className="mt-2 space-y-1 text-sm leading-6">
              <li><b>Chrome على الكمبيوتر:</b> اضغط قائمة النقاط الثلاث ⋮ ← «تثبيت التطبيق» أو «Install App».</li>
              <li><b>Edge على الكمبيوتر:</b> اضغط قائمة النقاط الثلاث … ← «تطبيقات» ← «تثبيت هذا التطبيق».</li>
              <li><b>على الهاتف:</b> من قائمة المتصفح اختر «إضافة إلى الشاشة الرئيسية» / Add to Home Screen.</li>
            </ul>
            <p className="small mt-2">بعد التثبيت يفتح التطبيق في نافذة مستقلة بدون أشرطة المتصفح، مع نفس الصفحات والتقرير والتوقيعات والتاريخ التلقائي.</p>
          </div>
        )}
        <div className="flex flex-col items-center">
          <img src={logoUrl} alt="شعار وزارة التربية والتعليم الأردنية" className="h-[86px] w-auto object-contain sm:h-[104px]" />
          <p className="mt-2 text-[15px] sm:text-xl font-black leading-tight">المملكة الأردنية الهاشمية — وزارة التربية والتعليم وتنمية الموارد البشرية</p>
          {locationLine ? <p className="mt-1 flex flex-wrap items-center justify-center gap-1 text-xs sm:text-sm font-bold text-[var(--muted)]"><MapPin size={15} color="var(--primary)"/>{locationLine}</p> : <p className="mt-1 text-xs sm:text-sm font-bold text-[var(--muted)]">لم يتم الإدخال بعد — اختر المحافظة والمديرية من الأسفل</p>}
          <h1 className="mt-2 text-xl sm:text-2xl font-black leading-tight">{settings.school.trim() ? settings.school : "—"}</h1>
          {hasAnyHeader && detailLine ? <p className="mt-1 text-xs sm:text-sm font-bold">تحليل نتائج إلكتروني · {detailLine}</p> : <p className="mt-1 text-xs sm:text-sm font-bold text-[var(--muted)]">تحليل نتائج إلكتروني · لم يتم الإدخال بعد</p>}
        </div>
        <nav className="mt-4 flex justify-center gap-1 overflow-x-auto pb-1" aria-label="أقسام التطبيق">
          {tabs.map(t=> <button key={t.id} onClick={()=>setTab(t.id)} className={`tab-btn flex items-center gap-2 ${tab===t.id?"active":""}`}><t.icon size={17}/>{t.label}</button>)}
        </nav>
      </div>
    </header>

    <main className="mx-auto max-w-[1240px] px-4 sm:px-6 py-5 sm:py-7">
      {message && <div role="status" aria-live="polite" className="no-print fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--ink)] px-4 py-2.5 text-sm font-bold text-[var(--bg)] shadow-xl"><CheckCircle2 size={18} color="var(--success)"/>{message}</div>}

      {tab==="home" && <section className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4"><div className="flex items-center gap-2"><School size={20} color="var(--primary)"/><h2 className="font-black text-lg">بيانات المدرسة</h2></div>
              {confirmClear ? <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold">مسح كل الحقول والطلاب؟</span><button className="btn btn-danger !py-2 text-xs" onClick={clearAll}><RotateCcw size={14}/>نعم، مسح الكل</button><button className="btn btn-soft !py-2 text-xs" onClick={()=>setConfirmClear(false)}>إلغاء</button></div> : <button className="btn btn-danger !py-2 text-xs" onClick={()=>setConfirmClear(true)}><RotateCcw size={14}/>مسح الكل / بداية جديدة</button>}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="field"><label>المحافظة</label><select value={settings.governorate} onChange={e=>updateGovernorate(e.target.value)}><option value="">اختر المحافظة</option>{Object.keys(GOVERNORATES).map(g=><option key={g} value={g}>{g}</option>)}</select></div>
              <div className="field"><label>مديرية التربية والتعليم</label><select value={settings.directorate} onChange={e=>setSettings({...settings,directorate:e.target.value})} disabled={!settings.governorate}><option value="">اختر المديرية</option>{directorateOptions.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
              <div className="field sm:col-span-2"><label>اسم المدرسة</label><input value={settings.school} onChange={e=>setSettings({...settings,school:e.target.value})} placeholder="اكتب اسم المدرسة"/></div>
              <div className="field"><label>السنة الدراسية</label><input value={settings.year} onChange={e=>setSettings({...settings,year:e.target.value})} placeholder="2026 / 2027" dir="ltr" style={{textAlign:"center"}}/></div>
              <div className="field"><label>الصف الدراسي</label><select value={settings.grade} onChange={e=>updateGrade(e.target.value)}><option value="">اختر الصف</option>{GRADES.map(g=><option key={g} value={g}>الصف {g}</option>)}</select></div>
              <div className="field"><label>الشعبة</label><select value={settings.section} onChange={e=>setSettings({...settings,section:e.target.value})}><option value="">اختر الشعبة</option>{SECTIONS.map(s=><option key={s} value={s}>الشعبة {s}</option>)}</select></div>
              <div className="field"><label>المادة الدراسية</label><select value={settings.subject} onChange={e=>setSettings({...settings,subject:e.target.value})} disabled={!settings.grade}><option value="">اختر المادة</option>{subjectOptions.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div className="field"><label>اسم المعلم</label><input value={settings.teacher} onChange={e=>setSettings({...settings,teacher:e.target.value})} placeholder="اكتب اسم المعلم"/></div>
              <div className="field"><label>اسم المدير</label><input value={settings.principal} onChange={e=>setSettings({...settings,principal:e.target.value})} placeholder="اكتب اسم المدير"/></div>
              <div className="field sm:col-span-2"><label>الفصل الدراسي</label><select value={settings.semester} onChange={e=>setSettings({...settings,semester:e.target.value})}><option value="الفصل الأول">الفصل الأول</option><option value="الفصل الثاني">الفصل الثاني</option></select></div>
            </div>
            <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
              <p className="text-xs font-black text-[var(--muted)]">إعدادات العلامات — ثانوية</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="field"><label>العلامة العظمى</label><input type="number" value={settings.maxMark} onChange={e=>setSettings({...settings,maxMark:Number(e.target.value)})}/></div>
                <div className="field"><label>علامة النجاح</label><input type="number" value={settings.passMark} onChange={e=>setSettings({...settings,passMark:Number(e.target.value)})}/></div>
              </div>
            </div>
            <p className="small mt-3">ابدأ من حقل فارغ: اختر المحافظة لتظهر المديريات، واختر الصف لتظهر المواد. لا يظهر في الترويسة إلا ما تدخله أنت.</p>
            <div className="mt-4 rounded-xl bg-[var(--surface-2)] px-4 py-3"><p className="text-sm font-bold">إدخال العلامات يتم من خانة «الطلاب» فقط — انتقل إلى تبويب الطلاب للصق الأعمدة.</p><button className="btn btn-primary mt-3" onClick={()=>setTab("students")}><Users size={17}/>اذهب لإدخال الطلاب</button></div>
          </div>

          <div className="space-y-5">
            <div className="card p-5"><h2 className="font-black text-lg mb-2">إدخال الطلاب من مكان واحد</h2><p className="small mb-3">كل إدخال العلامات يتم في تبويب «الطلاب» فقط — بالنسخ واللصق. الإحصائيات في هذه الصفحة تتحدّث مباشرة من القائمة هناك.</p><button className="btn btn-primary w-full" onClick={()=>setTab("students")}><Users size={17}/>اذهب لإدخال الطلاب</button></div>
            <div className="rounded-2xl bg-[var(--primary)] text-white p-5"><p className="text-sm opacity-80">نظرة سريعة</p><p className="text-3xl font-black mt-1">{stats.rate.toFixed(1)}% نسبة النجاح</p><p className="text-sm mt-2 opacity-90">{stats.passed} ناجحًا · {stats.failed} راسبًا من أصل {students.length} طالبًا · المتوسط {stats.avg.toFixed(1)}</p>{students.length===0 && <p className="text-sm mt-2 opacity-90">لا توجد علامات بعد — أدخلها دفعة واحدة من تبويب الطلاب</p>}</div>
          </div>
        </div>
      </section>}

      {tab==="home" && <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5"><div><h2 className="text-2xl font-black">الإحصائيات والرسوم</h2><p className="small">{contextLine} — كل الأرقام والرسوم تُحدَّث مباشرة من نفس القائمة.</p></div></div>
        {students.length===0 && <div className="card p-5 mb-4 text-center font-bold">لا توجد علامات بعد — أدخلها دفعة واحدة من تبويب الطلاب</div>}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[{l:"عدد الطلاب",v:students.length,sub:"من أصل القائمة الحالية",icon:Users},{l:"المتوسط",v:stats.avg.toFixed(1),sub:`من ${settings.maxMark}`,icon:Calculator},{l:"أعلى علامة",v:stats.highest,sub:`من ${settings.maxMark}`,icon:Award},{l:"أدنى علامة",v:stats.lowest,sub:`من ${settings.maxMark}`,icon:ArrowDownWideNarrow},{l:"الوسيط",v:stats.median.toFixed(1),sub:"نصف الطلاب فوقه ونصفهم تحته",icon:Calculator},{l:"الانحراف المعياري",v:stats.std.toFixed(2),sub:"مقدار تشتت العلامات حول المتوسط",icon:Calculator},{l:"المدى",v:stats.range,sub:"أعلى علامة − أدنى علامة",icon:ArrowDownWideNarrow},{l:"عدد الناجحين + نسبة النجاح",v:`${stats.passed} · ${stats.rate.toFixed(1)}%`,sub:`علامة النجاح ${settings.passMark}`,icon:CheckCircle2},{l:"عدد الراسبين + نسبة الرسوب",v:`${stats.failed} · ${stats.failRate.toFixed(1)}%`,sub:`أقل من ${settings.passMark}`,icon:XCircle}].map((k,i)=><div key={i} className="card p-4"><div className="flex justify-between"><p className="text-xs font-bold text-[var(--muted)]">{k.l}</p><k.icon size={18} color="var(--primary)"/></div><p className="kpi-num mt-3">{k.v}</p><p className="small mt-2">{k.sub}</p></div>)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          <div className="card p-5"><h3 className="font-black mb-4">توزيع التقديرات</h3><div className="h-[280px]" dir="ltr"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.dist} margin={{top:10,right:10,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis allowDecimals={false}/><Tooltip formatter={(v:any)=>[`${v} طالبًا`,"العدد"]}/><Bar dataKey="count" radius={[8,8,0,0]}>{stats.dist.map(d=><Cell key={d.name} fill={d.color}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
          <div className="card p-5"><h3 className="font-black mb-4">توزيع العلامات (فئات من 10 درجات)</h3><div className="h-[280px]" dir="ltr"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.bins}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:10}} interval={0}/><YAxis allowDecimals={false}/><Tooltip formatter={(v:any)=>[`${v} طالبًا`,"العدد"]}/><Bar dataKey="count" fill="var(--primary)" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          <div className="card p-5"><h3 className="font-black mb-4">أعلى 10 طلاب</h3><div className="h-[340px]" dir="ltr"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.top} layout="vertical" margin={{left:20,right:20}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" domain={[0,settings.maxMark]}/><YAxis type="category" dataKey="name" width={120} tick={{fontSize:12}}/><Tooltip formatter={(v:any)=>[`${v} من ${settings.maxMark}`,"العلامة"]}/><Bar dataKey="mark" fill="var(--accent)" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></div></div>
          <div className="card p-5"><h3 className="font-black mb-4">جدول التصنيف</h3><div className="table-wrap"><table className="!min-w-[320px]"><thead><tr><th>التقدير</th><th>المدى</th><th>العدد</th><th>النسبة</th></tr></thead><tbody>{stats.dist.map(d=><tr key={d.name}><td><span className="badge" style={{background:d.color,color:"#fff"}}>{d.name}</span></td><td className="text-sm">{d.range}</td><td className="font-black">{d.count}</td><td className="font-bold">{students.length?((d.count/students.length)*100).toFixed(1):"0.0"}%</td></tr>)}</tbody></table></div><p className="small mt-3">التصنيفات تُحسب نسبةً إلى العلامة العظمى ({settings.maxMark})، والرسوب لمن هم دون علامة النجاح ({settings.passMark}).</p><div className="mt-4 rounded-xl bg-[var(--surface-2)] p-4 flex items-center gap-3"><GraduationCap size={28} color="var(--primary)"/><div><p className="font-black">قراءة سريعة</p><p className="small">{students.length===0?"أدخل العلامات دفعة واحدة لعرض الخلاصة.":`المدى ${stats.range} · الوسيط ${stats.median.toFixed(1)} · المتوسط ${stats.avg.toFixed(1)}. `}{students.length>0 && (stats.rate>=70?"أداء عام قوي، مع فرصة لدعم مجموعة صغيرة من الطلاب.":stats.rate>=50?"أداء متوسط، ويحتاج الطلاب الأقل علامة إلى دعم موجّه.":"نسبة النجاح منخفضة، ويُنصح بخطة دعم ومراجعة مركزة.")}</p></div></div></div>
        </div>
      </section>}

      {tab==="students" && <section className="space-y-5">
        {bulkEntry}
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black">قائمة الطلاب الكاملة</h2><p className="small">عدّل أي علامة مباشرة من الجدول، أو احذف أي صف. لإضافة المزيد، استخدم النسخ واللصق أعلاه في نفس الخانة.</p></div></div>
        <div className="flex flex-wrap gap-3"><div className="relative flex-1 min-w-[220px]"><Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث بالاسم أو الرقم…" className="!pr-10"/></div><select value={sort} onChange={e=>setSort(e.target.value)} className="!w-auto"><option value="mark-desc">الترتيب: الأعلى علامة</option><option value="mark-asc">الترتيب: الأقل علامة</option><option value="name">الترتيب: الاسم</option></select><select value={filter} onChange={e=>setFilter(e.target.value)} className="!w-auto"><option value="all">كل الطلاب</option><option value="pass">الناجحون فقط</option><option value="fail">الراسبون فقط</option><option value="ممتاز">ممتاز فقط</option><option value="جيد جدًا">جيد جدًا فقط</option><option value="جيد">جيد فقط</option><option value="مقبول">مقبول فقط</option><option value="ضعيف">ضعيف فقط</option></select></div>
        {students.length===0 ? <div className="card p-8 text-center"><p className="font-black text-lg">لا توجد علامات بعد — أدخلها دفعة واحدة من الأعلى في نفس الخانة</p><p className="small mt-2">الصق قائمة كاملة بالنسخ واللصق من الأعلى.</p></div> : <div className="card overflow-hidden"><div className="table-wrap"><table><thead><tr><th>الرقم</th><th>الاسم</th><th>العلامة</th><th>التقدير</th><th>النتيجة</th><th>إجراء</th></tr></thead><tbody>{filtered.map((s,idx)=>{const g=gradeFor(s.mark,settings); const c=gradeColor(g); return <tr key={s.uid}><td className="text-center font-bold text-[var(--muted)]">{idx+1}</td><td><input value={s.name} onChange={e=>setStudents(prev=>prev.map(x=>x.uid===s.uid?{...x,name:e.target.value}:x))} className="!border-0 !p-1 font-bold" aria-label={`اسم الطالب في الصف ${idx+1}`}/></td><td><input type="number" min={0} max={settings.maxMark} value={s.mark} onChange={e=>setStudents(prev=>prev.map(x=>x.uid===s.uid?{...x,mark:Number(e.target.value)}:x))} className="!border-0 !p-1 !w-[90px] font-black" aria-label={`علامة الطالب في الصف ${idx+1}`}/></td><td><span className="badge" style={{background:c.bg,color:c.fg}}>{g}</span></td><td className="font-bold">{s.mark>=settings.passMark?"ناجح":"راسب"}</td><td><button className="btn btn-danger !py-2 !px-3 text-xs" onClick={()=>setStudents(prev=>prev.filter(x=>x.uid!==s.uid))}><Trash2 size={15}/>حذف</button></td></tr>})}</tbody></table></div>{filtered.length===0 && <p className="p-6 text-center text-[var(--muted)]">لا توجد نتائج مطابقة للبحث أو التصفية.</p>}<div className="p-4 flex justify-between text-sm font-bold border-t border-[var(--line)]"><span>المعروض: {filtered.length} طالبًا</span><span>المتوسط المعروض: {filtered.length?(filtered.reduce((a,b)=>a+b.mark,0)/filtered.length).toFixed(1):"—"}</span></div></div>}
      </section>}

      {tab==="save" && <section className="space-y-5">
        <div className="card no-print p-5"><h2 className="font-black text-lg mb-2">التحليلات المحفوظة</h2><p className="small mb-3">احفظ نسخة من هذا التحليل وارجع إليها في أي وقت. تُحفظ عبر خدمة السجلات المرتبطة بالتطبيق.</p>
          <div className="field"><label>اسم التحليل</label><input value={analysisName} onChange={e=>setAnalysisName(e.target.value)} placeholder="اكتب اسم التحليل"/></div>
          <button className="btn btn-primary mt-3 w-full" disabled={busy} onClick={saveAnalysis}><Save size={18}/>{busy?"جارٍ الحفظ…":"حفظ التحليل الحالي"}</button>
          {saveResult && <p className="mt-3 text-sm font-bold">{saveResult}</p>}{loadError && <p className="mt-3 text-sm text-[var(--danger)]">{loadError}</p>}
          <div className="mt-4 space-y-2">{saved.length===0 && <p className="small">لا توجد تحليلات محفوظة بعد.</p>}{saved.map(item=><div key={item.id} className="rounded-xl border border-[var(--line)] p-3">
            <div className="flex justify-between gap-2"><div className="min-w-0"><p className="font-extrabold truncate">{item.value.name}</p><p className="small">{item.value.students.length} طالبًا · {item.value.settings.subject || "—"} · {new Date(item.created_at).toLocaleDateString("ar")}</p></div><FolderOpen size={18} className="shrink-0"/></div>
            {renameId===item.id ? <div className="mt-2 flex gap-2"><input value={renameValue} onChange={e=>setRenameValue(e.target.value)}/><button className="btn btn-primary" onClick={renameAnalysis}>حفظ</button></div> : <div className="mt-3 flex flex-wrap gap-2"><button className="btn btn-soft !py-2 text-xs" onClick={()=>loadAnalysis(item)}>فتح</button><button className="btn btn-soft !py-2 text-xs" onClick={()=>{setRenameId(item.id);setRenameValue(item.value.name)}}><Pencil size={14}/>إعادة تسمية</button><button className="btn btn-danger !py-2 text-xs" onClick={()=>deleteAnalysis(item.id)}><Trash2 size={14}/>حذف</button></div>}
          </div>)}</div>
        </div>
        <div className="no-print flex flex-wrap justify-between gap-3 mb-4"><div><h2 className="text-2xl font-black">معاينة التقرير</h2><p className="small">هذه هي النسخة التي ستُطبع فقط — رأس الصفحة + كشف الطلاب + الملخص والرسوم والتصنيفات على صفحتين. استخدم طباعة المتصفح.</p></div><button className="btn btn-soft" onClick={exportCsv}><Download size={17}/>تصدير بيانات التقرير CSV</button></div>
        <div id="report-area" className="report print-only-report rounded-2xl p-4">
          <div className="report-header print-avoid-break text-center border-b-2 border-[var(--ink)] pb-2">
            <img src={logoUrl} alt="شعار وزارة التربية والتعليم الأردنية" className="mx-auto h-[45px] w-auto object-contain" />
            <p className="text-[11px] font-bold tracking-wider mt-1">المملكة الأردنية الهاشمية — وزارة التربية والتعليم وتنمية الموارد البشرية</p>
            {locationLine ? <p className="text-[11px] font-bold mt-0.5">{locationLine}</p> : <p className="text-[11px] font-bold mt-0.5 text-[var(--muted)]">لم يتم الإدخال بعد</p>}
            <h3 className="text-[15px] font-black mt-1">{settings.school.trim() ? settings.school : "—"}</h3>
            {detailLine ? <p className="text-[11px] mt-0.5">{detailLine}</p> : <p className="text-[11px] mt-0.5 text-[var(--muted)]">لم يتم الإدخال بعد</p>}
          </div>
          <h4 className="font-black text-[12px] mt-3 mb-1">تقرير الطلبة — كشف الطلاب</h4>
          {students.length===0 ? <p className="py-4 text-center font-bold">لا توجد علامات بعد — أدخلها دفعة واحدة من تبويب الطلاب</p> : <div className="table-wrap"><table className="!min-w-[520px]"><thead><tr><th>الرقم</th><th>الاسم</th><th>العلامة</th><th>التقدير</th><th>النتيجة</th></tr></thead><tbody>{students.map((s,i)=><tr key={s.uid}><td className="text-center font-bold text-[var(--muted)]">{i+1}</td><td>{s.name}</td><td className="font-black">{s.mark}</td><td>{gradeFor(s.mark,settings)}</td><td>{s.mark>=settings.passMark?"ناجح":"راسب"}</td></tr>)}</tbody></table></div>}
          <div className="print-avoid-break"><h4 className="font-black text-[12px] mt-3 mb-1">ملخص الإحصائيات</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">{[["عدد الطلاب",String(students.length)],["المتوسط",stats.avg.toFixed(1)],["نسبة النجاح",`${stats.rate.toFixed(1)}%`],["نسبة الرسوب",`${stats.failRate.toFixed(1)}%`],["أعلى علامة",String(stats.highest)],["أدنى علامة",String(stats.lowest)],["الوسيط",stats.median.toFixed(1)],["المدى",String(stats.range)],["عدد الناجحين",String(stats.passed)],["عدد الراسبين",String(stats.failed)],["الانحراف المعياري",stats.std.toFixed(2)],["العلامة العظمى",String(settings.maxMark)]].map(([l,v])=><div key={l} className="stat-card border border-[var(--line)] rounded-lg p-2 text-center"><p className="text-[10px] leading-tight text-[var(--muted)]">{l}</p><p className="text-[15px] font-black leading-tight">{v}</p></div>)}</div>
          <p className="text-[10px] mt-1 text-[var(--muted)]">علامة النجاح: {settings.passMark} · العلامة العظمى: {settings.maxMark}</p></div>
          <div className="print-avoid-break"><h4 className="font-black text-[12px] mt-3 mb-1">الرسوم البيانية</h4>
          <div className="grid lg:grid-cols-2 gap-2">
            <div><p className="font-bold text-[11px] mb-1">توزيع التقديرات</p><div className="chart-box h-[130px]" dir="ltr"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.dist} margin={{top:10,right:10,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis allowDecimals={false}/><Tooltip formatter={(v:any)=>[`${v} طالبًا`,"العدد"]}/><Bar dataKey="count" radius={[8,8,0,0]}>{stats.dist.map(d=><Cell key={d.name} fill={d.color}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
            <div><p className="font-bold text-[11px] mb-1">توزيع العلامات (فئات من 10 درجات)</p><div className="chart-box h-[130px]" dir="ltr"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.bins}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:10}} interval={0}/><YAxis allowDecimals={false}/><Tooltip formatter={(v:any)=>[`${v} طالبًا`,"العدد"]}/><Bar dataKey="count" fill="var(--primary)" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div>
            <div className="lg:col-span-2"><p className="font-bold text-[11px] mb-1">أعلى 10 طلاب</p><div className="chart-box h-[130px]" dir="ltr"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.top} layout="vertical" margin={{left:20,right:20}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" domain={[0,settings.maxMark]}/><YAxis type="category" dataKey="name" width={120} tick={{fontSize:12}}/><Tooltip formatter={(v:any)=>[`${v} من ${settings.maxMark}`,"العلامة"]}/><Bar dataKey="mark" fill="var(--accent)" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></div></div>
          </div></div>
          <div className="print-avoid-break"><h4 className="font-black text-[12px] mt-3 mb-1">تصنيف جميع طلاب الشعبة</h4>
          <div className="table-wrap"><table className="!min-w-[320px]"><thead><tr><th>التقدير</th><th>المدى</th><th>العدد</th><th>النسبة</th></tr></thead><tbody>{stats.dist.map(d=><tr key={d.name}><td><span className="badge" style={{background:d.color,color:"#fff"}}>{d.name}</span></td><td className="text-sm">{d.range}</td><td className="font-black">{d.count}</td><td className="font-bold">{students.length?((d.count/students.length)*100).toFixed(1):"0.0"}%</td></tr>)}</tbody></table></div>
          <p className="text-[10px] mt-1 text-[var(--muted)]">التصنيفات تُحسب نسبةً إلى العلامة العظمى ({settings.maxMark})، والرسوب لمن هم دون علامة النجاح ({settings.passMark}).</p></div>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-2 text-[10px] font-bold text-[var(--muted)]"><span>{settings.school.trim() ? settings.school : "—"}</span><span>{detailLine || "تحليل نتائج إلكتروني"}</span></div>
          <div className="report-signatures" dir="rtl">
            <div className="signature-box">
              <h5 className="signature-role">المعلم</h5>
              <p className="signature-row"><span className="signature-label">الاسم:</span> <span>{settings.teacher.trim() ? settings.teacher : "........"}</span></p>
              <p className="signature-row"><span className="signature-label">التاريخ:</span> <span className="signature-date-auto">{autoDate}</span></p>
              <p className="signature-row"><span className="signature-label">التوقيع:</span> <span className="signature-line" aria-hidden="true"></span></p>
            </div>
            <div className="signature-box">
              <h5 className="signature-role">المدير</h5>
              <p className="signature-row"><span className="signature-label">الاسم:</span> <span>{settings.principal.trim() ? settings.principal : "........"}</span></p>
              <p className="signature-row"><span className="signature-label">التاريخ:</span> <span className="signature-date-auto">{autoDate}</span></p>
              <p className="signature-row"><span className="signature-label">التوقيع:</span> <span className="signature-line" aria-hidden="true"></span></p>
            </div>
          </div>
          <p style={{fontSize:"10px",textAlign:"center",color:"var(--muted)",marginTop:"8px",lineHeight:"1.4"}}>© جميع الحقوق محفوظة - تم تصميم التطبيق من قبل مجدي العقيلي | للتواصل: <span dir="ltr">majdialoqaily@gmail.com</span> | <span dir="ltr">0770183434</span></p>
        </div>
      </section>}
    </main>
    <footer className="no-print mx-auto max-w-[1240px] px-6 pb-8 text-center" style={{borderTop:"1px solid var(--line)"}}>
      <p className="small mt-4">يُحفظ التحليل عند الضغط على «حفظ التحليل الحالي». إدخال العلامات بالنسخ واللصق فقط — لا يوجد رفع ملفات في هذه النسخة.</p>
      <p className="mt-4 text-sm font-black">© جميع الحقوق محفوظة</p>
      <p className="mt-1 text-sm font-bold">لا يحق لأي شخص أخذ الكود البرمجي أو التعديل عليه إلا بموافقة خطية من صاحب التطبيق.</p>
      <p className="mt-1 text-sm font-bold">تم تصميم التطبيق من قبل مجدي العقيلي</p>
      <p className="mt-1 text-sm font-bold">للتواصل: <span dir="ltr">majdialoqaily@gmail.com</span> | <span dir="ltr">0770183434</span></p>
    </footer>
  </div>
}
