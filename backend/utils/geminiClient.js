import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Validate API key on startup
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_actual_gemini_api_key_here") {
  console.error("❌ CRITICAL: GEMINI_API_KEY not set in .env file!");
  console.error("   Get your API key from: https://makersuite.google.com/app/apikey");
  console.error("   Then add it to Backend/.env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (err) => {
  const msg = String(err && (err.message || err)).toLowerCase();
  return (
    msg.includes("too many requests") ||
    msg.includes("quota") ||
    msg.includes("429") ||
    msg.includes("503")
  );
};

// ==========================================
// ROBUST JSON PARSING WITH MULTIPLE STRATEGIES
// ==========================================
const parseGeminiJSON = (text) => {
  // Strategy 1: Direct parse
  try {
    return JSON.parse(text);
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 2: Remove markdown
  try {
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^[\s\S]*?(\{)/m, "$1") // Remove text before first {
      .replace(/(\})[\s\S]*$/m, "$1") // Remove text after last }
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 3: Find JSON object
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 4: Fix common issues
  try {
    let fixed = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
      .replace(/\\n/g, " ") // Replace escaped newlines
      .replace(/\n/g, " ") // Replace actual newlines
      .trim();
    
    const jsonMatch = fixed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // All strategies failed
  }

  throw new Error("Could not parse JSON from Gemini response");
};

// ==========================================
// FALLBACK SCHEDULE (LOCAL GENERATION)
// ==========================================
const fallbackLocalSchedule = (learningPath, weeklyHours, preferredDays) => {
  console.log("⚠️  Using FALLBACK local schedule generation");
  
  const topicPools = {
    DSA: [
      "Array Manipulation & Two Pointers",
      "String Algorithms & Manipulation",
      "Linked Lists (Operations & Problems)",
      "Stacks & Queues (Applications)",
      "Trees & Binary Tree Traversals",
      "Graphs (BFS/DFS Intro)",
      "Hash Maps & Hash Tables",
      "Recursion & Backtracking",
      "Dynamic Programming Basics",
      "Sorting & Searching Algorithms",
    ],
    "Web Development": [
      "HTML Semantics & Accessibility",
      "CSS Layouts: Flexbox & Grid",
      "JavaScript Fundamentals",
      "DOM Manipulation & Events",
      "Async JavaScript & Promises",
      "React Basics & Components",
      "State Management",
      "API Integration",
    ],
    "Android Development": [
      "Android Studio & Project Setup",
      "Layouts & Views",
      "Activity Lifecycle",
      "Intents & Navigation",
      "RecyclerView & Adapters",
      "Data Persistence",
    ],
    "AI-ML": [
      "Python for ML & Libraries",
      "Data Preprocessing Techniques",
      "Supervised Learning Basics",
      "Neural Networks Intro",
      "Model Evaluation",
    ],
  };

  const totalMinutes = (Number(weeklyHours) || 0) * 60;
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const preferred =
    preferredDays && preferredDays.length ? preferredDays : daysOfWeek;
  const basePerPreferredDay = Math.max(
    30,
    Math.floor(totalMinutes / Math.max(1, preferred.length))
  );
  const secondary =
    learningPath && learningPath.includes("+")
      ? learningPath.split(" + ")[1]
      : null;

  const pick = (subject, idx) => {
    const pool = topicPools[subject] || topicPools["DSA"];
    return pool[idx % pool.length];
  };

  const schedule = daysOfWeek.map((day, dayIdx) => {
    const isPreferred = preferred.includes(day);
    const dayMinutes = isPreferred
      ? basePerPreferredDay
      : Math.max(30, Math.floor(basePerPreferredDay / 2));
    const blocks = [];

    // DSA primary block
    blocks.push({
      subject: "DSA",
      topic: pick("DSA", dayIdx),
      duration: Math.min(90, Math.floor(dayMinutes * 0.6)),
      completed: false,
      mcqPassed: false,
    });

    const remaining = Math.max(0, dayMinutes - blocks[0].duration);

    if (secondary && remaining > 20) {
      blocks.push({
        subject: secondary,
        topic: pick(secondary, dayIdx),
        duration: Math.max(20, remaining),
        completed: false,
        mcqPassed: false,
      });
    } else if (remaining > 20) {
      blocks.push({
        subject: "DSA",
        topic: pick("DSA", dayIdx + 3),
        duration: remaining,
        completed: false,
        mcqPassed: false,
      });
    }

    const totalForDay = blocks.reduce((s, b) => s + (b.duration || 0), 0);
    if (totalForDay < 30) {
      blocks.push({
        subject: "DSA",
        topic: "Quick Practice & Review",
        duration: 30 - totalForDay,
        completed: false,
        mcqPassed: false,
      });
    }

    return {
      day,
      studyBlocks: blocks,
      totalMinutes: blocks.reduce((s, b) => s + (b.duration || 0), 0),
    };
  });

  return { schedule };
};

// ==========================================
// GENERATE INITIAL SCHEDULE
// ==========================================
export const generateSchedule = async (
  learningPath,
  weeklyHours,
  preferredDays
) => {
  try {
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_actual_gemini_api_key_here") {
      console.error("❌ Gemini API key not configured, using fallback");
      return fallbackLocalSchedule(learningPath, weeklyHours, preferredDays);
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent JSON
        maxOutputTokens: 3000,
        responseMimeType: "application/json", // Request JSON format
      },
    });

    const prompt = `You are a study schedule generator. Create a 7-day weekly schedule.

Learning Path: ${learningPath}
Weekly Hours: ${weeklyHours}
Preferred Days: ${preferredDays.join(", ")}

CRITICAL RULES:
1. DSA topic MUST appear EVERY single day
2. ${learningPath === "DSA only" ? "Only DSA topics" : `Split time between DSA and ${learningPath.split(" + ")[1]}`}
3. 2-3 study blocks per day
4. Each day should have ${Math.floor((weeklyHours * 60) / 7)} minutes total
5. Return ONLY valid JSON, no explanations

Return this EXACT structure:
{
  "schedule": [
    {
      "day": "Monday",
      "studyBlocks": [
        {
          "subject": "DSA",
          "topic": "Arrays and Two Pointers",
          "duration": 90,
          "completed": false,
          "mcqPassed": false
        }
      ],
      "totalMinutes": 90
    }
  ]
}

Generate for all 7 days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.`;

    let attempt = 0;
    let text;

    while (attempt < 3) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text().trim();
        
        if (!text) {
          throw new Error("Empty response from Gemini");
        }
        
        break;
      } catch (err) {
        attempt++;
        console.error(`generateSchedule attempt ${attempt} failed:`, err.message);

        if (isRateLimitError(err) || err.message?.includes("API key")) {
          if (attempt >= 3) {
            console.error("❌ Gemini API failed after 3 attempts, using local fallback");
            return fallbackLocalSchedule(learningPath, weeklyHours, preferredDays);
          }
          await sleep(2000 * attempt); // Exponential backoff
          continue;
        }
        
        // For any other error, use fallback immediately
        console.error("❌ Gemini error, using local fallback:", err.message);
        return fallbackLocalSchedule(learningPath, weeklyHours, preferredDays);
      }
    }

    // Parse JSON with robust error handling
    let scheduleData;
    try {
      scheduleData = parseGeminiJSON(text);
    } catch (parseError) {
      console.error("Failed to parse JSON from Gemini:", parseError.message);
      console.error("Raw response:", text.substring(0, 500));
      return fallbackLocalSchedule(learningPath, weeklyHours, preferredDays);
    }

    // Validate and sanitize
    if (!scheduleData || !Array.isArray(scheduleData.schedule)) {
      console.error("Invalid schedule structure from Gemini");
      return fallbackLocalSchedule(learningPath, weeklyHours, preferredDays);
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const scheduleMap = new Map(scheduleData.schedule.map((d) => [d.day, d]));

    const completeSchedule = days.map((day) => {
      const dayData = scheduleMap.get(day) || {
        day,
        studyBlocks: [
          { subject: "DSA", topic: "Review & Practice", duration: 60, completed: false, mcqPassed: false },
        ],
        totalMinutes: 60,
      };

      // Ensure each block has required fields
      dayData.studyBlocks = (dayData.studyBlocks || []).map(block => ({
        subject: block.subject || "DSA",
        topic: block.topic || "Practice",
        duration: block.duration || 30,
        completed: block.completed || false,
        mcqPassed: block.mcqPassed || false,
      }));

      const hasDSA = dayData.studyBlocks.some((b) => b.subject === "DSA");
      if (!hasDSA) {
        dayData.studyBlocks.unshift({
          subject: "DSA",
          topic: "Daily Practice",
          duration: 30,
          completed: false,
          mcqPassed: false,
        });
      }

      dayData.totalMinutes = dayData.studyBlocks.reduce((s, b) => s + (b.duration || 0), 0);
      return dayData;
    });

    console.log("✅ Successfully generated schedule with Gemini AI");
    return { schedule: completeSchedule };
  } catch (error) {
    console.error("❌ Error generating schedule:", error.message);
    return fallbackLocalSchedule(learningPath, weeklyHours, preferredDays);
  }
};

