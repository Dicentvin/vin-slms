/**
 * StudyDocument — Full document viewer + all 5 AI tabs
 * Premium navy/orange design
 */
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate }      from "react-router";
import { toast }  from "sonner";
import {
  ArrowLeft, FileText, Presentation, MessageSquare, Sparkles,
  BookOpen, Zap, Lightbulb, Loader2, ChevronLeft, ChevronRight,
  RotateCcw, Star, CheckCircle2, Send, Trash2, RefreshCw,
  XCircle, CheckCircle, Trophy, Download, ExternalLink, GraduationCap,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Badge }    from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input }    from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  lmsDocs, lmsAI,
  type LmsDocument, type Flashcard, type QuizQuestion, type ChatMessage,
} from "@/services/lmsApi";
import { useAuth } from "@/hooks/AuthProvider";

// ─── Document Viewer ─────────────────────────────────────────────────────────
function DocumentViewer({ doc }: { doc: LmsDocument }) {
  const [loading, setLoading] = useState(true);
  const isPdf = doc.fileType === "pdf";

  return (
    <div className="flex flex-col h-full bg-muted/30 rounded-xl border border-border overflow-hidden">
      {/* Viewer toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          {isPdf
            ? <FileText className="h-4 w-4 text-red-500"/>
            : <Presentation className="h-4 w-4 text-orange-500"/>}
          <span className="text-sm font-semibold truncate max-w-[200px]">{doc.title}</span>
          {doc.pages > 0 && <Badge variant="outline" className="text-xs">{doc.pages} pages</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
              <ExternalLink className="h-3.5 w-3.5"/> Open
            </Button>
          </a>
          <a href={doc.fileUrl} download={doc.title}>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
              <Download className="h-3.5 w-3.5"/> Download
            </Button>
          </a>
        </div>
      </div>

      {/* Iframe viewer */}
      <div className="flex-1 relative min-h-0">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/50 z-10">
            <Loader2 className="h-7 w-7 animate-spin text-orange"/>
            <p className="text-sm text-muted-foreground">Loading document…</p>
          </div>
        )}
        {isPdf ? (
          <iframe
            src={`${doc.fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            title={doc.title}
          />
        ) : (
          // For PPT/PPTX use Google Docs viewer
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(doc.fileUrl)}&embedded=true`}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            title={doc.title}
          />
        )}
      </div>
    </div>
  );
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────
function ChatTab({ docId, docTitle }: { docId: string; docTitle: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const bottomRef               = useRef<HTMLDivElement>(null);

  const STARTERS = [
    "What is this document about?",
    "Summarise the key points",
    "What are the main concepts?",
    "Give me 3 important facts",
  ];

  useEffect(() => {
    lmsAI.getChatHistory(docId)
      .then(({ messages: m }) => setMessages(m ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [docId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async (q = input.trim()) => {
    if (!q || sending) return;
    setInput("");
    setMessages(m => [...m, { role: "user", content: q }]);
    setSending(true);
    try {
      const { answer } = await lmsAI.chat(docId, q);
      setMessages(m => [...m, { role: "assistant", content: answer }]);
    } catch (err: any) {
      toast.error(err.message ?? "Chat failed");
      setMessages(m => m.slice(0, -1));
    } finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-2">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-orange"/></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10 gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-navy flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white"/>
            </div>
            <div>
              <p className="font-bold text-sm">Chat with your document</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Ask anything about <span className="font-semibold">"{docTitle}"</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-xs border-2 border-border hover:border-orange rounded-xl px-3 py-2.5 transition-all hover:bg-orange/5 font-medium">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4 pt-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${m.role === "user" ? "gradient-orange text-white" : "gradient-navy text-white"}`}>
                  {m.role === "user" ? "You" : "AI"}
                </div>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                  ${m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full gradient-navy flex items-center justify-center text-xs text-white font-bold shrink-0">AI</div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-orange rounded-full animate-bounce"
                      style={{ animationDelay: `${i*0.15}s` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
        )}
      </ScrollArea>

      <div className="mt-3 pt-3 border-t border-border space-y-2">
        {messages.length > 0 && (
          <div className="flex justify-end">
            <button onClick={async () => { await lmsAI.clearChat(docId).catch(()=>{}); setMessages([]); }}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
              <Trash2 className="h-3 w-3"/> Clear history
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={`Ask about "${docTitle}"…`} disabled={sending}/>
          <Button size="icon" onClick={() => send()} disabled={sending || !input.trim()}
            className="btn-orange shrink-0">
            <Send className="h-4 w-4"/>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────
function SummaryTab({ docId }: { docId: string }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { summary: s } = await lmsAI.getSummary(docId);
      setSummary(s); setDone(true);
    } catch (err: any) { toast.error(err.message ?? "Summary failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">AI Summary</h3>
        <Button size="sm" variant="outline"
          onClick={() => { setDone(false); generate(); }} disabled={loading}
          className="h-8 text-xs border-orange/50 text-orange hover:bg-orange/5">
          {loading
            ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin"/>Generating…</>
            : done
              ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5"/>Regenerate</>
              : <><Sparkles className="h-3.5 w-3.5 mr-1.5"/>Generate Summary</>}
        </Button>
      </div>

      {!done && !loading && (
        <div className="flex flex-col items-center py-12 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl gradient-navy flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white"/>
          </div>
          <p className="font-semibold text-sm">Generate a smart summary</p>
          <p className="text-xs text-muted-foreground max-w-xs">AI reads your document and produces a clear, structured summary of the key points.</p>
          <Button size="sm" onClick={generate} className="btn-orange">
            <Sparkles className="h-3.5 w-3.5 mr-1.5"/>Generate now
          </Button>
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-3 py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-orange"/>
          <span className="text-sm">Reading and summarising…</span>
        </div>
      )}
      {done && summary && (
        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{summary}</p>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── Flashcards Tab ───────────────────────────────────────────────────────────
function FlashcardsTab({ docId }: { docId: string }) {
  const [cards, setCards]           = useState<Flashcard[]>([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [idx, setIdx]               = useState(0);
  const [flipped, setFlipped]       = useState(false);
  const [view, setView]             = useState<"flip"|"grid">("flip");

  useEffect(() => {
    lmsAI.getFlashcards(docId)
      .then(({ flashcards }) => setCards(flashcards ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [docId]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { flashcards } = await lmsAI.generateFlashcards(docId, 20);
      setCards(flashcards); setIdx(0); setFlipped(false);
      toast.success(`${flashcards.length} flashcards generated!`);
    } catch (err: any) { toast.error(err.message ?? "Generation failed"); }
    finally { setGenerating(false); }
  };

  const toggle = async (card: Flashcard, field: "starred"|"reviewed") => {
    try {
      const { flashcard } = await lmsAI.updateFlashcard(card._id, { [field]: !card[field] });
      setCards(cs => cs.map(c => c._id === card._id ? flashcard : c));
    } catch { toast.error("Update failed"); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-orange"/></div>;

  const card = cards[idx];
  const pct  = cards.length ? Math.round(((idx+1)/cards.length)*100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Flashcards</h3>
          {cards.length > 0 && (
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              {(["flip","grid"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 capitalize font-semibold transition-colors
                    ${view===v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={generate} disabled={generating}
          className="h-8 text-xs border-orange/50 text-orange hover:bg-orange/5">
          {generating
            ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin"/>Generating…</>
            : <><RefreshCw className="h-3.5 w-3.5 mr-1.5"/>{cards.length ? "Regenerate":"Generate"}</>}
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl gradient-navy flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white"/>
          </div>
          <p className="font-semibold text-sm">No flashcards yet</p>
          <Button size="sm" onClick={generate} disabled={generating} className="btn-orange">
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Zap className="h-4 w-4 mr-2"/>}
            Generate Flashcards
          </Button>
        </div>
      ) : view === "flip" ? (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-semibold">{idx+1} / {cards.length}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-orange rounded-full transition-all duration-300" style={{ width:`${pct}%` }}/>
            </div>
            <span>{pct}%</span>
          </div>

          {/* Card */}
          <div onClick={() => setFlipped(!flipped)}
            className={`min-h-[170px] rounded-2xl border-2 p-7 flex flex-col items-center
              justify-center text-center cursor-pointer transition-all select-none
              ${flipped ? "gradient-navy border-primary text-white" : "bg-card border-border hover:border-orange/60 hover:shadow-orange"}`}>
            <Badge variant={flipped?"secondary":"outline"}
              className={`mb-3 text-xs font-bold ${flipped ? "bg-white/20 text-white border-white/30" : ""}`}>
              {flipped ? "Answer" : "Question"}
            </Badge>
            <p className="text-base font-bold leading-snug">
              {flipped ? card.answer : card.question}
            </p>
            {!flipped && <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1"><RotateCcw className="h-3 w-3"/> Click to reveal</p>}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm"
              onClick={() => { setIdx(i => Math.max(i-1,0)); setFlipped(false); }} disabled={idx===0}>
              <ChevronLeft className="h-4 w-4"/>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9"
                style={card.starred ? { borderColor:"hsl(var(--orange))", color:"hsl(var(--orange))", background:"hsl(var(--orange)/.08)" } : {}}
                onClick={() => toggle(card,"starred")}>
                <Star className="h-4 w-4" fill={card.starred?"currentColor":"none"}/>
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9"
                style={card.reviewed ? { borderColor:"#16a34a", color:"#16a34a", background:"#16a34a10" } : {}}
                onClick={() => toggle(card,"reviewed")}>
                <CheckCircle2 className="h-4 w-4"/>
              </Button>
            </div>
            <Button variant="outline" size="sm"
              onClick={() => { if(idx<cards.length-1){setIdx(idx+1);setFlipped(false);}else{setIdx(0);setFlipped(false);} }}>
              {idx===cards.length-1 ? <RotateCcw className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
            </Button>
          </div>
          <div className="flex justify-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-orange"/> {cards.filter(c=>c.starred).length} starred
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500"/> {cards.filter(c=>c.reviewed).length} reviewed
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cards.map((c,i) => (
            <Card key={c._id}
              className={`cursor-pointer card-hover border ${c.reviewed?"border-green-300 dark:border-green-800":""}`}
              onClick={() => { setIdx(i); setView("flip"); setFlipped(false); }}>
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-mono">#{i+1}</span>
                  <div className="flex gap-1">
                    {c.starred  && <Star className="h-3 w-3 text-orange" fill="currentColor"/>}
                    {c.reviewed && <CheckCircle2 className="h-3 w-3 text-green-500"/>}
                  </div>
                </div>
                <p className="text-xs font-semibold line-clamp-2 mb-2">{c.question}</p>
                <div className="h-px bg-border my-2"/>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quiz Tab ─────────────────────────────────────────────────────────────────
function QuizTab({ docId }: { docId: string }) {
  const [questions, setQuestions]   = useState<QuizQuestion[]>([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [current, setCurrent]       = useState(0);
  const [chosen, setChosen]         = useState<number|null>(null);
  const [answers, setAnswers]       = useState<{ correct:boolean }[]>([]);
  const [done, setDone]             = useState(false);

  useEffect(() => {
    lmsAI.getQuizzes(docId)
      .then(({ quizzes }) => { if (quizzes?.[0]?.questions) setQuestions(quizzes[0].questions); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [docId]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { quiz } = await lmsAI.generateQuiz(docId, 10);
      setQuestions(quiz.questions); reset();
      toast.success("Quiz generated!");
    } catch (err: any) { toast.error(err.message ?? "Generation failed"); }
    finally { setGenerating(false); }
  };

  const reset = () => { setCurrent(0); setChosen(null); setAnswers([]); setDone(false); };

  const next = () => {
    if (chosen === null) return;
    const isCorrect = questions[current].options[chosen] === questions[current].correctAnswer;
    const na = [...answers, { correct: isCorrect }];
    setAnswers(na);
    if (current+1 >= questions.length) setDone(true);
    else { setCurrent(current+1); setChosen(null); }
  };

  const score = answers.filter(a => a.correct).length;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-orange"/></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Quiz</h3>
        <Button size="sm" variant="outline" onClick={generate} disabled={generating}
          className="h-8 text-xs border-orange/50 text-orange hover:bg-orange/5">
          {generating
            ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin"/>Generating…</>
            : <><RefreshCw className="h-3.5 w-3.5 mr-1.5"/>{questions.length?"New Quiz":"Generate Quiz"}</>}
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl gradient-navy flex items-center justify-center">
            <Zap className="h-6 w-6 text-white"/>
          </div>
          <p className="font-semibold text-sm">No quiz yet</p>
          <Button size="sm" onClick={generate} disabled={generating} className="btn-orange">
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Zap className="h-4 w-4 mr-2"/>}
            Generate Quiz
          </Button>
        </div>
      ) : done ? (
        <Card className="text-center border-2 border-orange/30">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 rounded-full gradient-orange flex items-center justify-center mx-auto">
              <Trophy className="h-8 w-8 text-white"/>
            </div>
            <p className="text-4xl font-black text-orange">
              {score}<span className="text-2xl text-muted-foreground font-normal">/{questions.length}</span>
            </p>
            <p className="text-muted-foreground text-sm font-medium">
              {score===questions.length?"Perfect! 🎉":score>=questions.length*0.7?"Great job! 👏":"Keep studying! 📚"}
            </p>
            <div className="h-2.5 bg-muted rounded-full max-w-[200px] mx-auto overflow-hidden">
              <div className="h-full bg-orange rounded-full transition-all"
                style={{ width:`${(score/questions.length)*100}%` }}/>
            </div>
            <p className="text-xs text-muted-foreground font-semibold">{Math.round((score/questions.length)*100)}%</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="h-4 w-4 mr-2"/>Try Again
              </Button>
              <Button size="sm" onClick={generate} disabled={generating} className="btn-orange">
                <RefreshCw className="h-4 w-4 mr-2"/>New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-bold">{current+1}/{questions.length}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-orange rounded-full transition-all"
                style={{ width:`${((current+1)/questions.length)*100}%` }}/>
            </div>
          </div>
          <div className="bg-card rounded-xl border-2 border-border p-4">
            <p className="font-bold text-sm leading-snug">{questions[current].questionText}</p>
          </div>
          <div className="space-y-2">
            {questions[current].options.map((opt,i) => {
              const isChosen  = chosen===i;
              const isCorrect = opt===questions[current].correctAnswer;
              const show      = chosen!==null;
              let cls = "border-border hover:border-orange/60 hover:bg-orange/5";
              if (show) {
                if (isCorrect)    cls = "border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300";
                else if (isChosen) cls = "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300";
                else               cls = "border-border opacity-50";
              } else if (isChosen) cls = "border-orange bg-orange/5";

              return (
                <button key={i} onClick={() => { if(chosen===null) setChosen(i); }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all ${cls} ${chosen!==null?"cursor-default":"cursor-pointer"}`}>
                  <span className="w-7 h-7 rounded-lg border-2 border-current flex items-center justify-center text-xs font-black shrink-0">
                    {["A","B","C","D"][i]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {show && isCorrect  && <CheckCircle className="h-4 w-4 shrink-0 text-green-500"/>}
                  {show && isChosen && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-red-500"/>}
                </button>
              );
            })}
          </div>
          {chosen!==null && questions[current].explanation && (
            <div className="p-3.5 rounded-xl bg-primary/5 border-2 border-primary/20">
              <p className="text-xs font-black text-primary uppercase tracking-wide mb-1">Explanation</p>
              <p className="text-sm">{questions[current].explanation}</p>
            </div>
          )}
          <Button className="w-full btn-orange" onClick={next} disabled={chosen===null}>
            {current+1===questions.length ? "See Results" : "Next Question"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Explain Tab ──────────────────────────────────────────────────────────────
function ExplainTab({ docId }: { docId: string }) {
  const [concept, setConcept]         = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading]         = useState(false);

  const explain = async () => {
    if (!concept.trim()) { toast.error("Enter a concept first"); return; }
    setLoading(true); setExplanation("");
    try {
      const { explanation: e } = await lmsAI.explain(docId, concept.trim());
      setExplanation(e);
    } catch (err: any) { toast.error(err.message ?? "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-1">Concept Explainer</h3>
        <p className="text-xs text-muted-foreground">Type any concept and get a clear, detailed explanation from the document.</p>
      </div>
      <div className="flex gap-2">
        <Input value={concept} onChange={e=>setConcept(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&explain()}
          placeholder="e.g. photosynthesis, Newton's Second Law, quadratic formula…"/>
        <Button onClick={explain} disabled={loading||!concept.trim()} className="btn-orange shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Lightbulb className="h-4 w-4"/>}
        </Button>
      </div>
      {loading && (
        <div className="flex items-center gap-3 py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-orange"/>
          <span className="text-sm">Explaining "{concept}"…</span>
        </div>
      )}
      {explanation && (
        <Card className="border-2 border-orange/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-orange">{concept}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{explanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudyDocument() {
  const { id }        = useParams<{ id: string }>();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const [doc, setDoc] = useState<LmsDocument|null>(null);
  const [loading, setLoading] = useState(true);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    if (!id) return;
    lmsDocs.get(id)
      .then(({ document: d }) => setDoc(d))
      .catch(() => { toast.error("Document not found"); navigate("/lms/study"); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-orange"/>
        <p className="text-sm text-muted-foreground">Loading document…</p>
      </div>
    </div>
  );
  if (!doc || !id) return null;

  const isPdf = doc.fileType === "pdf";
  const TERM_LABEL: Record<string,string> = { "1":"First Term","2":"Second Term","3":"Third Term" };

  return (
    <div className="flex flex-col min-h-screen page-fade">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 md:px-6 py-3 border-b border-border bg-card sticky top-0 z-20 shadow-sm">
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary"
          onClick={() => navigate("/lms/study")}>
          <ArrowLeft className="h-4 w-4"/>
        </Button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {isPdf
            ? <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-red-500"/></div>
            : <div className="w-9 h-9 rounded-xl bg-orange/10 flex items-center justify-center shrink-0"><Presentation className="h-5 w-5 text-orange"/></div>
          }
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{doc.title}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">{doc.fileType}</span>
              {doc.pages>0 && <span className="text-xs text-muted-foreground">· {doc.pages} pages</span>}
              {doc.className && <span className="text-xs bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-full">{doc.className}</span>}
              {doc.term && <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{TERM_LABEL[doc.term]}</span>}
              {doc.subject && <span className="text-xs bg-accent/10 text-accent font-medium px-1.5 py-0.5 rounded-full">{doc.subject}</span>}
              {doc.uploaderRole==="teacher" && (
                <span className="text-xs bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <GraduationCap className="h-3 w-3"/>Teacher
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline"
            className={`h-8 text-xs ${showViewer?"bg-primary text-primary-foreground hover:bg-primary/90":""}`}
            onClick={() => setShowViewer(!showViewer)}>
            <span className="hidden sm:inline">{showViewer ? "Hide Document" : "Read Document"}</span>
            <span className="sm:hidden">{showViewer ? "Hide" : "View Doc"}</span>
          </Button>
          <Badge className="bg-orange text-white text-xs font-bold px-2.5 py-1 hidden sm:inline-flex">AI Ready</Badge>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex gap-0 overflow-hidden ${showViewer ? "flex-col lg:flex-row" : "flex-col"}`}>
        {/* Document viewer panel */}
        {showViewer && (
          <div className="w-full lg:w-[52%] border-b lg:border-b-0 lg:border-r border-border p-4 overflow-hidden" style={{ minHeight: "40vh", height: "auto" }}>
            <DocumentViewer doc={doc}/>
          </div>
        )}

        {/* AI Tools panel */}
        <div className={`${showViewer ? "w-full lg:w-[48%]" : "w-full"} p-5 overflow-auto`}>
          <Tabs defaultValue="chat">
            <TabsList className="w-full h-10 mb-5 bg-muted/60 overflow-x-auto flex-nowrap">
              <TabsTrigger value="chat"       className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
                <MessageSquare className="h-3.5 w-3.5"/> Chat
              </TabsTrigger>
              <TabsTrigger value="summary"    className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
                <Sparkles className="h-3.5 w-3.5"/> Summary
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
                <BookOpen className="h-3.5 w-3.5"/> Cards
              </TabsTrigger>
              <TabsTrigger value="quiz"       className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
                <Zap className="h-3.5 w-3.5"/> Quiz
              </TabsTrigger>
              <TabsTrigger value="explain"    className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
                <Lightbulb className="h-3.5 w-3.5"/> Explain
              </TabsTrigger>
            </TabsList>
            <div style={{ minHeight: showViewer ? "400px" : "auto" }}>
              <TabsContent value="chat"       className="h-full mt-0"><ChatTab docId={id} docTitle={doc.title}/></TabsContent>
              <TabsContent value="summary"    className="h-full mt-0"><SummaryTab docId={id}/></TabsContent>
              <TabsContent value="flashcards" className="mt-0"><FlashcardsTab docId={id}/></TabsContent>
              <TabsContent value="quiz"       className="mt-0"><QuizTab docId={id}/></TabsContent>
              <TabsContent value="explain"    className="mt-0"><ExplainTab docId={id}/></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
