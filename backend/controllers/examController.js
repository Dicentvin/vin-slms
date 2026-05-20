/**
 * examController.js
 *
 * Admin/Teacher routes:
 *   POST   /api/exams                 — create exam
 *   GET    /api/exams                 — list exams (admin/teacher sees all; student sees active)
 *   GET    /api/exams/:id             — get single exam (questions stripped of answers for students)
 *   PUT    /api/exams/:id             — update exam (draft only)
 *   DELETE /api/exams/:id             — delete exam
 *   PATCH  /api/exams/:id/status      — activate | close | draft
 *
 * Candidate routes:
 *   POST   /api/exams/:id/start       — start attempt, returns submission id
 *   POST   /api/exams/:id/submit      — submit all answers
 *   GET    /api/exams/:id/result      — get own result (if allowReview)
 *
 * Admin/Teacher marking:
 *   GET    /api/exams/:id/submissions — list all submissions for an exam
 *   PATCH  /api/exams/:id/submissions/:sid/mark — mark theory answers
 */

import Exam       from "../models/Exam.js";
import Submission from "../models/Submission.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const isStaff = (user) => ["admin", "teacher"].includes(user.role);

/** Strip correct answers from questions before sending to student */
function sanitizeForStudent(exam) {
  const obj = exam.toObject ? exam.toObject() : { ...exam };
  obj.questions = obj.questions.map(q => {
    const { correctAnswer, explanation, sampleAnswer, ...rest } = q;
    return rest;
  });
  return obj;
}

// ── CREATE ────────────────────────────────────────────────────────────────────
export const createExam = async (req, res) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: "Only teachers and admins can create exams" });
    }

    const {
      title, description, subject, className, type,
      duration, passMark, questions = [],
      allowReview, shuffleQ, shuffleOpts, attemptsAllowed,
      scheduledAt, closesAt,
    } = req.body;

    if (!title || !subject || !type || !duration) {
      return res.status(400).json({ success: false, message: "title, subject, type and duration are required" });
    }
    if (!["mcq", "theory", "mixed"].includes(type)) {
      return res.status(400).json({ success: false, message: "type must be mcq | theory | mixed" });
    }
    if (questions.length === 0) {
      return res.status(400).json({ success: false, message: "At least one question is required" });
    }

    const exam = await Exam.create({
      title, description, subject,
      className: className || "All",
      type, duration,
      passMark: passMark || 0,
      questions,
      allowReview: allowReview ?? true,
      shuffleQ:    shuffleQ    ?? false,
      shuffleOpts: shuffleOpts ?? false,
      attemptsAllowed: attemptsAllowed || 1,
      scheduledAt: scheduledAt || null,
      closesAt:    closesAt    || null,
      createdBy:   req.user._id,
      creatorName: req.user.name,
      status: "draft",
    });

    return res.status(201).json({ success: true, exam });
  } catch (err) {
    console.error("createExam error:", err);
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map(e => e.message).join(", ");
      return res.status(400).json({ success: false, message: msg });
    }
    return res.status(500).json({ success: false, message: "Failed to create exam" });
  }
};

// ── LIST ──────────────────────────────────────────────────────────────────────
export const getExams = async (req, res) => {
  try {
    const { status, className, subject, type } = req.query;
    const filter = {};

    if (isStaff(req.user)) {
      // Admin/teacher see all exams they created (or all if admin)
      if (req.user.role === "teacher") filter.createdBy = req.user._id;
      if (status)    filter.status    = status;
      if (className) filter.className = { $in: [className, "All"] };
      if (subject)   filter.subject   = subject;
      if (type)      filter.type      = type;
    } else {
      // Students only see active exams for their class
      filter.status = "active";
      if (req.user.className) {
        filter.className = { $in: [req.user.className, "All"] };
      }
    }

    const exams = await Exam.find(filter)
      .select("-questions.correctAnswer -questions.explanation -questions.sampleAnswer")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, count: exams.length, exams });
  } catch (err) {
    console.error("getExams error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch exams" });
  }
};

