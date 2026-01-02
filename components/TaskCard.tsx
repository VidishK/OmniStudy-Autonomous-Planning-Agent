
import React from 'react';
import { StudyTask, TaskStatus } from '../types';

interface Props {
  task: StudyTask;
  onStatusUpdate: (status: TaskStatus) => void;
}

const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const TaskCard: React.FC<Props> = ({ task, onStatusUpdate }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isMissed = task.status === TaskStatus.MISSED;

  return (
    <div className={`bg-white rounded-2xl border transition-all ${
      isCompleted ? 'opacity-60 grayscale' : 'hover:border-indigo-300 shadow-sm'
    } ${isMissed ? 'border-rose-200 bg-rose-50' : 'border-slate-100'}`}>
      <div className="p-5 flex gap-4">
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Day</span>
          <span className="text-2xl font-black text-slate-800">{task.day}</span>
          <span className="text-[10px] font-bold text-slate-400">{DAY_NAMES[task.day] || "Anyday"}</span>
        </div>
        
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 
                  task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {task.priority} Priority
                </span>
                <span className="text-[10px] font-bold text-slate-400">{task.durationHours} hrs</span>
              </div>
              <h4 className="text-lg font-bold text-slate-800">{task.topic}</h4>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => onStatusUpdate(isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED)}
                className={`p-2 rounded-lg transition-all ${
                  isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
                title="Mark Completed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => onStatusUpdate(isMissed ? TaskStatus.PENDING : TaskStatus.MISSED)}
                className={`p-2 rounded-lg transition-all ${
                  isMissed ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                }`}
                title="Mark Missed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
