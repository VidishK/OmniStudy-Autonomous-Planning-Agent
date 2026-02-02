
import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlanResponse, UserConstraints } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';
const EXTRACTION_MODEL = 'gemini-3-flash-preview';

function getAIClient() {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey.length < 10) {
    throw new Error("MISSING_API_KEY: The Gemini API key is not configured in the environment. Please add API_KEY to your .env file or environment variables.");
  }
  return new GoogleGenAI({ apiKey });
}

const SYSTEM_PROMPT = `
You are the StudyPlanOS Academic Intelligence Core. You are an elite academic strategist designed to optimize student performance across an entire semester.

CORE STRATEGIC MISSION:
1. SEMESTER CHRONOLOGY: You MUST generate a plan that covers every single week from START_DATE to END_DATE. Week 1 begins exactly on START_DATE.
2. SYLLABUS INTEGRATION: Take the "Weekly Topics" list and map exactly one topic block to each sequential week of the semester. Every task title MUST reflect actual course content from the provided syllabus.
3. DOCTRINE RIGOR:
   - "Weekend Warrior": This is an EXTREME concentration. All studying MUST happen ONLY on Saturday and Sunday. 
     - Monday through Friday MUST have ZERO (0) tasks.
     - Sat: 09:00-13:00 (Deep Focus) and 15:00-18:00 (Application). 
     - Sun: 10:00-14:00 (Review/Finish). 
   - "Balanced Mastery": 4 sessions/week (e.g., Mon, Tue, Thu, Sat).
   - "Deadline-First": Heavy load in the 7 days preceding any assignment due date found in the syllabus.
4. PEDAGOGICAL PHASES: For every week's topic, schedule: 1. "Content Absorption", 2. "Active Practice", 3. "Self-Testing".
5. LIMITS: Total minutes/week MUST NOT exceed user's hoursPerWeek.

OUTPUT: Return 4 strategies. Each MUST have a 'rationale' explaining why that specific distribution was chosen for the student's constraints.
`;

const taskSchema = {
  type: Type.OBJECT,
  properties: {
    task_id: { type: Type.STRING },
    title: { type: Type.STRING },
    course: { type: Type.STRING },
    type: { type: Type.STRING, enum: ["reading", "problem_set", "project", "review", "practice_exam", "admin"] },
    deliverable: { type: Type.STRING },
    est_minutes: { type: Type.NUMBER },
    difficulty_1to5: { type: Type.NUMBER },
    priority_1to5: { type: Type.NUMBER },
    deadline: { type: Type.STRING, nullable: true },
    status: { type: Type.STRING, enum: ["planned", "completed", "missed", "rescheduled", "dropped"] },
    depends_on: { type: Type.ARRAY, items: { type: Type.STRING } },
    why_scheduled_here: { type: Type.STRING }
  },
  required: ["task_id", "title", "course", "type", "est_minutes", "status", "why_scheduled_here"]
};

const sessionSchema = {
  type: Type.OBJECT,
  properties: {
    date: { type: Type.STRING },
    time_block_label: { type: Type.STRING },
    start_time: { type: Type.STRING },
    end_time: { type: Type.STRING },
    planned_minutes: { type: Type.NUMBER },
    tasks: { type: Type.ARRAY, items: taskSchema }
  },
  required: ["date", "start_time", "end_time", "planned_minutes", "tasks"]
};

const weekSchema = {
  type: Type.OBJECT,
  properties: {
    week_start: { type: Type.STRING },
    week_goals: { type: Type.ARRAY, items: { type: Type.STRING } },
    sessions: { type: Type.ARRAY, items: sessionSchema }
  },
  required: ["week_start", "week_goals", "sessions"]
};

const optionSchema = {
  type: Type.OBJECT,
  properties: {
    option_name: { type: Type.STRING },
    rationale: { type: Type.STRING },
    pedagogical_efficiency: { type: Type.NUMBER },
    study_plan: { type: Type.ARRAY, items: weekSchema }
  },
  required: ["option_name", "rationale", "pedagogical_efficiency", "study_plan"]
};

const mainResponseSchema = {
  type: Type.OBJECT,
  properties: {
    plan_horizon_weeks: { type: Type.NUMBER },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    backlog_hours: { type: Type.NUMBER },
    health_status: { type: Type.STRING, enum: ["green", "yellow", "red"] },
    health_reason: { type: Type.STRING },
    schedule_options: { type: Type.ARRAY, items: optionSchema },
    backlog_tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task_id: { type: Type.STRING },
          title: { type: Type.STRING },
          missed_date: { type: Type.STRING },
          est_minutes: { type: Type.NUMBER }
        }
      }
    },
    next_actions: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["plan_horizon_weeks", "assumptions", "health_status", "schedule_options", "next_actions"]
};

const syllabusExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    weeklyTopics: { type: Type.STRING },
    readings: { type: Type.STRING },
    assignments: { type: Type.STRING },
    examsGrading: { type: Type.STRING },
    importantDates: { type: Type.STRING },
    deadline: { type: Type.STRING }
  },
  required: ["weeklyTopics", "assignments", "deadline"]
};

export async function parseSyllabus(rawText: string): Promise<Partial<UserConstraints>> {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: EXTRACTION_MODEL,
    contents: `Extract structured course data from this raw syllabus text: \n\n${rawText}`,
    config: {
      systemInstruction: "Extract academic details precisely. Format 'weeklyTopics' as a line-separated list of Week 1, Week 2... etc. Extract the semester end date as 'deadline' in YYYY-MM-DD format.",
      responseMimeType: "application/json",
      responseSchema: syllabusExtractionSchema,
    },
  });
  return JSON.parse(response.text || "{}");
}

export async function generateInitialPlan(constraints: UserConstraints): Promise<StudyPlanResponse> {
  const ai = getAIClient();
  const prompt = `
    GENERATE FULL SEMESTER STUDY ARCHITECTURE:
    START DATE: ${constraints.startDate}
    END DATE: ${constraints.deadlineDate}
    CAPACITY: ${constraints.hoursPerWeek} hours/week.
    
    REQUIRED SYLLABUS DATA:
    1. Weekly Topics: ${constraints.weeklyTopics}
    2. Assignments: ${constraints.assignments}
    3. Readings: ${constraints.readings}
    4. Exams: ${constraints.examsGrading}
    5. Dates: ${constraints.importantDates}
    
    IMPORTANT: Map 'Weekly Topics' sequentially to EACH week. For 'Weekend Warrior', ensure Monday-Friday has 0 sessions.
  `;
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: mainResponseSchema,
      thinkingConfig: { thinkingBudget: 32000 }
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function adjustPlanOS(currentPlan: StudyPlanResponse, command: string, constraints: UserConstraints): Promise<StudyPlanResponse> {
  const ai = getAIClient();
  const prompt = `
    MODIFICATION COMMAND: "${command}"
    Update the semester trajectory while keeping syllabus data synced.
    Current state: ${JSON.stringify(currentPlan)}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: mainResponseSchema,
      thinkingConfig: { thinkingBudget: 24000 }
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function rebalancePlanOS(currentPlan: any, constraints: UserConstraints): Promise<StudyPlanResponse> {
  return generateInitialPlan(constraints);
}

