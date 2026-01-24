
import React, { useState, useMemo, useEffect } from 'react';
import { StudyPlanResponse, TaskStatus, StudyTask, StudyPlanOS } from '../types';
import { TaskCard } from './TaskCard';
import { CalendarView } from './CalendarView';
import { AddTaskModal } from './AddTaskModal';

interface Props {
  fullResponse: StudyPlanResponse;
  selectedIdx: number;
  onSelectOption: (idx: number) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTask: (task: StudyTask) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (weekIdx: number, sessionIdx: number, task: StudyTask) => void;
  onRebalance: () => void;
  isRebalancing: boolean;
}

export const PlanDashboard: React.FC<Props> = ({ 
  fullResponse, selectedIdx, onSelectOption, 
  onUpdateStatus, onUpdateTask, onDeleteTask, onAddTask, onRebalance, isRebalancing 
}) => {
  const [weekIdx, setWeekIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeSessionIdx, setActiveSessionIdx] = useState<number | null>(null);
  
  const plan = fullResponse.schedule_options[selectedIdx];
  const studyPlan = useMemo(() => Array.isArray(plan?.study_plan) ? plan.study_plan : [], [plan]);

  // RESET WEEK INDEX IF THE PLAN CHANGES (e.g. fewer weeks in new option)
  useEffect(() => {
    setWeekIdx(0);
  }, [selectedIdx, fullResponse]);

  // DEFENSIVE BOUNDS CHECK
  const safeWeekIdx = Math.min(weekIdx, Math.max(0, studyPlan.length - 1));
  const currentWeek = studyPlan[safeWeekIdx] || null;

  const handleOpenAddModal = (sIdx: number) => {
    setActiveSessionIdx(sIdx);
    setIsAddModalOpen(true);
  };

  const handleAddTaskConfirm = (task: StudyTask) => {
    if (activeSessionIdx !== null && currentWeek) {
      onAddTask(safeWeekIdx, activeSessionIdx, task);
    }
  };

  const stats = useMemo(() => {
    let total = 0, done = 0, missed = 0;
    studyPlan.forEach(w => {
      (w.sessions || []).forEach(s => {
        (s.tasks || []).forEach(t => {
          total++;
          if (t.status === 'completed') done++;
          if (t.status === 'missed') missed++;
        });
      });
    });
    return { 
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
      missed,
      total
    };
  }, [studyPlan]);

  const healthColors = {
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    yellow: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddTaskConfirm} 
      />

      {/* SYSTEM META HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Variant Selector */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Operational Variant</p>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{plan?.option_name || "Custom Strategy"}</h2>
            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${healthColors[fullResponse.health_status]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              System Health: {fullResponse.health_status}
            </div>
          </div>
          <div className="flex gap-2 bg-white/5 p-2 rounded-2xl">
            {fullResponse.schedule_options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onSelectOption(i)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedIdx === i ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-transparent text-slate-500 hover:text-white hover:bg-white/10'}`}
              >
                {opt.option_name || `Opt ${i+1}`}
              </button>
            ))}
          </div>
        </div>

        {/* System Health Rationale */}
        <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Agent Assessment</p>
          <p className="text-xs text-slate-400 italic leading-relaxed">"{fullResponse.health_reason}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Schedule Area */}
        <div className="lg:col-span-8 space-y-12">
          {/* PROGRESS HUD */}
          <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
             <div className="relative z-10 flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Mission Completion</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-white tracking-tighter italic">{stats.progress}%</span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Efficiency</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Backlog</p>
                <p className="text-2xl font-black text-rose-500 italic">-{fullResponse.backlog_hours}h</p>
              </div>
            </div>
            <div className="mt-6 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${stats.progress}%` }} />
            </div>
          </div>

          {/* VIEW TOGGLE & LIST/CALENDAR */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
               <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                <button onClick={() => setViewMode('list')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>List</button>
                <button onClick={() => setViewMode('calendar')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Grid</button>
              </div>

              {viewMode === 'list' && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 max-w-full">
                  {studyPlan.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setWeekIdx(idx)} 
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex-shrink-0 ${weekIdx === idx ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/5 text-slate-600 hover:text-slate-400'}`}
                    >
                      Week {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {viewMode === 'list' ? (
              <div className="space-y-12 min-h-[400px]">
                {currentWeek ? currentWeek.sessions.map((session, sIdx) => (
                  <section key={sIdx} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl font-black italic text-white/5 select-none">{String(sIdx + 1).padStart(2, '0')}</div>
                        <div>
                          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">
                            {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </h3>
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{session.start_time} — {session.end_time}</span>
                        </div>
                      </div>
                      <button onClick={() => handleOpenAddModal(sIdx)} className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {session.tasks.map(task => (
                        <TaskCard key={task.task_id} task={task} onStatusUpdate={(s) => onUpdateStatus(task.task_id, s)} onUpdateTask={onUpdateTask} onDeleteTask={() => onDeleteTask(task.task_id)} />
                      ))}
                    </div>
                  </section>
                )) : (
                  <div className="py-20 text-center text-slate-600 font-black uppercase tracking-[0.2em] italic">No missions detected for this cycle.</div>
                )}
              </div>
            ) : (
              <CalendarView plan={plan} />
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Assumptions */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Agent Assumptions</h4>
            <ul className="space-y-3">
              {(fullResponse.assumptions || []).map((a, i) => (
                <li key={i} className="flex gap-3 text-[10px] text-slate-400 leading-tight">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Next Actions */}
          <div className="bg-indigo-600/5 border border-indigo-500/20 p-6 rounded-[2rem] space-y-4">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Mission Objectives</h4>
            <div className="space-y-2">
              {(fullResponse.next_actions || []).map((action, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl text-[10px] font-bold text-slate-300 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md border border-white/10 flex-shrink-0"></div>
                  {action}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Rebalance */}
          <button onClick={onRebalance} disabled={isRebalancing} className="w-full py-6 bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 text-slate-500 hover:text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all">
            {isRebalancing ? "Optimizing Path..." : "Recalculate Trajectory"}
          </button>
        </div>
      </div>
    </div>
  );
};