// ==========================================
// MODIFY EXISTING SCHEDULE
// ==========================================
export const modifySchedule = async (
  currentSchedule,
  modificationRequest,
  learningPath
) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_actual_gemini_api_key_here") {
      throw new Error("Gemini API key not configured");
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 3000,
        responseMimeType: "application/json",
      },
    });

    const prompt = `You are a study schedule modifier. Modify this schedule based on user request.

Current Schedule: ${JSON.stringify(currentSchedule, null, 2)}

User Request: "${modificationRequest}"

Learning Path: ${learningPath}

RULES:
1. Keep DSA in every day
2. Maintain the ${learningPath} focus
3. Apply the user's modification
4. Return all 7 days

Return ONLY this JSON structure:
{
  "schedule": [
    {
      "day": "Monday",
      "studyBlocks": [
        {
          "subject": "DSA",
          "topic": "...",
          "duration": 90,
          "completed": false,
          "mcqPassed": false
        }
      ],
      "totalMinutes": 90
    }
  ]
}`;

    let attempt = 0;
    let text;

    while (attempt < 3) {
      try {
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
        
        if (!text) {
          throw new Error("Empty response");
        }
        
        break;
      } catch (err) {
        attempt++;
        if (isRateLimitError(err)) {
          if (attempt >= 3) throw err;
          await sleep(2000 * attempt);
          continue;
        }
        throw err;
      }
    }

    const scheduleData = parseGeminiJSON(text);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const scheduleMap = new Map(scheduleData.schedule.map((d) => [d.day, d]));

    const completeSchedule = days.map((day) => {
      const dayData = scheduleMap.get(day) || {
        day,
        studyBlocks: [{ subject: "DSA", topic: "Review", duration: 60, completed: false, mcqPassed: false }],
        totalMinutes: 60,
      };

      dayData.studyBlocks = (dayData.studyBlocks || []).map(block => ({
        subject: block.subject || "DSA",
        topic: block.topic || "Practice",
        duration: block.duration || 30,
        completed: block.completed || false,
        mcqPassed: block.mcqPassed || false,
      }));

      const hasDSA = dayData.studyBlocks.some((b) => b.subject === "DSA");
      if (!hasDSA) {
        dayData.studyBlocks.unshift({
          subject: "DSA",
          topic: "Daily Review",
          duration: 30,
          completed: false,
          mcqPassed: false,
        });
      }

      dayData.totalMinutes = dayData.studyBlocks.reduce((s, b) => s + (b.duration || 0), 0);
      return dayData;
    });

    console.log("✅ Successfully modified schedule");
    return { schedule: completeSchedule };
  } catch (error) {
    console.error("Error modifying schedule:", error);
    throw error;
  }
};

