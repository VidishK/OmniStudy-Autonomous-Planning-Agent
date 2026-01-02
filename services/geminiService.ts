
import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlan, UserConstraints, StudyTask, TaskStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
const MODEL_NAME = 'gemini-3-pro-preview';

const planSchema = {
  type: Type.OBJECT,
  properties: {
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          topic: { type: Type.STRING },
          description: { type: Type.STRING },
          durationHours: { type: Type.NUMBER },
          priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          week: { type: Type.INTEGER },
          day: { type: Type.INTEGER },
          status: { type: Type.STRING, enum: ['PENDING'] }
        },
        required: ['id', 'topic', 'durationHours', 'week', 'day', 'status']
      }
    },
    agentRational: {
      type: Type.STRING,
      description: "Explanation of why this plan was structured this way."
    }
  },
  required: ['tasks', 'agentRational']
};

export async function generateInitialPlan(constraints: UserConstraints): Promise<StudyPlan> {
  const prompt = `
    Act as a professional academic success agent. 
    Analyze the following syllabus and constraints to create a detailed multi-week study plan.
    
    SYLLABUS:
    ${constraints.syllabus}
    
    CONSTRAINTS:
    - Start Date: ${constraints.startDate}
    - Final Deadline: ${constraints.deadlineDate}
    - Study Capacity: ${constraints.hoursPerWeek} hours per week.
    
    Rules:
    1. Break the syllabus into logical study blocks (tasks).
    2. Assign each task a specific week and day (1-7).
    3. Ensure the total hours per week do not significantly exceed the user's capacity.
    4. Prioritize difficult topics early.
    5. Each task must have a unique ID.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: planSchema,
      thinkingConfig: { thinkingBudget: 2000 }
    },
  });

  return JSON.parse(response.text);
}

export async function rebalancePlan(
  currentPlan: StudyPlan, 
  constraints: UserConstraints, 
  currentWeek: number
): Promise<StudyPlan> {
  const completedTasks = currentPlan.tasks.filter(t => t.status === TaskStatus.COMPLETED);
  const missedTasks = currentPlan.tasks.filter(t => t.status === TaskStatus.MISSED);
  const pendingTasks = currentPlan.tasks.filter(t => t.status === TaskStatus.PENDING);

  const prompt = `
    Act as an autonomous rebalancing agent. 
    The user has a study plan, but some tasks were missed or the schedule needs adjustment.
    
    CURRENT STATE:
    - Current Week: ${currentWeek}
    - Completed Tasks: ${completedTasks.length}
    - Missed Tasks: ${missedTasks.length}
    - Remaining Tasks: ${pendingTasks.length}
    - User Capacity: ${constraints.hoursPerWeek} hours/week
    
    SYLLABUS CONTEXT:
    ${constraints.syllabus}

    OBJECTIVE:
    1. Move missed tasks into future slots.
    2. If the user is overloaded (too many tasks in future weeks), prioritize high-value syllabus items and consolidate minor ones.
    3. Recalculate the schedule for all tasks from Week ${currentWeek} onwards.
    4. Provide a clear "agentRational" explaining what you changed and why (e.g., 'Compacted Week 4 to accommodate missed calculus units from Week 2').
    
    DATA:
    ${JSON.stringify(pendingTasks.concat(missedTasks))}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: planSchema,
      thinkingConfig: { thinkingBudget: 4000 }
    },
  });

  // Merge the updated future tasks with the already completed history
  const updatedResult: StudyPlan = JSON.parse(response.text);
  return {
    agentRational: updatedResult.agentRational,
    tasks: [
      ...completedTasks,
      ...updatedResult.tasks.map(t => ({ ...t, status: t.status || TaskStatus.PENDING }))
    ]
  };
}
