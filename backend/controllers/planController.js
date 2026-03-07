import Plan from "../models/Plan.js";
import {
  generateSchedule,
  modifySchedule,
  generateMCQs,
  generateNextSchedule, // ✅ ADD THIS LINE - THIS WAS MISSING!
} from "../utils/geminiClient.js";

export const createPlan = async (req, res) => {
  try {
    const { userId, learningPath, weeklyHours, preferredDays } = req.body;
    if (
      !userId ||
      !learningPath ||
      weeklyHours === undefined ||
      !preferredDays
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate types
    if (!Array.isArray(preferredDays)) {
      return res
        .status(400)
        .json({ error: "preferredDays must be an array of day names" });
    }
    if (typeof weeklyHours !== "number" && typeof weeklyHours !== "string") {
      return res
        .status(400)
        .json({ error: "weeklyHours must be a number or numeric string" });
    }
    const weeklyHoursNum = Number(weeklyHours);
    if (Number.isNaN(weeklyHoursNum) || weeklyHoursNum <= 0) {
      return res
        .status(400)
        .json({ error: "weeklyHours must be a positive number" });
    }

    const validPaths = [
      "DSA only",
      "DSA + Web Development",
      "DSA + Android Development",
      "DSA + AI/ML",
    ];
    // Accept some common synonyms (e.g., 'DSA + AI-ML') by basic keyword matching
    const lpLower = String(learningPath || "").toLowerCase();
    const looksLikeValid =
      lpLower.includes("dsa") &&
      (lpLower.includes("web") ||
        lpLower.includes("android") ||
        lpLower.includes("ai") ||
        lpLower.includes("ml") ||
        lpLower.includes("only"));
    if (!validPaths.includes(learningPath) && !looksLikeValid) {
      return res.status(400).json({ error: "Invalid learning path" });
    }

    let scheduleData;
    try {
      scheduleData = await generateSchedule(
        learningPath,
        weeklyHoursNum,
        preferredDays
      );
    } catch (err) {
      console.error("Gemini error while generating schedule:", err);
      if (err && err.code === "GEMINI_RATE_LIMIT") {
        return res
          .status(503)
          .json({
            error: "gemini_rate_limited",
            message: err.message,
            retryAfter: err.retryAfter || null,
          });
      }
      if (err && err.code === "GEMINI_PARSE_ERROR") {
        return res
          .status(502)
          .json({ error: "gemini_parse_error", message: err.message });
      }
      return res
        .status(502)
        .json({
          error: "gemini_error",
          message: err.message || "Failed to generate schedule",
        });
    }

    // Validate scheduleData format
    if (!scheduleData || !Array.isArray(scheduleData.schedule)) {
      return res
        .status(502)
        .json({ error: "gemini_parse_error", message: "Invalid schedule format from Gemini" });
    }

    // Helper: normalize subjects to allowed enum values
    const normalizeSubject = (s) => {
      if (!s) return "DSA";
      const low = String(s).toLowerCase();
      if (low.includes("web")) return "Web Development";
      if (low.includes("android")) return "Android Development";
      if (low.includes("ai") || low.includes("ml")) return "AI-ML";
      return "DSA";
    };

    const allowedDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const sanitizeDay = (d) => {
      if (!d) return "Monday";
      const match = allowedDays.find((ad) => ad.toLowerCase() === String(d).toLowerCase());
      return match || String(d);
    };

    // Sanitize schedule to remove unexpected fields (like AI-generated _id strings), coerce types
    const sanitizedSchedule = scheduleData.schedule.map((dayObj) => {
      const day = sanitizeDay(dayObj.day);
      const rawBlocks = Array.isArray(dayObj.studyBlocks) ? dayObj.studyBlocks : [];
      const studyBlocks = rawBlocks.map((b) => {
        const subj = normalizeSubject(b.subject || b.subjectName || b.type);
        const topic = b.topic || b.title || String(b.subject || "");
        const duration = Number(b.duration) || 30;
        return {
          subject: subj,
          topic: String(topic),
          duration,
          completed: Boolean(b.completed || false),
          mcqPassed: Boolean(b.mcqPassed || false),
        };
      });
      const totalMinutes = studyBlocks.reduce((s, bb) => s + (Number(bb.duration) || 0), 0);
      return {
        day,
        studyBlocks,
        totalMinutes,
      };
    });

    // Create and save plan (coerce weeklyHours to Number)
    const plan = new Plan({
      userId,
      learningPath,
      weeklyHours: weeklyHoursNum,
      preferredDays,
      schedule: sanitizedSchedule,
    });

    await plan.save();

    res.status(201).json({
      success: true,
      plan: plan,
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ error: error.message || "Failed to create plan" });
  }
};

export const modifyPlan = async (req, res) => {
  try {
    const { planId, modificationRequest } = req.body;

    if (!planId || !modificationRequest) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find existing plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // Modify schedule using Gemini AI
    let scheduleData;
    try {
      scheduleData = await modifySchedule(
        plan.schedule,
        modificationRequest,
        plan.learningPath
      );
    } catch (err) {
      console.error("Gemini error while modifying schedule:", err);
      if (err && err.code === "GEMINI_RATE_LIMIT") {
        return res
          .status(503)
          .json({
            error: "gemini_rate_limited",
            message: err.message,
            retryAfter: err.retryAfter || null,
          });
      }
      if (err && err.code === "GEMINI_PARSE_ERROR") {
        return res
          .status(502)
          .json({ error: "gemini_parse_error", message: err.message });
      }
      return res
        .status(502)
        .json({
          error: "gemini_error",
          message: err.message || "Failed to modify schedule",
        });
    }

    // Update plan
    plan.schedule = scheduleData.schedule;
    plan.updatedAt = new Date();
    await plan.save();

    res.json({
      success: true,
      plan: plan,
    });
  } catch (error) {
    console.error("Error modifying plan:", error);
    res.status(500).json({ error: error.message || "Failed to modify plan" });
  }
};

export const getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json({
      success: true,
      plan: plan,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ error: error.message || "Failed to fetch plan" });
  }
};

