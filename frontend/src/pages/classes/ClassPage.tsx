/**
 * ClassPage — used for SS1, SS2, SS3, WAEC, JAMB
 * Route: /classes/:className  e.g. /classes/SS1
 *
 * Shows all approved materials for the class in a table with
 * search, term filter, and pagination.
 */
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  BookOpen, FileText, Presentation, Eye, Search,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Upload, X, Clock, Atom, FlaskConical, Dna, Sigma,
  GraduationCap, Target, Award, Brain,
} from "lucide-react";
import { Input }  from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { lmsDocs, type LmsDocument } from "@/services/lmsApi";
import { useAuth } from "@/hooks/AuthProvider";

// ─── Constants ────────────────────────────────────────────────────────────────
const TERMS = [
  { value: "1", label: "First Term"  },
  { value: "2", label: "Second Term" },
  { value: "3", label: "Third Term"  },
];
const TERM_LABEL: Record<string, string> = {
  "1": "First Term", "2": "Second Term", "3": "Third Term",
};
const PAGE_SIZES = [10, 20, 50];

const CLASS_META: Record<string, {
  color: string; badgeBg: string; badgeText: string;
  icon: React.ReactNode; tagline: string; desc: string;
}> = {
  SS1: {
    color:     "#6366f1",
    badgeBg:   "bg-indigo-100 dark:bg-indigo-950/40",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    icon:      <BookOpen className="w-7 h-7" style={{ color: "#6366f1" }} />,
    tagline:   "Year 1 · Senior Secondary",
    desc:      "Foundation materials for SS1 — covering all core subjects for your first year of Senior Secondary School.",
  },
  SS2: {
    color:     "#3ecf8e",
    badgeBg:   "bg-[#3ecf8e]/10",
    badgeText: "text-[#3ecf8e]",
    icon:      <BookOpen className="w-7 h-7 text-[#3ecf8e]" />,
    tagline:   "Year 2 · Senior Secondary",
    desc:      "Build on your SS1 foundation. Deep dives into Physics, Chemistry, Biology, Mathematics and English.",
  },
  SS3: {
    color:     "#8b5cf6",
    badgeBg:   "bg-purple-100 dark:bg-purple-950/40",
    badgeText: "text-purple-700 dark:text-purple-300",
    icon:      <GraduationCap className="w-7 h-7" style={{ color: "#8b5cf6" }} />,
    tagline:   "Final Year · Senior Secondary",
    desc:      "Your most critical year. Master every topic with intensive revision, past questions and mock exams.",
  },
  WAEC: {
    color:     "#f59e0b",
    badgeBg:   "bg-amber-100 dark:bg-amber-950/30",
    badgeText: "text-amber-700 dark:text-amber-300",
    icon:      <Award className="w-7 h-7" style={{ color: "#f59e0b" }} />,
    tagline:   "WAEC / SSCE Exam Prep",
    desc:      "Practice thousands of past WAEC questions, generate topic flashcards and get AI explanations for tricky answers.",
  },
  JAMB: {
    color:     "#ef4444",
    badgeBg:   "bg-red-100 dark:bg-red-950/30",
    badgeText: "text-red-600 dark:text-red-400",
    icon:      <Target className="w-7 h-7" style={{ color: "#ef4444" }} />,
    tagline:   "JAMB / UTME Prep",
    desc:      "Score 300+ in UTME. AI-generated JAMB-style questions on demand, weak-area analysis, and personalised study plans.",
  },
};