// ==========================================
// GENERATE MCQs (REAL QUESTIONS!)
// ==========================================
export const generateMCQs = async (topic, subject) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_actual_gemini_api_key_here") {
      console.warn("⚠️  Gemini API key not set, using fallback MCQs");
      return {
        questions: [
          {
            question: `What is the primary concept behind ${topic}?`,
            options: [
              "It's a fundamental algorithm technique",
              "It's only used in interviews",
              "It's deprecated in modern programming",
              "It's specific to one programming language"
            ],
            correctAnswer: 0,
            explanation: `${topic} is a fundamental technique used across programming. Study the concept and try again with real AI-generated questions by setting up your Gemini API key.`
          },
          {
            question: `Which scenario is best suited for ${topic}?`,
            options: [
              "When you need efficient solutions",
              "When you want slow algorithms",
              "When you don't care about performance",
              "When you want to write more code"
            ],
            correctAnswer: 0,
            explanation: "The correct approach focuses on efficiency and optimal solutions."
          },
          {
            question: `What is a key advantage of mastering ${topic}?`,
            options: [
              "Better problem-solving skills",
              "Worse code quality",
              "Slower execution time",
              "More bugs in code"
            ],
            correctAnswer: 0,
            explanation: "Mastering this concept improves your overall programming abilities."
          },
          {
            question: `In ${subject}, how important is ${topic}?`,
            options: [
              "Very important for technical interviews and real projects",
              "Not important at all",
              "Only matters in textbooks",
              "Completely irrelevant"
            ],
            correctAnswer: 0,
            explanation: "This is a crucial concept for both learning and practical applications."
          }
        ]
      };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
      },
    });

    const prompt = `Generate 4 high-quality multiple-choice questions about "${topic}" in ${subject}.

Requirements:
- Exactly 4 questions
- Each question should test real understanding, not just memorization
- Include practical scenarios and code concepts
- Options should be plausible but with one clear correct answer
- Provide brief explanations

Return ONLY this JSON structure:
{
  "questions": [
    {
      "question": "What is the time complexity of...",
      "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`;

    let attempt = 0;
    let text;

    while (attempt < 3) {
      try {
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
        
        if (!text) {
          throw new Error("Empty response");
        }
        
        break;
      } catch (err) {
        attempt++;
        if (isRateLimitError(err)) {
          if (attempt >= 3) {
            console.warn("⚠️  Rate limited, using fallback MCQs");
            return {
              questions: Array(4).fill(0).map((_, i) => ({
                question: `${topic} - Question ${i + 1}: What is an important aspect of this concept?`,
                options: ["Understanding the fundamentals", "Ignoring best practices", "Avoiding optimization", "Writing complex code unnecessarily"],
                correctAnswer: 0,
                explanation: "Focus on understanding core concepts and best practices."
              }))
            };
          }
          await sleep(2000 * attempt);
          continue;
        }
        throw err;
      }
    }

    const mcqData = parseGeminiJSON(text);

    if (!mcqData.questions || !Array.isArray(mcqData.questions)) {
      throw new Error("Invalid MCQ structure");
    }

    // Ensure exactly 4 questions
    if (mcqData.questions.length > 4) {
      mcqData.questions = mcqData.questions.slice(0, 4);
    } else if (mcqData.questions.length < 4) {
      // Pad with generic questions if needed
      while (mcqData.questions.length < 4) {
        mcqData.questions.push({
          question: `Additional practice question about ${topic}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: "This is a supplementary question."
        });
      }
    }

    console.log("✅ Successfully generated real MCQs with Gemini AI");
    return mcqData;
  } catch (error) {
    console.error("Error generating MCQs:", error.message);
    return {
      questions: Array(4).fill(0).map((_, i) => ({
        question: `${topic} - Practice Question ${i + 1}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "Fallback question - set up Gemini API key for real questions."
      }))
    };
  }
};