// ── GET ONE ───────────────────────────────────────────────────────────────────
export const getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    // Students: only see active exams for their class
    if (!isStaff(req.user)) {
      if (exam.status !== "active") {
        return res.status(403).json({ success: false, message: "This exam is not currently active" });
      }
      return res.json({ success: true, exam: sanitizeForStudent(exam) });
    }

    return res.json({ success: true, exam });
  } catch (err) {
    console.error("getExam error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch exam" });
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateExam = async (req, res) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    if (exam.status === "active") {
      // Only allow closing or scheduling changes when active
      const allowedFields = ["closesAt", "status", "description"];
      const update = {};
      allowedFields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
      Object.assign(exam, update);
    } else {
      const {
        title, description, subject, className, type, duration,
        passMark, questions, allowReview, shuffleQ, shuffleOpts,
        attemptsAllowed, scheduledAt, closesAt,
      } = req.body;

      if (title)       exam.title       = title;
      if (description !== undefined) exam.description = description;
      if (subject)     exam.subject     = subject;
      if (className)   exam.className   = className;
      if (type)        exam.type        = type;
      if (duration)    exam.duration    = duration;
      if (passMark !== undefined)  exam.passMark    = passMark;
      if (questions)   exam.questions   = questions;
      if (allowReview !== undefined) exam.allowReview = allowReview;
      if (shuffleQ    !== undefined) exam.shuffleQ    = shuffleQ;
      if (shuffleOpts !== undefined) exam.shuffleOpts = shuffleOpts;
      if (attemptsAllowed) exam.attemptsAllowed = attemptsAllowed;
      if (scheduledAt !== undefined) exam.scheduledAt = scheduledAt;
      if (closesAt    !== undefined) exam.closesAt    = closesAt;
    }

    await exam.save();
    return res.json({ success: true, exam });
  } catch (err) {
    console.error("updateExam error:", err);
    return res.status(500).json({ success: false, message: "Failed to update exam" });
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
export const deleteExam = async (req, res) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    if (exam.status === "active") {
      return res.status(400).json({ success: false, message: "Cannot delete an active exam. Close it first." });
    }

    await Submission.deleteMany({ examId: exam._id });
    await exam.deleteOne();
    return res.json({ success: true, message: "Exam and all submissions deleted" });
  } catch (err) {
    console.error("deleteExam error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete exam" });
  }
};

// ── CHANGE STATUS ─────────────────────────────────────────────────────────────
export const setExamStatus = async (req, res) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }
    const { status } = req.body;
    if (!["draft", "active", "closed"].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be draft | active | closed" });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    if (status === "active" && exam.questions.length === 0) {
      return res.status(400).json({ success: false, message: "Cannot activate an exam with no questions" });
    }

    exam.status = status;
    await exam.save();
    return res.json({ success: true, exam });
  } catch (err) {
    console.error("setExamStatus error:", err);
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

// ── START ATTEMPT ─────────────────────────────────────────────────────────────
export const startExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    if (exam.status !== "active") {
      return res.status(400).json({ success: false, message: "This exam is not currently active" });
    }

    // Check closesAt
    if (exam.closesAt && new Date() > new Date(exam.closesAt)) {
      return res.status(400).json({ success: false, message: "This exam has closed" });
    }

    // Check existing attempts
    const existingCount = await Submission.countDocuments({
      examId: exam._id, studentId: req.user._id,
    });
    if (existingCount >= exam.attemptsAllowed) {
      return res.status(400).json({
        success: false,
        message: `You have used all ${exam.attemptsAllowed} attempt(s) for this exam`,
      });
    }

    // Check if already in progress
    const inProgress = await Submission.findOne({
      examId: exam._id, studentId: req.user._id, status: "in_progress",
    });
    if (inProgress) {
      return res.json({
        success: true,
        submission: inProgress,
        exam: sanitizeForStudent(exam),
        resumed: true,
      });
    }

    // Create new submission
    const submission = await Submission.create({
      examId:        exam._id,
      studentId:     req.user._id,
      studentName:   req.user.name,
      className:     req.user.className ?? "",
      answers:       [],
      maxScore:      exam.totalMarks,
      status:        "in_progress",
      startedAt:     new Date(),
      attemptNumber: existingCount + 1,
    });

    // Return exam WITHOUT correct answers
    return res.status(201).json({
      success: true,
      submission,
      exam: sanitizeForStudent(exam),
      resumed: false,
    });
  } catch (err) {
    console.error("startExam error:", err);
    return res.status(500).json({ success: false, message: "Failed to start exam" });
  }
};

