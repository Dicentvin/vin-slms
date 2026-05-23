const BASE = import.meta.env.VITE_LMS_API_URL ?? "";

function getToken(): string { return localStorage.getItem("lms_token") ?? ""; }
function authHeaders(): HeadersInit {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
function jsonHeaders(): HeadersInit {
  return { ...authHeaders(), "Content-Type": "application/json" };
}
async function handle<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as any).message ?? res.statusText ?? "Request failed");
  return json as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LmsDocument {
  _id: string; id?: string;
  title: string; description?: string;
  fileType: string; pages: number; fileUrl: string;
  totalChunks?: number; status?: string;
  uploaderRole?: string; uploaderName?: string;
  className?: string; term?: string; subject?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  isPublic?: boolean; rejectionReason?: string;
  createdAt: string;
}
export interface Flashcard {
  _id: string; question: string; answer: string;
  starred: boolean; reviewed: boolean;
}
export interface QuizQuestion {
  questionText: string; options: string[];
  correctAnswer: string; explanation: string;
}
export interface Quiz {
  _id: string; title: string;
  questions: QuizQuestion[]; totalQuestions: number;
}
export interface ChatMessage { role: "user" | "assistant"; content: string; }
export interface LmsUser {
  _id: string; name: string; email: string;
  role: string; className?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  createdAt?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const lmsAuth = {
  register: (name: string, email: string, password: string, role?: string, className?: string) =>
    fetch(`${BASE}/api/auth/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, className }),
    }).then(handle<{ success: boolean; token: string; user: LmsUser }>),

  login: (email: string, password: string) =>
    fetch(`${BASE}/api/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handle<{ success: boolean; token: string; user: LmsUser }>),

  me: () =>
    fetch(`${BASE}/api/auth/me`, { headers: authHeaders() })
      .then(handle<{ success: boolean; user: LmsUser }>),
};

// ─── Users (admin) ────────────────────────────────────────────────────────────
export const lmsUsers = {
  list: (params?: { role?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetch(`${BASE}/api/users${q ? `?${q}` : ""}`, { headers: authHeaders() })
      .then(handle<{ success: boolean; count: number; users: LmsUser[] }>);
  },

  // Fetch students, teachers AND parents in one call
  listAll: () =>
    fetch(`${BASE}/api/users`, { headers: authHeaders() })
      .then(handle<{ success: boolean; count: number; users: LmsUser[] }>),

  approve: (id: string, action: "approve" | "reject") =>
    fetch(`${BASE}/api/users/${id}/approval`, {
      method: "PATCH", headers: jsonHeaders(),
      body: JSON.stringify({ action }),
    }).then(handle<{ success: boolean; user: LmsUser }>),

  delete: (id: string) =>
    fetch(`${BASE}/api/users/${id}`, {
      method: "DELETE", headers: authHeaders(),
    }).then(handle<{ success: boolean }>),
};

// ─── Documents ────────────────────────────────────────────────────────────────
export const lmsDocs = {
  upload: (formData: FormData) =>
    fetch(`${BASE}/api/documents/upload`, {
      method: "POST", headers: authHeaders(), body: formData,
    }).then(handle<{ success: boolean; document: LmsDocument }>),

  // Own documents — accepts optional class/term/subject filters
  list: (params?: { class?: string; term?: string; subject?: string }) => {
    const entries = Object.entries(params ?? {}).filter(([, v]) => v);
    const q = entries.length ? "?" + new URLSearchParams(Object.fromEntries(entries) as Record<string,string>).toString() : "";
    return fetch(`${BASE}/api/documents${q}`, { headers: authHeaders() })
      .then(handle<{ success: boolean; count: number; documents: LmsDocument[] }>);
  },

  // Shared public approved materials (teacher/admin uploads visible to all)
  // NOTE: backend reads query param as "class" not "className"
  listShared: (params?: { class?: string; term?: string; subject?: string }) => {
    const q = new URLSearchParams({
      shared: "true",
      ...(params?.class   ? { class:   params.class   } : {}),
      ...(params?.term    ? { term:    params.term    } : {}),
      ...(params?.subject ? { subject: params.subject } : {}),
    }).toString();
    return fetch(`${BASE}/api/documents?${q}`, { headers: authHeaders() })
      .then(handle<{ success: boolean; count: number; documents: LmsDocument[] }>);
  },

  // Teacher-uploaded materials only (for students' "Teacher Materials" table)
  listTeacherMaterials: (params?: { class?: string; term?: string; subject?: string }) => {
    const q = new URLSearchParams({
      shared:       "true",
      uploaderRole: "teacher",
      ...(params?.class   ? { class:   params.class   } : {}),
      ...(params?.term    ? { term:    params.term    } : {}),
      ...(params?.subject ? { subject: params.subject } : {}),
    }).toString();
    return fetch(`${BASE}/api/documents?${q}`, { headers: authHeaders() })
      .then(handle<{ success: boolean; count: number; documents: LmsDocument[] }>);
  },

  listPending: () =>
    fetch(`${BASE}/api/documents?status=pending`, { headers: authHeaders() })
      .then(handle<{ success: boolean; count: number; documents: LmsDocument[] }>),

  get: (id: string) =>
    fetch(`${BASE}/api/documents/${id}`, { headers: authHeaders() })
      .then(handle<{ success: boolean; document: LmsDocument }>),

  update: (id: string, data: { title?: string; description?: string }) =>
    fetch(`${BASE}/api/documents/${id}`, {
      method: "PUT", headers: jsonHeaders(), body: JSON.stringify(data),
    }).then(handle<{ success: boolean; document: LmsDocument }>),

  delete: (id: string) =>
    fetch(`${BASE}/api/documents/${id}`, {
      method: "DELETE", headers: authHeaders(),
    }).then(handle<{ success: boolean }>),

  approve: (id: string, action: "approve" | "reject", rejectionReason?: string) =>
    fetch(`${BASE}/api/documents/${id}/approve`, {
      method: "PATCH", headers: jsonHeaders(),
      body: JSON.stringify({ action, rejectionReason }),
    }).then(handle<{ success: boolean; document: LmsDocument }>),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const lmsAI = {
  generateFlashcards: (documentId: string, count = 20) =>
    fetch(`${BASE}/api/ai/flashcards`, {
      method: "POST", headers: jsonHeaders(),
      body: JSON.stringify({ documentId, count }),
    }).then(handle<{ success: boolean; flashcards: Flashcard[]; count: number }>),

  getFlashcards: (documentId: string) =>
    fetch(`${BASE}/api/ai/flashcards/${documentId}`, { headers: authHeaders() })
      .then(handle<{ success: boolean; flashcards: Flashcard[] }>),

  updateFlashcard: (id: string, data: Partial<Pick<Flashcard, "starred" | "reviewed">>) =>
    fetch(`${BASE}/api/ai/flashcards/${id}`, {
      method: "PATCH", headers: jsonHeaders(), body: JSON.stringify(data),
    }).then(handle<{ success: boolean; flashcard: Flashcard }>),

  generateQuiz: (documentId: string, count = 10) =>
    fetch(`${BASE}/api/ai/quiz`, {
      method: "POST", headers: jsonHeaders(),
      body: JSON.stringify({ documentId, count }),
    }).then(handle<{ success: boolean; quiz: Quiz }>),

  getQuizzes: (documentId: string) =>
    fetch(`${BASE}/api/ai/quiz/${documentId}`, { headers: authHeaders() })
      .then(handle<{ success: boolean; quizzes: Quiz[] }>),

  getSummary: (documentId: string) =>
    fetch(`${BASE}/api/ai/summary`, {
      method: "POST", headers: jsonHeaders(),
      body: JSON.stringify({ documentId }),
    }).then(handle<{ success: boolean; summary: string }>),

  chat: (documentId: string, query: string) =>
    fetch(`${BASE}/api/ai/chat`, {
      method: "POST", headers: jsonHeaders(),
      body: JSON.stringify({ documentId, query }),
    }).then(handle<{ success: boolean; answer: string; usedChunks: number }>),

  getChatHistory: (documentId: string) =>
    fetch(`${BASE}/api/ai/chat/${documentId}`, { headers: authHeaders() })
      .then(handle<{ success: boolean; messages: ChatMessage[] }>),

  clearChat: (documentId: string) =>
    fetch(`${BASE}/api/ai/chat/${documentId}`, {
      method: "DELETE", headers: authHeaders(),
    }).then(handle<{ success: boolean }>),

  explain: (documentId: string, concept: string) =>
    fetch(`${BASE}/api/ai/explain`, {
      method: "POST", headers: jsonHeaders(),
      body: JSON.stringify({ documentId, concept }),
    }).then(handle<{ success: boolean; concept: string; explanation: string }>),
};

// ─── Exam Types ───────────────────────────────────────────────────────────────
export interface ExamQuestion {
  _id: string;
  text: string;
  type: "mcq" | "theory";
  marks: number;
  options?: { id: string; text: string }[];
  correctAnswer?: string;
  explanation?: string;
  hint?: string;
}

export interface OfficialExam {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  className: string;
  type: "mcq" | "theory" | "mixed";
  duration: number;
  totalMarks: number;
  passMark?: number;
  status: "draft" | "active" | "closed";
  questions: ExamQuestion[];
  allowReview: boolean;
  shuffleQ: boolean;
  attemptsAllowed: number;
  scheduledAt?: string;
  closesAt?: string;
  creatorName?: string;
  createdAt: string;
}

export interface ExamSubmission {
  _id: string;
  examId: string;
  studentId: string;
  studentName: string;
  answers: {
    questionId: string;
    type: "mcq" | "theory";
    selectedOption?: string;
    answerText?: string;
    isCorrect?: boolean;
    marksAwarded: number;
    feedback?: string;
  }[];
  mcqScore: number;
  theoryScore: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passMark?: number;
  passed?: boolean;
  status: "in_progress" | "submitted" | "marked";
  theoryMarkingStatus: "pending" | "partial" | "complete";
  startedAt: string;
  submittedAt?: string;
  timeTaken: number;
  attemptNumber: number;
  // Normalised exam fields returned by getMyResults
  examTitle?: string;
  examSubject?: string;
  examType?: string;
  examTotalMarks?: number;
  examDuration?: number;
}

export interface ExamResult {
  submission: ExamSubmission;
  exam: { title: string; subject: string; type: string; totalMarks: number; allowReview: boolean };
  questions?: ExamQuestion[];
}

// ─── Official Exam API ────────────────────────────────────────────────────────
export const officialExams = {
  // List exams (students get active only; admin/teacher get all)
  list: (params?: { status?: string; className?: string; subject?: string; type?: string }) => {
    const q = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return fetch(`${BASE}/api/exams${q}`, { headers: jsonHeaders() })
      .then(handle<{ success: boolean; exams: OfficialExam[] }>);
  },

  // Get single exam (questions without answers for students)
  get: (id: string) =>
    fetch(`${BASE}/api/exams/${id}`, { headers: jsonHeaders() })
      .then(handle<{ success: boolean; exam: OfficialExam }>),

  // Create exam (admin/teacher)
  create: (data: Partial<OfficialExam>) =>
    fetch(`${BASE}/api/exams`, {
      method: "POST", headers: jsonHeaders(),
      body: JSON.stringify(data),
    }).then(handle<{ success: boolean; exam: OfficialExam }>),

  // Update exam (admin/teacher)
  update: (id: string, data: Partial<OfficialExam>) =>
    fetch(`${BASE}/api/exams/${id}`, {
      method: "PUT", headers: jsonHeaders(),
      body: JSON.stringify(data),
    }).then(handle<{ success: boolean; exam: OfficialExam }>),

  // Delete exam
  delete: (id: string) =>
    fetch(`${BASE}/api/exams/${id}`, { method: "DELETE", headers: jsonHeaders() })
      .then(handle<{ success: boolean; message: string }>),

  // Change status: draft | active | closed
  setStatus: (id: string, status: "draft" | "active" | "closed") =>
    fetch(`${BASE}/api/exams/${id}/status`, {
      method: "PATCH", headers: jsonHeaders(),
      body: JSON.stringify({ status }),
    }).then(handle<{ success: boolean; exam: OfficialExam }>),

  // ── Candidate ──────────────────────────────────────────────────────────────
  // Start exam attempt — returns submission + sanitised exam
  start: (id: string) =>
    fetch(`${BASE}/api/exams/${id}/start`, {
      method: "POST", headers: jsonHeaders(),
    }).then(handle<{ success: boolean; submission: ExamSubmission; exam: OfficialExam; resumed: boolean }>),

  // Submit answers
  submit: (id: string, submissionId: string, answers: { questionId: string; selectedOption?: string; answerText?: string }[], timeTaken: number) =>
    fetch(`${BASE}/api/exams/${id}/submit`, {
      method: "POST", headers: jsonHeaders(),
      body: JSON.stringify({ submissionId, answers, timeTaken }),
    }).then(handle<{ success: boolean; submission: string; result: any }>),

  // Get own result for one exam
  getResult: (id: string) =>
    fetch(`${BASE}/api/exams/${id}/result`, { headers: jsonHeaders() })
      .then(handle<{ success: boolean; result: ExamResult }>),

  // Get all my results
  getMyResults: () =>
    fetch(`${BASE}/api/exams/my-results`, { headers: jsonHeaders() })
      .then(handle<{ success: boolean; submissions: ExamSubmission[] }>),

  // ── Marking ────────────────────────────────────────────────────────────────
  // Admin: all attempts across all exams
  getAllAttempts: (params?: { examId?: string; status?: string; className?: string }) => {
    const q = params ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v)) as any).toString() : "";
    return fetch(`${BASE}/api/exams/all-attempts${q}`, { headers: jsonHeaders() })
      .then(handle<{ success: boolean; count: number; attempts: any[] }>);
  },

  getSubmissions: (examId: string, status?: string) => {
    const q = status ? `?status=${status}` : "";
    return fetch(`${BASE}/api/exams/${examId}/submissions${q}`, { headers: jsonHeaders() })
      .then(handle<{ success: boolean; submissions: ExamSubmission[] }>);
  },

  getSubmission: (examId: string, sid: string) =>
    fetch(`${BASE}/api/exams/${examId}/submissions/${sid}`, { headers: jsonHeaders() })
      .then(handle<{ success: boolean; submission: ExamSubmission; exam: OfficialExam }>),

  markSubmission: (examId: string, sid: string, marks: { questionId: string; marksAwarded: number; feedback?: string }[]) =>
    fetch(`${BASE}/api/exams/${examId}/submissions/${sid}/mark`, {
      method: "PATCH", headers: jsonHeaders(),
      body: JSON.stringify({ marks }),
    }).then(handle<{ success: boolean; submission: ExamSubmission }>),
};
