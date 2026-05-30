import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  Upload, FileText, Presentation, Trash2, Plus, Search,
  Loader2, BookOpen, Filter, CheckCircle2, XCircle, Clock,
  AlertCircle, Eye, X, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, GraduationCap, BookMarked,
} from "lucide-react";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { lmsDocs, type LmsDocument } from "@/services/lmsApi";
import { useAuth } from "@/hooks/AuthProvider";

// ─── Constants ────────────────────────────────────────────────────────────────
const CLASSES  = ["SS1", "SS2", "SS3", "WAEC", "JAMB", "mbbs"];
const TERMS    = [
  { value: "1", label: "First Term"  },
  { value: "2", label: "Second Term" },
  { value: "3", label: "Third Term"  },
];
const SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry", "Biology"];
const PAGE_SIZES = [10, 20, 50];

const TERM_LABEL: Record<string, string> = {
  "1": "First Term", "2": "Second Term", "3": "Third Term",
};

const CLASS_COLOR: Record<string, string> = {
  SS1:  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  SS2:  "bg-[#3ecf8e]/15 text-[#3ecf8e]",
  SS3:  "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  WAEC: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  JAMB: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  mbbs: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
};

const APPROVAL_BADGE = (status?: string) => {
  if (status === "approved") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <CheckCircle2 className="h-2.5 w-2.5" />Approved
    </span>
  );
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
      <XCircle className="h-2.5 w-2.5" />Rejected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <Clock className="h-2.5 w-2.5" />Pending
    </span>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onPage, onPageSize }: {
  page: number; total: number; pageSize: number;
  onPage: (p: number) => void; onPageSize: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between pt-3 border-t border-border flex-wrap gap-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Rows:</span>
        <Select value={String(pageSize)} onValueChange={v => { onPageSize(Number(v)); onPage(1); }}>
          <SelectTrigger className="h-7 w-14 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{PAGE_SIZES.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
        </Select>
        <span>{start}–{end} of {total}</span>
      </div>
      <div className="flex items-center gap-1">
        {[
          { icon: <ChevronsLeft  className="h-3.5 w-3.5" />, action: () => onPage(1),              disabled: page === 1           },
          { icon: <ChevronLeft   className="h-3.5 w-3.5" />, action: () => onPage(page - 1),        disabled: page === 1           },
          { icon: <ChevronRight  className="h-3.5 w-3.5" />, action: () => onPage(page + 1),        disabled: page === totalPages  },
          { icon: <ChevronsRight className="h-3.5 w-3.5" />, action: () => onPage(totalPages),      disabled: page === totalPages  },
        ].map((b, i) => (
          <button key={i} onClick={b.action} disabled={b.disabled}
            className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors">
            {b.icon}
          </button>
        ))}
        <span className="px-2 text-xs font-semibold text-foreground">{page}/{totalPages}</span>
      </div>
    </div>
  );
}

