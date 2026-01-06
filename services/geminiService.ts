
import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlanOS, UserConstraints } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
const MODEL_NAME = 'gemini-3-pro-preview';

const SYSTEM_PROMPT = `
You are StudyPlanOS, an autonomous study planning agent. You are NOT a chatbot.
Your job is to produce and maintain an evolving multi-week study plan based on a syllabus, deadlines, and available study hours.

CRITICAL DATE ALIGNMENT:
- The first day of "Week 1" MUST be the exact 'startDate' provided by the user. 
- You must populate sessions starting from that day forward. Do not skip days unless the user's availability details specify it.
- If there is work to be done, it should start immediately in Week 1.

Core behavior:
- You make planning decisions proactively.
- You output structured plans and updates in JSON format.
- You detect overload/backlog and automatically rebalance future sessions.
- You always explain why changes were made in a concise decision log.

Planning principles:
1) Respect hard deadlines.
2) distributed practice over cramming.
3) Avoid cognitive overload (max 2 high-difficulty tasks back-to-back).
4) When a task is "missed", move it to a future session or mark it as "rescheduled" and adjust the remaining plan to fit.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    plan_horizon_weeks: { type: Type.NUMBER },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    backlog_hours: { type: Type.NUMBER },
    overload_flags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week_start: { type: Type.STRING },
          reason: { type: Type.STRING },
          hours_scheduled: { type: Type.NUMBER },
          hours_available: { type: Type.NUMBER }
        }
      }
    },
    study_plan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week_start: { type: Type.STRING },
          week_goals: { type: Type.ARRAY, items: { type: Type.STRING } },
          sessions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                time_block_label: { type: Type.STRING },
                planned_minutes: { type: Type.NUMBER },
                tasks: {
                  type: Type.ARRAY,
                  items: {
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
                      depends_on: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    updates: {
      type: Type.OBJECT,
      properties: {
        completed_task_ids: { type: Type.ARRAY, items: { type: Type.STRING } },
        missed_task_ids: { type: Type.ARRAY, items: { type: Type.STRING } },
        rescheduled_task_ids: { type: Type.ARRAY, items: { type: Type.STRING } },
        dropped_task_ids: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    decision_log: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
          changes: { type: Type.ARRAY, items: { type: Type.STRING } },
          why: { type: Type.ARRAY, items: { type: Type.STRING } },
          tradeoffs: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    next_actions: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
};

export async function generateInitialPlan(constraints: UserConstraints): Promise<StudyPlanOS> {
  const prompt = `
    INITIAL PLAN REQUEST:
    SYLLABUS: ${constraints.syllabus}
    START DATE: ${constraints.startDate} (WEEK 1 MUST START HERE)
    DEADLINES: Target completion by ${constraints.deadlineDate}
    AVAILABILITY: Total ${constraints.hoursPerWeek} hours/week.
    ${constraints.availabilityDetails || ''}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 4000 }
    },
  });

  return JSON.parse(response.text);
}

export async function rebalancePlanOS(
  currentPlan: StudyPlanOS, 
  constraints: UserConstraints
): Promise<StudyPlanOS> {
  const prompt = `
    REBALANCE REQUEST:
    CURRENT STATE: ${JSON.stringify(currentPlan)}
    CONSTRAINTS: ${JSON.stringify(constraints)}
    
    ACTION:
    Analyze status updates. Any tasks marked "missed" should be moved to the next available session or tomorrow.
    Update the decision log to explain how you moved the missed tasks.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 4000 }
    },
  });

  return JSON.parse(response.text);
}
