
export type TaskType = "reading" | "problem_set" | "project" | "review" | "practice_exam" | "admin";
export type TaskStatus = "planned" | "completed" | "missed" | "rescheduled" | "dropped";

export interface StudyTask {
  task_id: string;
  title: string;
  course: string;
  type: TaskType;
  deliverable: string;
  est_minutes: number;
  difficulty_1to5: number;
  priority_1to5: number;
  deadline: string | null;
  status: TaskStatus;
  depends_on: string[];
  reasoning?: string; 
  why_scheduled_here?: string;
}

export interface StudySession {
  date: string;
  time_block_label: string;
  start_time: string; 
  end_time: string;   
  planned_minutes: number;
  tasks: StudyTask[];
}

export interface StudyWeek {
  week_start: string;
  week_goals: string[];
  sessions: StudySession[];
}

export interface StudyPlanOS {
  option_name: string;
  rationale: string; // The "Why" for this specific strategy
  pedagogical_efficiency: number; // 0-100 score
  study_plan: StudyWeek[];
}

export interface BacklogTask {
  task_id: string;
  title: string;
  missed_date: string;
  est_minutes: number;
}

export interface StudyPlanResponse {
  plan_horizon_weeks: number;
  assumptions: string[];
  backlog_hours: number;
  health_status: "green" | "yellow" | "red";
  health_reason: string;
  schedule_options: StudyPlanOS[];
  backlog_tasks: BacklogTask[];
  next_actions: string[];
}

export interface UserConstraints {
  weeklyTopics: string;
  readings: string;
  assignments: string;
  examsGrading: string;
  importantDates: string;
  policies: string;
  studentPreferences: string;
  fixedCommitments: string; 
  preferredFocusHours: string; 
  allowOverride: boolean; 
  hoursPerWeek: number;
  deadlineDate: string;
  startDate: string;
}

