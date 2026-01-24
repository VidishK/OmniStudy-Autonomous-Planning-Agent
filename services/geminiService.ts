
import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlanResponse, UserConstraints } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

const SYSTEM_PROMPT = `
You are StudyPlanOS, an autonomous academic logistics engine. 
You are NOT a chatbot. You generate high-precision, structured study schedules.

DISTRIBUTION PROTOCOLS:
1. FULL COVERAGE: You must generate sessions for EVERY week between START_DATE and END_DATE. 
2. WEEKLY DISTRIBUTION: Do not cluster all tasks in the middle of the week unless the variant specifically asks for it.
3. WEEKEND-HEAVY LOGIC: Shift 70-80% of the total weekly study hours to Friday, Saturday, and Sunday. Weekdays (Mon-Thu) should only contain light review or administrative tasks.
4. BALANCED LOGIC: Distribute hours as evenly as possible across all 7 days of the week.
5. NO-STUDY DAYS: Strictly respect user-defined no-study days by leaving those dates completely empty in the 'sessions' array.

JSON STRUCTURE RULES:
- Provide exactly 4 distinct variants: "Balanced", "Deadline-First", "Morning-Heavy", "Weekend-Heavy".
- Every session MUST have a valid YYYY-MM-DD date within the range.
- Every task MUST have a reasoning string explaining why it's scheduled on that specific day.
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
    start_time: { type: Type.STRING },
    end_time: { type: Type.STRING },
    planned_minutes: { type: Type.NUMBER },
    time_block_label: { type: Type.STRING },
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
    study_plan: { type: Type.ARRAY, items: weekSchema }
  },
  required: ["option_name", "study_plan"]
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

export async function generateInitialPlan(constraints: UserConstraints): Promise<StudyPlanResponse> {
  const prompt = `
    TASK: GENERATE COMPREHENSIVE STUDY PLAN OPTIONS.
    
    TIMELINE: ${constraints.startDate} to ${constraints.deadlineDate}
    MAX HOURS: ${constraints.hoursPerWeek} hrs/week
    
    ACADEMIC INPUTS:
    - TOPICS: ${constraints.weeklyTopics}
    - READINGS: ${constraints.readings}
    - ASSIGNMENTS: ${constraints.assignments}
    - GRADING: ${constraints.examsGrading}
    
    STUDENT CONSTRAINTS:
    - PREFS: ${constraints.studentPreferences}
    - FIXED COMMITMENTS (NO STUDY): ${constraints.fixedCommitments}
    - ENERGY WINDOWS: ${constraints.preferredFocusHours}
    
    MANDATORY: 
    1. For the "Weekend-Heavy" variant, ensure Saturday and Sunday are the primary study days (4-6 hours each), while Monday-Thursday have minimal or no tasks.
    2. For the "Balanced" variant, distribute the ${constraints.hoursPerWeek} hours across at least 5-6 days per week.
    3. Generate a complete schedule for every single week in the range. Do not truncate the timeline.
  `;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

  const text = response.text || "{}";
  const result = JSON.parse(text.replace(/```json|```/g, "").trim());
  
  // Ensure we return exactly what the app expects
  return result;
}

export async function rebalancePlanOS(currentPlan: any, constraints: UserConstraints): Promise<StudyPlanResponse> {
  return generateInitialPlan(constraints);
}