// ==========================================
// GENERATE NEXT SCHEDULE
// ==========================================
export const generateNextSchedule = async (
  learningPath,
  weeklyHours,
  preferredDays,
  analysis,
  period = "week"
) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_actual_gemini_api_key_here") {
      console.warn("⚠️  Using fallback for next schedule");
      return fallbackLocalSchedule(learningPath, weeklyHours, preferredDays);
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 3000,
        responseMimeType: "application/json",
      },
    });

    const durationText = period === "month" ? "month" : "week";

    const prompt = `Generate an optimized ${durationText} study schedule based on past performance.

User Profile:
- Learning Path: ${learningPath}
- Weekly Hours: ${weeklyHours}
- Preferred Days: ${preferredDays.join(", ")}

Past Performance Analysis:
- Completion Rate: ${analysis.completionRate}%
- Topics Completed: ${analysis.completedCount}
- Topics Skipped: ${analysis.skippedCount}

Optimization Strategy:
${analysis.completionRate < 50 ? "- Reduce workload - user is struggling" : "- Maintain or slightly increase difficulty"}
- Focus more on weak areas
- Keep DSA every day

Return ONLY this JSON structure for all 7 days:
{
  "schedule": [
    {
      "day": "Monday",
      "studyBlocks": [
        {
          "subject": "DSA",
          "topic": "...",
          "duration": 90,
          "completed": false,
          "mcqPassed": false
        }
      ],
      "totalMinutes": 90
    }
  ]
}`;

    let attempt = 0;
    let text;

    while (attempt < 3) {
      try {
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
        
        if (!text) {
          throw new Error("Empty response");
        }
        
        break;
      } catch (err) {
        attempt++;
        if (isRateLimitError(err)) {
          if (attempt >= 3) {
            return fallbackLocalSchedule(learningPath, weeklyHours, preferredDays);
          }
          await sleep(2000 * attempt);
          continue;
        }
        throw err;
      }
    }

    const scheduleData = parseGeminiJSON(text);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const scheduleMap = new Map(scheduleData.schedule.map((d) => [d.day, d]));

    const completeSchedule = days.map((day) => {
      const dayData = scheduleMap.get(day) || {
        day,
        studyBlocks: [{ subject: "DSA", topic: "Review", duration: 60, completed: false, mcqPassed: false }],
        totalMinutes: 60,
      };
      
      dayData.studyBlocks = (dayData.studyBlocks || []).map(block => ({
        subject: block.subject || "DSA",
        topic: block.topic || "Practice",
        duration: block.duration || 30,
        completed: block.completed || false,
        mcqPassed: block.mcqPassed || false,
      }));
      
      dayData.totalMinutes = dayData.studyBlocks.reduce((s, b) => s + (b.duration || 0), 0);
      return dayData;
    });

    console.log("✅ Successfully generated next period schedule");
    return { schedule: completeSchedule };
  } catch (error) {
    console.error("Error generating next schedule:", error.message);
    return fallbackLocalSchedule(learningPath, weeklyHours, preferredDays);
  }
};