
import React from 'react';
import { StudyTask, TaskStatus } from '../types';

interface Props {
  task: StudyTask;
  onStatusUpdate: (status: TaskStatus) => void;
  onUpdateTask: (task: StudyTask) => void;
  onDeleteTask: () => void;
}

const TYPE_CONFIG: Record<string, { color: string; icon: string }> = {
  reading: { color: 'border-blue-500/20 text-blue-400 bg-blue-500/5', icon: '📖' },
  problem_set: { color: 'border-amber-500/20 text-amber-400 bg-amber-500/5', icon: '🔢' },
  project: { color: 'border-purple-500/20 text-purple-400 bg-purple-500/5', icon: '🛠️' },
  review: { color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5', icon: '🧠' },
  practice_exam: { color: 'border-rose-500/20 text-rose-400 bg-rose-500/5', icon: '📝' },
  admin: { color: 'border-slate-500/20 text-slate-400 bg-slate-500/5', icon: '⚙️' },
};

export const TaskCard: React.FC<Props> = ({ task, onStatusUpdate, onDeleteTask }) => {
  const isCompleted = task.status === 'completed';
  const isMissed = task.status === 'missed';
  const config = TYPE_CONFIG[task.type] || TYPE_CONFIG.admin;

  return (
    <div className={`group relative bg-[#12141c] rounded-3xl border p-6 transition-all duration-300 ${isCompleted ? 'border-transparent opacity-40 scale-[0.98]' : isMissed ? 'border-rose-500/50 shadow-lg shadow-rose-500/10' : 'border-white/5 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5'}`}>
      
      {/* STATUS OVERLAY */}
      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-emerald-500 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Cleared</div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${config.color}`}>
            <span>{config.icon}</span>
            {task.type.replace('_', ' ')}
          </div>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onStatusUpdate(isCompleted ? 'planned' : 'completed')}
              className={`p-1.5 rounded-lg transition-all ${isCompleted ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-600 hover:text-emerald-500 hover:bg-emerald-500/10'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            </button>
            <button 
              onClick={() => onStatusUpdate(isMissed ? 'planned' : 'missed')}
              className={`p-1.5 rounded-lg transition-all ${isMissed ? 'text-rose-500 bg-rose-500/10' : 'text-slate-600 hover:text-rose-500 hover:bg-rose-500/10'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button 
              onClick={onDeleteTask}
              className="p-1.5 text-slate-700 hover:text-rose-400 transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        <div>
          <h4 className={`text-sm font-black text-white leading-tight ${isCompleted ? 'line-through' : ''}`}>
            {task.title}
          </h4>
          <p className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-widest">{task.course}</p>
        </div>

        {/* AI REASONING / RATIONALE */}
        {task.reasoning && (
          <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Agent Rationale</p>
            <p className="text-[10px] text-slate-400 italic leading-tight">{task.reasoning}</p>
          </div>
        )}

        <div className="pt-4 flex items-center justify-between border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full border border-[#0a0c10] ${i < task.difficulty_1to5 ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
              ))}
            </div>
            <span className="text-[8px] font-bold text-slate-600 uppercase">Diff</span>
          </div>
          <span className="text-[10px] font-black text-white">{task.est_minutes} <span className="text-slate-600 uppercase text-[8px]">m</span></span>
        </div>
      </div>
    </div>
  );
};
