
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
}

export interface StudySession {
  date: string;
  time_block_label: string;
  planned_minutes: number;
  tasks: StudyTask[];
}

export interface StudyWeek {
  week_start: string;
  week_goals: string[];
  sessions: StudySession[];
}

export interface OverloadFlag {
  week_start: string;
  reason: string;
  hours_scheduled: number;
  hours_available: number;
}

export interface DecisionEntry {
  date: string;
  triggers: string[];
  changes: string[];
  why: string[];
  tradeoffs: string[];
}

export interface StudyPlanOS {
  plan_horizon_weeks: number;
  assumptions: string[];
  backlog_hours: number;
  overload_flags: OverloadFlag[];
  study_plan: StudyWeek[];
  updates: {
    completed_task_ids: string[];
    missed_task_ids: string[];
    rescheduled_task_ids: string[];
    dropped_task_ids: string[];
  };
  decision_log: DecisionEntry[];
  next_actions: string[];
}

export interface UserConstraints {
  syllabus: string;
  hoursPerWeek: number;
  deadlineDate: string;
  startDate: string;
  availabilityDetails?: string;
}