// ── SUBMIT ────────────────────────────────────────────────────────────────────
export const submitExam = async (req, res) => {
  try {
    const { submissionId, answers = [], timeTaken = 0 } = req.body;
    // answers: [{ questionId, selectedOption?, answerText? }]

    const submission = await Submission.findOne({
      _id: submissionId, examId: req.params.id, studentId: req.user._id,
    });
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    if (submission.status !== "in_progress") {
      return res.status(400).json({ success: false, message: "This exam has already been submitted" });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    // Build answer records + auto-score MCQ
    let mcqScore = 0;
    const processedAnswers = answers.map(ans => {
      const question = exam.questions.id(ans.questionId);
      if (!question) return null;

      if (question.type === "mcq") {
        const isCorrect = ans.selectedOption === question.correctAnswer;
        if (isCorrect) mcqScore += question.marks;
        return {
          questionId:     question._id,
          type:           "mcq",
          selectedOption: ans.selectedOption ?? "",
          isCorrect,
          marksAwarded:   isCorrect ? question.marks : 0,
        };
      } else {
        // Theory — no auto-score
        return {
          questionId:  question._id,
          type:        "theory",
          answerText:  ans.answerText ?? "",
          marksAwarded: 0,   // teacher marks later
        };
      }
    }).filter(Boolean);

    const hasTheory = processedAnswers.some(a => a.type === "theory");

    submission.answers      = processedAnswers;
    submission.mcqScore     = mcqScore;
    submission.theoryScore  = 0;
    submission.totalScore   = mcqScore;
    submission.percentage   = exam.totalMarks > 0 ? Math.round((mcqScore / exam.totalMarks) * 100) : 0;
    submission.status       = "submitted";
    submission.submittedAt  = new Date();
    submission.timeTaken    = timeTaken;
    submission.theoryMarkingStatus = hasTheory ? "pending" : "complete";

    // If no theory, mark as fully marked
    if (!hasTheory) submission.status = "marked";

    await submission.save();

    // Return result (with correct answers if allowReview is on and no theory)
    const result = {
      mcqScore,
      theoryScore:    0,
      totalScore:     mcqScore,
      maxScore:       exam.totalMarks,
      percentage:     submission.percentage,
      hasTheory,
      theoryMarkingStatus: submission.theoryMarkingStatus,
    };

    if (exam.allowReview && !hasTheory) {
      result.answers = processedAnswers;
      result.questions = exam.questions.map(q => ({
        _id: q._id, text: q.text, type: q.type, marks: q.marks,
        options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation,
      }));
    }

    return res.json({ success: true, submission: submission._id, result });
  } catch (err) {
    console.error("submitExam error:", err);
    return res.status(500).json({ success: false, message: "Failed to submit exam" });
  }
};

// ── GET OWN RESULT ────────────────────────────────────────────────────────────
export const getMyResult = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      examId: req.params.id, studentId: req.user._id,
      status: { $in: ["submitted", "marked"] },
    }).sort({ attemptNumber: -1 });

    if (!submission) {
      return res.status(404).json({ success: false, message: "No submission found for this exam" });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    const result = {
      submission,
      exam: {
        title: exam.title, subject: exam.subject,
        type: exam.type, totalMarks: exam.totalMarks,
        allowReview: exam.allowReview,
      },
    };

    // Include answer review if allowed and fully marked
    if (exam.allowReview && submission.status === "marked") {
      result.questions = exam.questions;
    }

    return res.json({ success: true, result });
  } catch (err) {
    console.error("getMyResult error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch result" });
  }
};

// ── GET ALL MY RESULTS (student) ──────────────────────────────────────────────
export const getMyResults = async (req, res) => {
  try {
    const submissions = await Submission.find({
      studentId: req.user._id,
      status: { $in: ["submitted", "marked"] },
    })
      .populate("examId", "title subject type totalMarks duration")
      .sort({ submittedAt: -1 })
      .lean();

    return res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    console.error("getMyResults error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch results" });
  }
};

// ── LIST ALL SUBMISSIONS (admin/teacher) ──────────────────────────────────────
export const getSubmissions = async (req, res) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    const { status } = req.query;
    const filter = { examId: req.params.id };
    if (status) filter.status = status;

    const submissions = await Submission.find(filter)
      .select("-answers.answerText")   // don't return full essay text in list
      .sort({ submittedAt: -1 })
      .lean();

    return res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    console.error("getSubmissions error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch submissions" });
  }
};

// ── GET SINGLE SUBMISSION (for marking) ──────────────────────────────────────
export const getSubmission = async (req, res) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    const submission = await Submission.findOne({
      _id: req.params.sid, examId: req.params.id,
    });
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

    const exam = await Exam.findById(req.params.id);
    return res.json({ success: true, submission, exam });
  } catch (err) {
    console.error("getSubmission error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch submission" });
  }
};

// ── MARK THEORY (teacher/admin) ───────────────────────────────────────────────
export const markSubmission = async (req, res) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    // marks: [{ questionId, marksAwarded, feedback? }]
    const { marks = [] } = req.body;

    const submission = await Submission.findOne({
      _id: req.params.sid, examId: req.params.id,
    });
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    if (submission.status === "in_progress") {
      return res.status(400).json({ success: false, message: "Student has not submitted yet" });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    let theoryScore = 0;
    let allMarked   = true;

    // Apply marks
    marks.forEach(({ questionId, marksAwarded, feedback }) => {
      const ans = submission.answers.find(
        a => a.questionId.toString() === questionId && a.type === "theory"
      );
      if (ans) {
        const question = exam.questions.id(questionId);
        const maxQ     = question?.marks ?? 0;
        ans.marksAwarded = Math.min(Math.max(0, marksAwarded), maxQ);
        ans.feedback     = feedback ?? "";
        ans.markedBy     = req.user._id;
        ans.markedAt     = new Date();
      }
    });

    // Recalculate theory score
    submission.answers.forEach(ans => {
      if (ans.type === "theory") {
        theoryScore += ans.marksAwarded;
        if (!ans.markedAt) allMarked = false;
      }
    });

    submission.theoryScore  = theoryScore;
    submission.totalScore   = submission.mcqScore + theoryScore;
    submission.percentage   = exam.totalMarks > 0
      ? Math.round((submission.totalScore / exam.totalMarks) * 100)
      : 0;
    submission.theoryMarkingStatus = allMarked ? "complete" : "partial";
    if (allMarked) submission.status = "marked";

    await submission.save();
    return res.json({ success: true, submission });
  } catch (err) {
    console.error("markSubmission error:", err);
    return res.status(500).json({ success: false, message: "Failed to mark submission" });
  }
};
