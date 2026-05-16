import { useState } from "react";
import { Search, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Result {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  examTitle: string;
  subject: string;
  score: number;
  total: number;
  grade: string;
  date: string;
  status: "pass" | "fail";
}

const mockResults: Result[] = [
  { id: "1", studentName: "Alice Johnson", studentId: "STU001", class: "Grade 10A", examTitle: "Algebra Midterm", subject: "Mathematics", score: 85, total: 100, grade: "A", date: "2025-03-15", status: "pass" },
  { id: "2", studentName: "Bob Martinez", studentId: "STU002", class: "Grade 10A", examTitle: "Algebra Midterm", subject: "Mathematics", score: 62, total: 100, grade: "C", date: "2025-03-15", status: "pass" },
  { id: "3", studentName: "Carol White", studentId: "STU003", class: "Grade 11A", examTitle: "World War II Quiz", subject: "History", score: 78, total: 100, grade: "B", date: "2025-03-10", status: "pass" },
  { id: "4", studentName: "David Lee", studentId: "STU004", class: "Grade 11A", examTitle: "World War II Quiz", subject: "History", score: 45, total: 100, grade: "F", date: "2025-03-10", status: "fail" },
  { id: "5", studentName: "Eva Brown", studentId: "STU005", class: "Grade 10B", examTitle: "Cell Biology Exam", subject: "Biology", score: 91, total: 100, grade: "A+", date: "2025-03-20", status: "pass" },
  { id: "6", studentName: "Frank Wilson", studentId: "STU006", class: "Grade 10B", examTitle: "Cell Biology Exam", subject: "Biology", score: 55, total: 100, grade: "D", date: "2025-03-20", status: "pass" },
  { id: "7", studentName: "Grace Taylor", studentId: "STU007", class: "Grade 10A", examTitle: "Newton's Laws Quiz", subject: "Physics", score: 88, total: 100, grade: "A", date: "2025-03-25", status: "pass" },
  { id: "8", studentName: "Henry Anderson", studentId: "STU008", class: "Grade 10A", examTitle: "Newton's Laws Quiz", subject: "Physics", score: 38, total: 100, grade: "F", date: "2025-03-25", status: "fail" },
  { id: "9", studentName: "Iris Thomas", studentId: "STU009", class: "Grade 9A", examTitle: "Algebra Midterm", subject: "Mathematics", score: 72, total: 100, grade: "B", date: "2025-03-15", status: "pass" },
  { id: "10", studentName: "Jack Jackson", studentId: "STU010", class: "Grade 9A", examTitle: "Algebra Midterm", subject: "Mathematics", score: 50, total: 100, grade: "D", date: "2025-03-15", status: "pass" },
];

const gradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "bg-green-100 text-green-700";
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-700";
  if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-700";
  if (grade.startsWith("D")) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
};

const TrendIcon = ({ score }: { score: number }) => {
  if (score >= 75) return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (score >= 50) return <Minus className="h-4 w-4 text-amber-500" />;
  return <TrendingDown className="h-4 w-4 text-red-500" />;
};

export default function ExamResults() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const subjects = [...new Set(mockResults.map(r => r.subject))];
  const classes = [...new Set(mockResults.map(r => r.class))];

  const filtered = mockResults.filter(r => {
    const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.examTitle.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subjectFilter === "all" || r.subject === subjectFilter;
    const matchClass = classFilter === "all" || r.class === classFilter;
    return matchSearch && matchSubject && matchClass;
  });

  const avgScore = Math.round(filtered.reduce((a, r) => a + r.score, 0) / (filtered.length || 1));
  const passRate = Math.round((filtered.filter(r => r.status === "pass").length / (filtered.length || 1)) * 100);
  const topScore = Math.max(...filtered.map(r => r.score), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
        <p className="text-muted-foreground">View and analyze student exam performance.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Total Results</div>
          <div className="text-2xl font-bold mt-1">{filtered.length}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Average Score</div>
          <div className="text-2xl font-bold mt-1 text-primary">{avgScore}%</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Pass Rate</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{passRate}%</div>
        </div>
        <div className="border rounded-lg p-4 bg-card flex items-start gap-3">
          <Trophy className="h-5 w-5 text-amber-500 mt-1" />
          <div>
            <div className="text-sm text-muted-foreground">Top Score</div>
            <div className="text-2xl font-bold mt-1">{topScore}%</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search student or exam..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="font-medium">{r.studentName}</div>
                  <div className="text-xs text-muted-foreground">{r.studentId}</div>
                </TableCell>
                <TableCell>{r.class}</TableCell>
                <TableCell className="text-sm">{r.examTitle}</TableCell>
                <TableCell>{r.subject}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${r.score >= 75 ? "bg-green-500" : r.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${r.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{r.score}/{r.total}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${gradeColor(r.grade)}`}>
                    {r.grade}
                  </span>
                </TableCell>
                <TableCell><TrendIcon score={r.score} /></TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.date}</TableCell>
                <TableCell>
                  <Badge className={r.status === "pass" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                    {r.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
