import { useState } from "react";
import { Sparkles, RefreshCw, Lightbulb, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Props {
  role?: string;
}

const SS_SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry", "Biology"];

// Calls the lms-backend /api/ai/chat endpoint with a synthetic doc context
async function getAIInsight(role: string): Promise<string> {
  const token = localStorage.getItem("lms_token");
  if (!token) throw new Error("Not authenticated");

  // Build a relevant prompt based on role
  const prompts: Record<string, string> = {
    admin:
      "You are an AI academic advisor for a Nigerian Senior Secondary Science School. " +
      "Give a brief (3-4 sentences) school management insight covering: student performance trends " +
      "across SS1, SS2, SS3 in Mathematics, Physics, Chemistry, Biology and English. " +
      "Include one actionable recommendation for the admin.",
    teacher:
      "You are an AI academic advisor for a Nigerian SS Science teacher. " +
      "Give a brief (3-4 sentences) teaching insight for today covering one of these subjects: " +
      "Mathematics, Physics, Chemistry, Biology or English. Include a specific tip for engaging students.",
    student:
      "You are an AI study advisor for a Nigerian Senior Secondary Science student. " +
      "Give a motivating (3-4 sentences) study tip for today covering WAEC exam preparation. " +
      "Focus on one of: Mathematics, Physics, Chemistry, Biology or English. Be encouraging and specific.",
    default:
      "You are an AI academic assistant for a Nigerian SS Science School. Give a helpful 3-sentence insight.",
  };

  const prompt = prompts[role] ?? prompts.default;

  // Use the /api/ai/explain endpoint with a dummy doc-independent call
  // We'll use a direct chat call instead
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      documentId: "dashboard",   // special key — backend handles this gracefully
      query: prompt,
    }),
  });

  if (!res.ok) {
    // Fallback to static insight if no document is uploaded yet
    const fallbacks: Record<string, string> = {
      admin:   "Upload your school's documents to get AI-powered insights on student performance across SS1, SS2 and SS3.",
      teacher: "Upload your lesson notes or past papers to let the AI generate insights and recommendations for your students.",
      student: "Upload your notes or textbooks in Study Hub to get personalised study tips and AI-generated flashcards.",
    };
    return fallbacks[role] ?? "Connect the Study Hub to get AI-powered academic insights.";
  }

  const data = await res.json();
  return data.answer ?? "No insight available.";
}

export function AiInsightWidget({ role }: Props) {
  const [insight, setInsight]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const result = await getAIInsight(role ?? "student");
      setInsight(result);
    } catch {
      // Graceful fallback
      const fallback = role === "student"
        ? `Study Tip: Focus on your weakest subject today. For SS students, consistent daily practice across ${SS_SUBJECTS.join(", ")} is the key to WAEC success.`
        : "Upload school documents in Study Hub to unlock AI-powered insights for your school.";
      setInsight(fallback);
      toast.info("Showing offline insight — connect backend for live AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-white border dark:from-violet-950/30 dark:to-gray-900 shadow-sm overflow-hidden relative">
      <BrainCircuit className="absolute -right-6 -bottom-6 h-32 w-32 text-violet-100/50 dark:text-violet-800/30" />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> AI Academic Advisor
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-violet-600 hover:text-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/30"
          onClick={generateInsight}
          disabled={loading}
          title="Get AI insight"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        ) : insight ? (
          <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {insight}
            </p>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Get a personalised AI insight based on your role and subjects.
            </p>
            <Button size="sm" onClick={generateInsight}>
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Generate Insight
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