export const getMCQs = async (req, res) => {
  try {
    const { topic, subject } = req.body;

    if (!topic || !subject) {
      return res.status(400).json({ error: "Missing topic or subject" });
    }

    // Generate MCQs using Gemini AI
    let mcqData;
    try {
      mcqData = await generateMCQs(topic, subject);
    } catch (err) {
      console.error("Gemini error while generating MCQs:", err);
      if (err && err.code === "GEMINI_RATE_LIMIT") {
        return res
          .status(503)
          .json({
            error: "gemini_rate_limited",
            message: err.message,
            retryAfter: err.retryAfter || null,
          });
      }
      if (err && err.code === "GEMINI_PARSE_ERROR") {
        return res
          .status(502)
          .json({ error: "gemini_parse_error", message: err.message });
      }
      return res
        .status(502)
        .json({
          error: "gemini_error",
          message: err.message || "Failed to generate MCQs",
        });
    }

    res.json({
      success: true,
      mcqs: mcqData.questions || [],
    });
  } catch (error) {
    console.error("Error generating MCQs:", error);
    res.status(500).json({ error: error.message || "Failed to generate MCQs" });
  }
};

export const markBlockComplete = async (req, res) => {
  try {
    const { planId, day, blockIndex, passed } = req.body;

    if (
      !planId ||
      day === undefined ||
      blockIndex === undefined ||
      passed === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const daySchedule = plan.schedule.find((s) => s.day === day);
    if (!daySchedule || !daySchedule.studyBlocks[blockIndex]) {
      return res.status(404).json({ error: "Study block not found" });
    }

    const block = daySchedule.studyBlocks[blockIndex];
    block.completed = passed;
    block.mcqPassed = passed;

    await plan.save();

    res.json({
      success: true,
      plan: plan,
    });
  } catch (error) {
    console.error("Error marking block complete:", error);
    res.status(500).json({ error: error.message || "Failed to update block" });
  }
};

export const generateNextPeriod = async (req, res) => {
  try {
    const { planId, period } = req.body; // period: 'week' or 'month'

    if (!planId) {
      return res.status(400).json({ error: 'Missing plan ID' });
    }

    // Find existing plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Analyze completion data
    const completedBlocks = [];
    const skippedBlocks = [];
    const totalBlocks = [];

    plan.schedule.forEach((daySchedule) => {
      daySchedule.studyBlocks.forEach((block) => {
        totalBlocks.push({ ...block, day: daySchedule.day });
        if (block.completed) {
          completedBlocks.push({ ...block, day: daySchedule.day });
        } else {
          skippedBlocks.push({ ...block, day: daySchedule.day });
        }
      });
    });

    const completionRate = totalBlocks.length > 0
      ? Math.round((completedBlocks.length / totalBlocks.length) * 100)
      : 0;

    // Build analysis summary
    const analysis = {
      completionRate,
      completedCount: completedBlocks.length,
      skippedCount: skippedBlocks.length,
      totalCount: totalBlocks.length,
      strongSubjects: {},
      weakSubjects: {},
    };

    // Analyze by subject
    completedBlocks.forEach((block) => {
      analysis.strongSubjects[block.subject] =
        (analysis.strongSubjects[block.subject] || 0) + 1;
    });

    skippedBlocks.forEach((block) => {
      analysis.weakSubjects[block.subject] =
        (analysis.weakSubjects[block.subject] || 0) + 1;
    });

    // Generate new schedule using Gemini AI
    const nextSchedule = await generateNextSchedule(
      plan.learningPath,
      plan.weeklyHours,
      plan.preferredDays,
      analysis,
      period
    );

    // Create new plan
    const newPlan = new Plan({
      userId: plan.userId,
      learningPath: plan.learningPath,
      weeklyHours: plan.weeklyHours,
      preferredDays: plan.preferredDays,
      schedule: nextSchedule.schedule,
    });

    await newPlan.save();

    res.status(201).json({
      success: true,
      plan: newPlan,
      analysis,
    });
  } catch (error) {
    console.error('Error generating next period:', error);
    res.status(500).json({ error: error.message || 'Failed to generate next period' });
  }
};