// ─── Shared Table ─────────────────────────────────────────────────────────────
function DocTable({
  docs, loading, title, icon, headerColor, showStatus, showApprove,
  onDelete, onApprove, onEmpty, emptyTitle, emptyDesc,
}: {
  docs: LmsDocument[]; loading: boolean;
  title: string; icon: React.ReactNode; headerColor: string;
  showStatus?: boolean; showApprove?: boolean;
  onDelete?: (id: string) => void;
  onApprove?: (id: string, action: "approve" | "reject") => void;
  onEmpty?: () => void;
  emptyTitle?: string; emptyDesc?: string;
}) {
  const navigate   = useNavigate();
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { setPage(1); }, [docs.length]);

  const paginated = useMemo(() => {
    const s = (page - 1) * pageSize;
    return docs.slice(s, s + pageSize);
  }, [docs, page, pageSize]);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Table header bar */}
      <div className={`h-1 ${headerColor}`} />
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${headerColor}`}>
            {icon}
          </div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <span className="text-xs bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-full">
            {docs.length}
          </span>
        </div>
        {onEmpty && (
          <Button size="sm" onClick={onEmpty}
            className="h-7 text-xs bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">
            <Plus className="h-3 w-3 mr-1" />Upload
          </Button>
        )}
      </div>

      {loading ? (
        <div className="p-4 space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <BookOpen className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-bold text-foreground mb-1">{emptyTitle ?? "No documents"}</p>
          <p className="text-xs text-muted-foreground max-w-xs mb-4">{emptyDesc}</p>
          {onEmpty && (
            <Button size="sm" onClick={onEmpty}
              className="bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">
              <Plus className="h-3.5 w-3.5 mr-1.5" />Upload Now
            </Button>
          )}
        </div>
      ) : (
        <div className="p-4 space-y-3 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 pr-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Topic / Title</th>
                <th className="text-left pb-2 pr-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-20">Class</th>
                <th className="text-left pb-2 pr-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-28 hidden sm:table-cell">Term</th>
                <th className="text-left pb-2 pr-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Subject</th>
                {showStatus && (
                  <th className="text-left pb-2 pr-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Status</th>
                )}
                <th className="text-right pb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginated.map(doc => {
                const id = doc._id ?? (doc as any).id ?? "";
                const fileType = doc.fileType ?? "";
                return (
                  <tr key={id} className="hover:bg-muted/30 transition-colors group">
                    {/* Title */}
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          fileType === "pdf" ? "bg-red-100 dark:bg-red-950/30" : "bg-orange-100 dark:bg-orange-950/30"
                        }`}>
                          {fileType === "pdf"
                            ? <FileText className="h-3.5 w-3.5 text-red-500" />
                            : <Presentation className="h-3.5 w-3.5 text-orange-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate max-w-[150px] md:max-w-[220px] group-hover:text-[#3ecf8e] transition-colors text-xs">
                            {doc.title}
                          </p>
                          {/* Mobile: class + term inline */}
                          <div className="flex items-center gap-1 mt-0.5 sm:hidden flex-wrap">
                            {doc.className && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${CLASS_COLOR[doc.className] ?? "bg-muted text-muted-foreground"}`}>
                                {doc.className}
                              </span>
                            )}
                            {doc.term && <span className="text-[9px] text-muted-foreground">{TERM_LABEL[doc.term]}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-3 pr-3">
                      {doc.className
                        ? <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CLASS_COLOR[doc.className] ?? "bg-muted text-muted-foreground"}`}>{doc.className}</span>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </td>

                    {/* Term */}
                    <td className="py-3 pr-3 hidden sm:table-cell">
                      {doc.term
                        ? <span className="text-xs text-foreground font-medium">{TERM_LABEL[doc.term]}</span>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </td>

                    {/* Subject */}
                    <td className="py-3 pr-3 hidden md:table-cell">
                      {doc.subject
                        ? <span className="text-xs bg-muted text-muted-foreground font-medium px-2 py-0.5 rounded-full">{doc.subject}</span>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </td>

                    {/* Status */}
                    {showStatus && (
                      <td className="py-3 pr-3 hidden sm:table-cell">
                        {APPROVAL_BADGE(doc.approvalStatus)}
                      </td>
                    )}

                    {/* Actions */}
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => navigate(`/lms/study/${id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e] hover:bg-[#3ecf8e]/20 border border-[#3ecf8e]/20 transition-colors text-[10px] font-bold">
                          <Eye className="h-3 w-3" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        {showApprove && doc.approvalStatus === "pending" && onApprove && (
                          <>
                            <button onClick={() => onApprove(id, "approve")}
                              className="w-7 h-7 rounded-lg border border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center justify-center transition-colors" title="Approve">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => onApprove(id, "reject")}
                              className="w-7 h-7 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors" title="Reject">
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(id)}
                            className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:border-red-400 hover:text-red-500 flex items-center justify-center transition-colors" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} total={docs.length} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />
        </div>
      )}
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ open, onClose, onSuccess, defaultClass, defaultTerm, role }: {
  open: boolean; onClose: () => void; onSuccess: (doc: LmsDocument) => void;
  defaultClass?: string; defaultTerm?: string; role?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file,     setFile]     = useState<File | null>(null);
  const [title,    setTitle]    = useState("");
  const [cls,      setCls]      = useState(defaultClass || "");
  const [term,     setTerm]     = useState(defaultTerm  || "");
  const [subject,  setSubject]  = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading,setUploading]= useState(false);

  const reset = () => { setFile(null); setTitle(""); setCls(defaultClass||""); setTerm(defaultTerm||""); setSubject(""); };

  const accept = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["pdf","ppt","pptx","doc","docx"].includes(ext)) {
      toast.error("Only PDF, PPT, PPTX, DOC, DOCX files allowed"); return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleSubmit = async () => {
    if (!file)  { toast.error("Please select a file"); return; }
    if (!title.trim()) { toast.error("Please enter a title"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file",  file);
      fd.append("title", title.trim());
      if (cls)     fd.append("className", cls);
      if (term)    fd.append("term",      term);
      if (subject) fd.append("subject",   subject);
      const { document } = await lmsDocs.upload(fd);
      toast.success(role === "student" ? "Note uploaded! Awaiting teacher approval." : "Material uploaded!");
      onSuccess(document);
      reset(); onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-bold">
            {role === "student" ? "Upload Study Note" : "Upload Teaching Material"}
          </DialogTitle>
        </DialogHeader>

        {role === "student" && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            Student uploads require teacher/admin approval before appearing in the shared library.
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragging ? "border-[#3ecf8e] bg-[#3ecf8e]/5" :
            file ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20" :
            "border-border hover:border-[#3ecf8e]/50"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) accept(f); }}
        >
          <input ref={inputRef} type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" className="hidden"
            onChange={e => e.target.files?.[0] && accept(e.target.files[0])} />
          {file ? (
            <div className="space-y-1">
              <FileText className="h-7 w-7 text-emerald-500 mx-auto" />
              <p className="font-semibold text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size/1024/1024).toFixed(2)} MB</p>
              <button className="text-xs text-muted-foreground underline"
                onClick={e => { e.stopPropagation(); setFile(null); setTitle(""); }}>Change</button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-7 w-7 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">Drop file or click to browse</p>
              <p className="text-xs text-muted-foreground">PDF, PPT, PPTX, DOC, DOCX · Max 25 MB</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title / Topic</label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Newton's Laws of Motion" className="mt-1" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Class</label>
              <Select value={cls} onValueChange={setCls}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c === "mbbs" ? "MBBS (Medical)" : c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Term</label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Term" /></SelectTrigger>
                <SelectContent>{TERMS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }} disabled={uploading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={uploading || !file}
            className="bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold">
            {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading…</> : <><Upload className="h-4 w-4 mr-2" />Upload</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudyHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const role = user?.role ?? "student";
  const isTeacherOrAdmin = role === "teacher" || role === "admin";

  const [myDocs,     setMyDocs]     = useState<LmsDocument[]>([]);
  const [sharedDocs, setSharedDocs] = useState<LmsDocument[]>([]);
  const [pendingDocs,setPendingDocs]= useState<LmsDocument[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const [search,      setSearch]      = useState(searchParams.get("q")     ?? "");
  const mbbsDefault = user?.role === "mbbs" ? "mbbs" : "";
  const [filterClass, setFilterClass] = useState(searchParams.get("class") ?? mbbsDefault);
  const [filterTerm,  setFilterTerm]  = useState(searchParams.get("term")  ?? "");

  const openUpload = searchParams.get("upload") === "true";
  useEffect(() => {
    if (openUpload) {
      setUploadOpen(true);
      searchParams.delete("upload");
      setSearchParams(searchParams, { replace: true });
    }
  }, [openUpload]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (search)      p.set("q",     search);
    if (filterClass) p.set("class", filterClass);
    if (filterTerm)  p.set("term",  filterTerm);
    setSearchParams(p, { replace: true });
  }, [search, filterClass, filterTerm]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const classTermParams = {
        class: filterClass || undefined,
        term:  filterTerm  || undefined,
      };
      const fetches: Promise<any>[] = [
        lmsDocs.list(classTermParams),
        lmsDocs.listShared(classTermParams),
      ];
      if (isTeacherOrAdmin) fetches.push(lmsDocs.listPending());

      const results = await Promise.all(fetches);
      const my     = results[0].documents ?? [];
      const shared = results[1].documents ?? [];

      setMyDocs(my);
      // Show ALL public approved docs in Teacher Materials table — do not exclude own
      setSharedDocs(shared);

      if (isTeacherOrAdmin && results[2]) {
        setPendingDocs(results[2].documents ?? []);
      }
    } catch (err) {
      console.error("fetchAll error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [filterClass, filterTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      await lmsDocs.delete(id);
      setMyDocs(d => d.filter(doc => (doc._id ?? (doc as any).id) !== id));
      toast.success("Document deleted");
    } catch (err: any) { toast.error(err.message ?? "Delete failed"); }
  };

  const handleApprove = async (id: string, action: "approve" | "reject") => {
    try {
      await lmsDocs.approve(id, action);
      setPendingDocs(d => d.filter(doc => (doc._id ?? (doc as any).id) !== id));
      toast.success(action === "approve" ? "Material approved!" : "Rejected.");
      if (action === "approve") fetchAll();
    } catch (err: any) { toast.error(err.message ?? "Failed"); }
  };

  const applyFilters = (docs: LmsDocument[]) =>
    docs.filter(d => {
      const q = search.trim().toLowerCase();
      return (
        (!q            || d.title.toLowerCase().includes(q) || (d.subject ?? "").toLowerCase().includes(q)) &&
        (!filterClass  || d.className === filterClass) &&
        (!filterTerm   || d.term      === filterTerm)
      );
    });

  const filteredMy      = applyFilters(myDocs);
  const filteredShared  = applyFilters(sharedDocs);
  const filteredPending = applyFilters(pendingDocs);
  const hasFilters = search || filterClass || filterTerm;

  return (
    <div className="flex-1 p-4 md:p-6 page-fade space-y-5">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {role === "student" ? "Study Notes" : "Study Materials"}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {role === "student"
              ? "Your uploads and teacher-published materials"
              : "Manage and publish study materials"}
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}
          className="bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />Upload
        </Button>
      </div>

      {/* ── Search + Filters ───────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or subject…" className="pl-9 h-10" />
          </div>
          {/* Class filter — mbbs users are locked to mbbs, others can freely pick */}
          {user?.role === "mbbs" ? (
            <div className="h-10 px-3 flex items-center rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-sm font-semibold shrink-0 gap-2">
              <span className="text-xs">🏥</span> MBBS Materials
            </div>
          ) : (
            <Select value={filterClass || "all"} onValueChange={v => setFilterClass(v === "all" ? "" : v)}>
              <SelectTrigger className="h-10 w-full sm:w-36">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {CLASSES.map(c => <SelectItem key={c} value={c}>{c === "mbbs" ? "MBBS (Medical)" : c}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Select value={filterTerm || "all"} onValueChange={v => setFilterTerm(v === "all" ? "" : v)}>
            <SelectTrigger className="h-10 w-full sm:w-40">
              <SelectValue placeholder="All Terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              {TERMS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" onClick={() => { setSearch(""); setFilterClass(""); setFilterTerm(""); }}
              className="h-10 px-3 text-muted-foreground hover:text-foreground shrink-0">
              <X className="h-4 w-4 mr-1" />Clear
            </Button>
          )}
        </div>
        {hasFilters && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Filter className="h-3 w-3 text-muted-foreground" />
            {search && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                "{search}" <button onClick={() => setSearch("")}><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            {filterClass && (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${CLASS_COLOR[filterClass] ?? "bg-muted text-muted-foreground"}`}>
                {filterClass} <button onClick={() => setFilterClass("")}><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            {filterTerm && (
              <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-full">
                {TERM_LABEL[filterTerm]} <button onClick={() => setFilterTerm("")}><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Pending banner ─────────────────────────────────── */}
      {isTeacherOrAdmin && pendingDocs.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <Clock className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex-1">
            {pendingDocs.length} submission{pendingDocs.length > 1 ? "s" : ""} awaiting review
          </p>
        </div>
      )}

      {/* ── Table 1: Teacher / Shared Materials ────────────── */}
      <DocTable
        docs={filteredShared}
        loading={loading}
        title={role === "student" ? "Teacher Materials" : "Published Materials"}
        icon={<GraduationCap className="h-3.5 w-3.5 text-white" />}
        headerColor="gradient-navy"
        emptyTitle={role === "student" ? "No teacher materials yet" : "No published materials"}
        emptyDesc={role === "student"
          ? "Your teachers haven't uploaded any approved materials yet. Check back soon."
          : "Materials you upload are automatically published here for students."}
      />

      {/* ── Table 2: My Uploads ────────────────────────────── */}
      <DocTable
        docs={filteredMy}
        loading={loading}
        title="My Uploads"
        icon={<Upload className="h-3.5 w-3.5 text-black" />}
        headerColor="bg-gradient-to-r from-[#3ecf8e] to-[#059669]"
        showStatus={role === "student"}
        onDelete={handleDelete}
        onEmpty={() => setUploadOpen(true)}
        emptyTitle="No uploads yet"
        emptyDesc={role === "student"
          ? "Upload your study notes to get AI tools and share with teachers."
          : "Upload teaching materials for your students."}
      />

      {/* ── Table 3: Pending Approvals (teacher/admin only) ── */}
      {isTeacherOrAdmin && (
        <DocTable
          docs={filteredPending}
          loading={loading}
          title="Pending Student Submissions"
          icon={<Clock className="h-3.5 w-3.5 text-white" />}
          headerColor="gradient-orange"
          showStatus
          showApprove
          onApprove={handleApprove}
          emptyTitle="No pending submissions"
          emptyDesc="All student notes have been reviewed."
        />
      )}

      <UploadModal
        open={uploadOpen} onClose={() => setUploadOpen(false)}
        onSuccess={doc => { setMyDocs(d => [doc, ...d]); fetchAll(); }}
        defaultClass={filterClass} defaultTerm={filterTerm} role={role}
      />
    </div>
  );
}
