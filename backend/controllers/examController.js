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
 * Student routes:
 *   GET    /api/exams/my-results      — list all my submission results
 *   POST   /api/exams/:id/start       — start attempt, returns submission + sanitised exam
 *   POST   /api/exams/:id/submit      — submit all answers
 *   GET    /api/exams/:id/result      — get own result (if allowReview)
 *
 * Admin/Teacher marking:
 *   GET    /api/exams/:id/submissions         — list all submissions
 *   GET    /api/exams/:id/submissions/:sid    — single submission (for marking)
 *   PATCH  /api/exams/:id/submissions/:sid/mark — mark theory answers
 */

import Exam       from "../models/Exam.js";
import Submission from "../models/Submission.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const isStaff = (user) => ["admin", "teacher"].includes(user.role);

/** Strip correct answers from questions before sending to student */
function sanitizeForStudent(exam) {
  const obj = exam.toObject ? exam.toObject() : { ...exam };
  obj.questions = (obj.questions ?? []).map(q => {
    const { correctAnswer, explanation, sampleAnswer, ...rest } = q;
    return rest;
  });
  return obj;
}

/**
 * Build the class-match filter for a student.
 * Matches exams whose className is the student's class OR "All".
 */
function studentClassFilter(user) {
  if (user.className) {
    return { $in: [user.className, "All"] };
  }
  // Student has no class assigned — they can only see "All" exams
  return "All";
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
      passMark: passMark ?? 0,
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
      // Teachers see only their own exams; admins see all
      if (req.user.role === "teacher") filter.createdBy = req.user._id;
      if (status)    filter.status    = status;
      if (className) filter.className = { $in: [className, "All"] };
      if (subject)   filter.subject   = subject;
      if (type)      filter.type      = type;
    } else {
      // Students always see active exams only, filtered to their class
      filter.status    = "active";
      filter.className = studentClassFilter(req.user);

      // Allow optional extra filters from student (e.g. subject, type)
      if (subject) filter.subject = subject;
      if (type)    filter.type    = type;
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

    if (!isStaff(req.user)) {
      // Must be active
      if (exam.status !== "active") {
        return res.status(403).json({ success: false, message: "This exam is not currently active" });
      }
      // Must be for student's class (or "All")
      if (exam.className !== "All" && req.user.className && exam.className !== req.user.className) {
        return res.status(403).json({ success: false, message: "This exam is not available for your class" });
      }
      // Must not have passed its closing time
      if (exam.closesAt && new Date() > new Date(exam.closesAt)) {
        return res.status(403).json({ success: false, message: "This exam has closed" });
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
      // Only allow safe fields when exam is live
      const allowedFields = ["closesAt", "description"];
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
      if (passMark     !== undefined)  exam.passMark    = passMark;
      if (questions)   exam.questions   = questions;
      if (allowReview  !== undefined) exam.allowReview = allowReview;
      if (shuffleQ     !== undefined) exam.shuffleQ    = shuffleQ;
      if (shuffleOpts  !== undefined) exam.shuffleOpts = shuffleOpts;
      if (attemptsAllowed) exam.attemptsAllowed = attemptsAllowed;
      if (scheduledAt  !== undefined) exam.scheduledAt = scheduledAt;
      if (closesAt     !== undefined) exam.closesAt    = closesAt;
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
    return res.json({ success: true, exam, message: `Exam ${status}` });
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

    // Class eligibility check
    if (exam.className !== "All" && req.user.className && exam.className !== req.user.className) {
      return res.status(403).json({ success: false, message: "This exam is not available for your class" });
    }

    // Closing time check
    if (exam.closesAt && new Date() > new Date(exam.closesAt)) {
      return res.status(400).json({ success: false, message: "This exam has closed" });
    }

    // Check if an in-progress attempt already exists — resume it
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

    // Check attempt limits (count only completed attempts)
    const completedCount = await Submission.countDocuments({
      examId: exam._id, studentId: req.user._id,
      status: { $in: ["submitted", "marked"] },
    });
    if (completedCount >= exam.attemptsAllowed) {
      return res.status(400).json({
        success: false,
        message: `You have used all ${exam.attemptsAllowed} attempt(s) for this exam`,
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
      attemptNumber: completedCount + 1,
    });

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

    if (!submissionId) {
      return res.status(400).json({ success: false, message: "submissionId is required" });
    }

    const submission = await Submission.findOne({
      _id: submissionId, examId: req.params.id, studentId: req.user._id,
    });
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    if (submission.status !== "in_progress") {
      return res.status(400).json({ success: false, message: "This exam has already been submitted" });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    // Build answer records and auto-score MCQ
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
        // Theory — no auto-score, teacher marks later
        return {
          questionId:   question._id,
          type:         "theory",
          answerText:   ans.answerText ?? "",
          marksAwarded: 0,
        };
      }
    }).filter(Boolean);

    const hasTheory = processedAnswers.some(a => a.type === "theory");

    submission.answers      = processedAnswers;
    submission.mcqScore     = mcqScore;
    submission.theoryScore  = 0;
    submission.totalScore   = mcqScore;
    submission.percentage   = exam.totalMarks > 0 ? Math.round((mcqScore / exam.totalMarks) * 100) : 0;
    submission.status       = hasTheory ? "submitted" : "marked";
    submission.submittedAt  = new Date();
    submission.timeTaken    = timeTaken;
    submission.theoryMarkingStatus = hasTheory ? "pending" : "complete";

    await submission.save();

    // Build result object — include passMark for pass/fail display
    const result = {
      mcqScore,
      theoryScore:         0,
      totalScore:          mcqScore,
      maxScore:            exam.totalMarks,
      passMark:            exam.passMark ?? 0,
      percentage:          submission.percentage,
      passed:              submission.percentage >= (exam.passMark ?? 0),
      hasTheory,
      theoryMarkingStatus: submission.theoryMarkingStatus,
    };

    // Include full review if allowed and no theory
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

// ── GET OWN RESULT (single exam) ──────────────────────────────────────────────
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
        title:      exam.title,
        subject:    exam.subject,
        type:       exam.type,
        totalMarks: exam.totalMarks,
        passMark:   exam.passMark ?? 0,
        allowReview: exam.allowReview,
      },
    };

    // Include full question review if allowed and fully marked
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
    const rawSubmissions = await Submission.find({
      studentId: req.user._id,
      status:    { $in: ["submitted", "marked"] },
    })
      .populate("examId", "title subject type totalMarks duration passMark")
      .sort({ submittedAt: -1 })
      .lean();

    // Normalise: flatten populated examId into a consistent shape expected by the frontend
    const submissions = rawSubmissions.map(s => ({
      ...s,
      examId:   s.examId?._id ?? s.examId,   // keep as plain string id
      examTitle:   s.examId?.title   ?? "",
      examSubject: s.examId?.subject ?? "",
      examType:    s.examId?.type    ?? "",
      examTotalMarks: s.examId?.totalMarks ?? 0,
      examDuration:   s.examId?.duration   ?? 0,
      passMark:       s.examId?.passMark   ?? 0,
    }));

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
      .select("-answers.answerText")   // skip full essay text in list view
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

    marks.forEach(({ questionId, marksAwarded, feedback }) => {
      const ans = submission.answers.find(
        a => a.questionId.toString() === questionId && a.type === "theory"
      );
      if (ans) {
        const question = exam.questions.id(questionId);
        const maxQ     = question?.marks ?? 0;
        ans.marksAwarded = Math.min(Math.max(0, Number(marksAwarded)), maxQ);
        ans.feedback     = feedback ?? "";
        ans.markedBy     = req.user._id;
        ans.markedAt     = new Date();
      }
    });

    // Recalculate theory score and check if all theory answers are marked
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
