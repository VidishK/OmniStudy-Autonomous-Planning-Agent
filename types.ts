
export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED'
}

export interface StudyTask {
  id: string;
  topic: string;
  description: string;
  durationHours: number;
  priority: 'High' | 'Medium' | 'Low';
  week: number;
  day: number; // 1-7
  status: TaskStatus;
}

export interface StudyPlan {
  tasks: StudyTask[];
  agentRational: string;
}

export interface UserConstraints {
  syllabus: string;
  hoursPerWeek: number;
  deadlineDate: string;
  startDate: string;
}

export interface RebalanceLog {
  id: string;
  timestamp: number;
  reason: string;
  previousTaskCount: number;
  newTaskCount: number;
}