const SUBJECTS = [
  { name: "Mathematics", icon: <Sigma className="h-3.5 w-3.5" />,        color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40"    },
  { name: "English",     icon: <BookOpen className="h-3.5 w-3.5" />,     color: "text-green-600 bg-green-50 dark:bg-green-950/40" },
  { name: "Physics",     icon: <Atom className="h-3.5 w-3.5" />,         color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40" },
  { name: "Chemistry",   icon: <FlaskConical className="h-3.5 w-3.5" />, color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40" },
  { name: "Biology",     icon: <Dna className="h-3.5 w-3.5" />,          color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40"   },
];

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
  page, total, pageSize, onPage, onPageSize,
}: { page: number; total: number; pageSize: number; onPage: (p: number) => void; onPageSize: (n: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border flex-wrap gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page:</span>
        <Select value={String(pageSize)} onValueChange={v => { onPageSize(Number(v)); onPage(1); }}>
          <SelectTrigger className="h-8 w-16 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{PAGE_SIZES.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
        </Select>
        <span className="ml-2">{start}–{end} of {total}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(1)}            disabled={page === 1}           className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"><ChevronsLeft  className="h-4 w-4" /></button>
        <button onClick={() => onPage(page - 1)}      disabled={page === 1}           className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"><ChevronLeft   className="h-4 w-4" /></button>
        <span className="px-3 text-sm font-semibold text-foreground">Page {page} of {totalPages}</span>
        <button onClick={() => onPage(page + 1)}      disabled={page === totalPages}  className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"><ChevronRight  className="h-4 w-4" /></button>
        <button onClick={() => onPage(totalPages)}    disabled={page === totalPages}  className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"><ChevronsRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClassPage() {
  const { className: paramClass } = useParams<{ className: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user }  = useAuth();

  // Derive class from URL path e.g. /classes/WAEC → "WAEC"
  // Works for both static routes (/classes/WAEC) and dynamic (:className)
  const derived = paramClass
    ?? location.pathname.split("/").filter(Boolean).pop()?.toUpperCase()
    ?? "";

  const cls = derived.toUpperCase() as keyof typeof CLASS_META;
  const meta = CLASS_META[cls];

  const [docs,    setDocs]    = useState<LmsDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [term,    setTerm]    = useState("");
  const [subject, setSubject] = useState("");
  const [page,    setPage]    = useState(1);
  const [pageSize,setPageSize]= useState(10);

  useEffect(() => {
    setLoading(true);
    lmsDocs.listShared({ className: cls })
      .then(r => setDocs(r.documents ?? []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [cls]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, term, subject]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter(d => {
      const matchQ = !q || d.title.toLowerCase().includes(q) || (d.subject ?? "").toLowerCase().includes(q);
      const matchT = !term    || d.term    === term;
      const matchS = !subject || d.subject === subject;
      return matchQ && matchT && matchS;
    });
  }, [docs, search, term, subject]);

  const paginated = useMemo(() => {
    const s = (page - 1) * pageSize;
    return filtered.slice(s, s + pageSize);
  }, [filtered, page, pageSize]);

  if (!meta) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Class not found</h2>
          <p className="text-muted-foreground mb-4">"{className}" is not a valid class.</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const hasFilters = search || term || subject;

  return (
    <div className="flex-1 page-fade">

      {/* ── Hero banner ──────────────────────────────────────── */}
      <div className="relative overflow-hidden gradient-hero px-6 pt-10 pb-8">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* Glow blob */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-[80px] opacity-20"
          style={{ background: meta.color }} />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)}
              className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />Back
            </button>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl shrink-0"
              style={{ background: meta.color + "22", border: `1px solid ${meta.color}44` }}>
              {meta.icon}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-extrabold text-white">{cls}</h1>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.badgeBg} ${meta.badgeText}`}>
                  {meta.tagline}
                </span>
              </div>
              <p className="text-white/70 text-sm max-w-xl leading-relaxed">{meta.desc}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-6 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="font-bold text-white">{docs.length}</span> materials
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />3 terms covered
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="h-4 w-4" />AI-powered tools
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="p-6 space-y-6">

        {/* Subjects quick filter strip */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide mr-1">Filter:</span>
          <button
            onClick={() => setSubject("")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              !subject ? "bg-[#3ecf8e] text-black border-[#3ecf8e]" : "border-border text-muted-foreground hover:border-[#3ecf8e]/40 hover:text-foreground"
            }`}
          >All Subjects</button>
          {SUBJECTS.map(s => (
            <button
              key={s.name}
              onClick={() => setSubject(s.name === subject ? "" : s.name)}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                subject === s.name ? `${s.color} border-transparent` : "border-border text-muted-foreground hover:border-[#3ecf8e]/40 hover:text-foreground"
              }`}
            >
              {s.icon}{s.name}
            </button>
          ))}
        </div>

        {/* Search + Term filter */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${cls} materials…`}
                className="pl-9 h-10"
              />
            </div>
            <Select value={term || "all"} onValueChange={v => setTerm(v === "all" ? "" : v)}>
              <SelectTrigger className="h-10 w-full sm:w-40">
                <SelectValue placeholder="All Terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {TERMS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" onClick={() => { setSearch(""); setTerm(""); setSubject(""); }}
                className="h-10 px-3 text-muted-foreground hover:text-foreground shrink-0">
                <X className="h-4 w-4 mr-1" />Clear
              </Button>
            )}
          </div>
          {hasFilters && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing <span className="font-bold text-foreground">{filtered.length}</span> of {docs.length} materials
            </p>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: meta.color + "15" }}>
              <BookOpen className="h-7 w-7" style={{ color: meta.color }} />
            </div>
            <h3 className="font-bold text-lg mb-1 text-foreground">
              {hasFilters ? "No results found" : `No ${cls} materials yet`}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              {hasFilters
                ? "Try a different search term, class or term filter."
                : "Teachers haven't uploaded any materials for this class yet. Check back soon."}
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={() => { setSearch(""); setTerm(""); setSubject(""); }}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Topic / Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Term</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Subject</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Uploaded</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map(doc => {
                    const id = doc._id ?? doc.id ?? "";
                    return (
                      <tr key={id} className="hover:bg-muted/30 transition-colors group">
                        {/* Title */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            {doc.fileType === "pdf"
                              ? <FileText className="h-4 w-4 text-red-500 shrink-0" />
                              : <Presentation className="h-4 w-4 text-orange-500 shrink-0" />}
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate max-w-[180px] md:max-w-xs group-hover:text-[#3ecf8e] transition-colors">
                                {doc.title}
                              </p>
                              {/* Mobile: term inline */}
                              <p className="text-[10px] text-muted-foreground mt-0.5 md:hidden">
                                {doc.term ? TERM_LABEL[doc.term] : ""}{doc.subject ? ` · ${doc.subject}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Term */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          {doc.term
                            ? <span className="text-xs text-foreground font-medium">{TERM_LABEL[doc.term]}</span>
                            : <span className="text-muted-foreground text-xs">—</span>}
                        </td>

                        {/* Subject */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          {doc.subject ? (
                            <span className="text-xs bg-accent/10 text-accent font-medium px-2 py-0.5 rounded-full">
                              {doc.subject}
                            </span>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/lms/study/${id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                              style={{
                                background: meta.color + "15",
                                color:      meta.color,
                                border:     `1px solid ${meta.color}30`,
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">View Material</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page} total={filtered.length} pageSize={pageSize}
              onPage={setPage} onPageSize={setPageSize}
            />
          </div>
        )}

        {/* Upload CTA (teachers/admins only) */}
        {(user?.role === "teacher" || user?.role === "admin") && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border bg-muted/30">
            <div>
              <p className="text-sm font-semibold text-foreground">Add materials for {cls}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Upload notes, slides or past papers</p>
            </div>
            <Button onClick={() => navigate(`/lms/study?upload=true&class=${cls}`)}
              className="bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">
              <Upload className="h-4 w-4 mr-2" />Upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
