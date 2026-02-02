
import React, { useState, useMemo, useEffect } from 'react';
import { StudyPlanResponse, TaskStatus, StudyTask, StudyPlanOS } from '../types';
import { TaskCard } from './TaskCard';
import { CalendarView } from './CalendarView';
import { AddTaskModal } from './AddTaskModal';
import { QuickAdjust } from './QuickAdjust';

interface Props {
  fullResponse: StudyPlanResponse;
  selectedIdx: number;
  onSelectOption: (idx: number) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTask: (task: StudyTask) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (weekIdx: number, sessionIdx: number, task: StudyTask) => void;
  onRebalance: () => void;
  onAdjust: (command: string) => void;
  isRebalancing: boolean;
}

export const PlanDashboard: React.FC<Props> = ({ 
  fullResponse, selectedIdx, onSelectOption, 
  onUpdateStatus, onUpdateTask, onDeleteTask, onAddTask, onRebalance, onAdjust, isRebalancing 
}) => {
  const [weekIdx, setWeekIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeSessionIdx, setActiveSessionIdx] = useState<number | null>(null);
  const [isFinalized, setIsFinalized] = useState(() => localStorage.getItem('study_plan_finalized') === 'true');
  
  const plan = fullResponse.schedule_options[selectedIdx];
  const studyPlan = useMemo(() => Array.isArray(plan?.study_plan) ? plan.study_plan : [], [plan]);

  useEffect(() => {
    if (weekIdx >= studyPlan.length) setWeekIdx(0);
  }, [studyPlan.length, selectedIdx]);

  const safeWeekIdx = Math.min(weekIdx, Math.max(0, studyPlan.length - 1));
  const currentWeek = studyPlan[safeWeekIdx] || null;

  const handleFinalize = () => {
    setIsFinalized(true);
    localStorage.setItem('study_plan_finalized', 'true');
    exportToCalendar();
  };

  const exportToCalendar = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudyPlanOS//StudyPlan//EN\n";
    studyPlan.forEach(week => {
      week.sessions.forEach(session => {
        const dateStr = session.date.replace(/-/g, "");
        const start = session.start_time.replace(/:/g, "") + "00";
        const end = session.end_time.replace(/:/g, "") + "00";
        const summary = session.tasks.map(t => t.title).join(" | ");
        
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `DTSTART:${dateStr}T${start}\n`;
        icsContent += `DTEND:${dateStr}T${end}\n`;
        icsContent += `SUMMARY:StudyPlanOS: ${summary}\n`;
        icsContent += "END:VEVENT\n";
      });
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `StudyPlan_Trajectory.ics`);
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    let total = 0, done = 0;
    studyPlan.forEach(w => w.sessions.forEach(s => s.tasks.forEach(t => {
      total++;
      if (t.status === 'completed') done++;
    })));
    return { progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [studyPlan]);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-1000">
      <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={(t) => currentWeek && onAddTask(safeWeekIdx, activeSessionIdx!, t)} />

      <QuickAdjust onAdjust={onAdjust} isLoading={isRebalancing} />

      {/* STRATEGY HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 bg-white/[0.03] border border-white/5 p-10 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-12">
          <div className="space-y-5 flex-grow">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Active Protocol</span>
              <div className="h-1.5 w-40 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${plan.pedagogical_efficiency}%` }}></div>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase">{plan.pedagogical_efficiency}% Efficiency</span>
            </div>
            <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">{plan.option_name}</h2>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2">
               <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Rationale</p>
               <p className="text-xs text-slate-300 italic leading-relaxed">"{plan.rationale}"</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 p-4 bg-[#0d0f17] rounded-[2.5rem] border border-white/5 min-w-[240px]">
            {fullResponse.schedule_options.map((opt, i) => (
              <button
                key={i}
                disabled={isRebalancing}
                onClick={() => onSelectOption(i)}
                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedIdx === i ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl scale-[1.05]' : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                {opt.option_name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white/[0.03] border border-white/5 p-10 rounded-[3.5rem] flex flex-col justify-center items-center text-center space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Course Completion</p>
            <p className="text-8xl font-black text-white italic tracking-tighter">{stats.progress}%</p>
          </div>
          <button 
            onClick={handleFinalize}
            className={`w-full py-6 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl ${isFinalized ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40'}`}
          >
            {isFinalized ? "Finalized" : "Finalize Trajectory"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          {/* NAVIGATION BAR */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-[#0d0f17] p-4 rounded-[3rem] border border-white/5">
            <div className="inline-flex p-1.5 bg-white/5 rounded-3xl border border-white/5">
              <button onClick={() => setViewMode('list')} className={`px-12 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>Timeline</button>
              <button onClick={() => setViewMode('calendar')} className={`px-12 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>Calendar</button>
            </div>
            {viewMode === 'list' && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full pb-2 md:pb-0 px-4">
                {studyPlan.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setWeekIdx(idx)} 
                    className={`px-6 py-4 rounded-2xl text-[11px] font-black uppercase border transition-all flex-shrink-0 min-w-[100px] ${weekIdx === idx ? 'bg-white/10 border-indigo-500/50 text-indigo-400 shadow-inner' : 'bg-transparent border-white/5 text-slate-600 hover:text-slate-300'}`}
                  >
                    Week {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {viewMode === 'list' ? (
            <div className="space-y-20">
              {currentWeek?.sessions?.length ? currentWeek.sessions.map((session, sIdx) => (
                <div key={sIdx} className="relative pl-20 border-l-4 border-white/5 group animate-in slide-in-from-left-6 duration-700">
                  <div className="absolute top-0 left-0 -translate-x-[calc(50%+2px)] w-14 h-14 rounded-2xl bg-[#0a0c10] border-2 border-indigo-600 flex items-center justify-center text-[16px] font-black text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] group-hover:scale-110 transition-transform">
                    {sIdx + 1}
                  </div>
                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                          {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                        </h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">{session.start_time} — {session.end_time}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{session.time_block_label}</span>
                        </div>
                      </div>
                      <button onClick={() => { setActiveSessionIdx(sIdx); setIsAddModalOpen(true); }} className="p-5 bg-white/5 hover:bg-indigo-600/20 rounded-[2rem] border border-white/5 hover:border-indigo-500/40 text-slate-500 hover:text-indigo-400 transition-all shadow-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                    
                    {sIdx === 0 && currentWeek.week_goals?.length > 0 && (
                      <div className="bg-indigo-600/5 border border-indigo-500/10 p-6 rounded-3xl space-y-3">
                         <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                           Weekly Focus (Syllabus Content)
                         </p>
                         <div className="flex flex-wrap gap-2">
                           {currentWeek.week_goals.map((goal, i) => (
                             <span key={i} className="text-xs font-bold text-slate-300 bg-[#0a0c10] px-3 py-1.5 rounded-xl border border-white/5">
                               {goal}
                             </span>
                           ))}
                         </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {session.tasks.map(task => (
                        <TaskCard key={task.task_id} task={task} onStatusUpdate={(s) => onUpdateStatus(task.task_id, s)} onUpdateTask={onUpdateTask} onDeleteTask={() => onDeleteTask(task.task_id)} />
                      ))}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-32 text-center space-y-8 animate-in fade-in zoom-in-95">
                  <div className="text-8xl opacity-10 grayscale">🧘</div>
                  <div className="space-y-2">
                    <p className="text-[14px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Operational Rest Phase</p>
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">No syllabus objectives detected for this specific window.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <CalendarView plan={plan} />
          )}
        </div>

        {/* SIDEBAR ANALYTICS */}
        <div className="lg:col-span-4 space-y-8">
          {/* BACKLOG REPOSITORY */}
          <div className="bg-[#12141c] border border-white/5 p-10 rounded-[3.5rem] space-y-8 shadow-2xl">
            <div className="flex justify-between items-end">
               <div className="space-y-1">
                 <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em]">Efficiency Debt</p>
                 <p className={`text-6xl font-black italic tracking-tighter ${fullResponse.backlog_hours > 0 ? 'text-rose-500' : 'text-emerald-500 opacity-20'}`}>
                   -{fullResponse.backlog_hours}h
                 </p>
               </div>
               {fullResponse.backlog_hours > 0 && (
                 <button onClick={onRebalance} className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-rose-600/30">Re-Optimize</button>
               )}
            </div>
            
            {fullResponse.backlog_tasks?.length > 0 ? (
              <div className="space-y-4">
                {fullResponse.backlog_tasks.map((bt, i) => (
                  <div key={i} className="p-5 bg-white/5 rounded-3xl border border-white/5 flex justify-between items-center group/item hover:bg-white/[0.08] transition-all">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white group-hover/item:text-rose-400 transition-colors">{bt.title}</p>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{bt.missed_date}</p>
                    </div>
                    <span className="text-[11px] font-black text-rose-500">-{bt.est_minutes}m</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">All Modules Balanced</p>
              </div>
            )}
          </div>

          {/* NEXT ACTIONS */}
          <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3.5rem] space-y-8">
            <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em]">Next Objectives</h4>
            <div className="space-y-6">
              {fullResponse.next_actions.map((action, i) => (
                <div key={i} className="flex gap-5 group cursor-default">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 group-hover:scale-150 transition-all shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                  <p className="text-[12px] font-bold text-slate-400 leading-relaxed group-hover:text-white transition-colors">{action}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* ASSUMPTIONS */}
          <div className="bg-white/[0.01] border border-white/5 p-10 rounded-[3.5rem] space-y-6">
            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Agent Heuristics</h4>
            <ul className="space-y-3">
              {fullResponse.assumptions.map((a, i) => (
                <li key={i} className="text-[10px] text-slate-600 italic leading-relaxed flex gap-3">
                  <span className="text-indigo-500 font-black">/</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

