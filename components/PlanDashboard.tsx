
import React, { useState, useMemo } from 'react';
import { StudyPlanOS, TaskStatus, StudyTask, TaskType } from '../types';
import { TaskCard } from './TaskCard';

interface Props {
  plan: StudyPlanOS;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTask: (task: StudyTask) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (weekIdx: number, sessionIdx: number, task: StudyTask) => void;
  onRebalance: () => void;
  isRebalancing: boolean;
}

export const PlanDashboard: React.FC<Props> = ({ 
  plan, 
  onUpdateStatus, 
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onRebalance,
  isRebalancing 
}) => {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [showCompleted, setShowCompleted] = useState(true);
  
  const studyPlanArray = plan.study_plan || [];
  const safeWeekIndex = Math.min(selectedWeekIndex, Math.max(0, studyPlanArray.length - 1));
  const currentWeek = studyPlanArray[safeWeekIndex];

  // Calculate live backlog from current state
  const backlogTasks = useMemo(() => {
    const missed: StudyTask[] = [];
    studyPlanArray.forEach(week => {
      (week.sessions || []).forEach(session => {
        (session.tasks || []).forEach(task => {
          if (task.status === 'missed' || task.status === 'rescheduled') {
            missed.push(task);
          }
        });
      });
    });
    return missed;
  }, [studyPlanArray]);

  const liveBacklogHours = useMemo(() => {
    const mins = backlogTasks.reduce((acc, t) => acc + (t.est_minutes || 0), 0);
    return (mins / 60).toFixed(1);
  }, [backlogTasks]);

  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedCount = 0;
    let totalMinutes = 0;

    studyPlanArray.forEach(week => {
      (week.sessions || []).forEach(session => {
        (session.tasks || []).forEach(task => {
          totalTasks++;
          totalMinutes += (task.est_minutes || 0);
          if (task.status === 'completed') completedCount++;
        });
      });
    });

    const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    return { totalTasks, completedCount, progress, totalHours: (totalMinutes / 60).toFixed(1) };
  }, [studyPlanArray]);

  const triggerManualAdd = (sessionIdx: number) => {
    const newTask: StudyTask = {
      task_id: `manual-${Date.now()}`,
      title: "New Study Task",
      course: "Manual Entry",
      type: "reading",
      deliverable: "Complete this manually added task",
      est_minutes: 60,
      difficulty_1to5: 3,
      priority_1to5: 3,
      deadline: null,
      status: "planned",
      depends_on: []
    };
    onAddTask(safeWeekIndex, sessionIdx, newTask);
  };

  if (!currentWeek) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
        <p className="text-slate-500 font-medium">No study plan data available.</p>
        <button onClick={onRebalance} className="mt-4 text-indigo-600 font-bold hover:underline">Sync Agent</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Agent Control Panel */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* BACKLOG VIEWER - NOW AT THE TOP */}
        <div className={`p-6 rounded-2xl shadow-xl border-2 transition-all ${backlogTasks.length > 0 ? 'bg-rose-600 border-rose-500 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Backlog Center
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${backlogTasks.length > 0 ? 'bg-rose-800 text-rose-100' : 'bg-slate-100 text-slate-500'}`}>
              {liveBacklogHours} HOURS
            </span>
          </div>
          
          <div className="space-y-3">
            {backlogTasks.length === 0 ? (
              <p className="text-sm opacity-60 italic">Your schedule is currently healthy. No backlog detected.</p>
            ) : (
              <>
                <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {backlogTasks.map(task => (
                    <div key={task.task_id} className="p-3 bg-white/10 rounded-xl border border-white/20">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold leading-tight">{task.title}</p>
                        <span className="text-[10px] font-black uppercase opacity-70 shrink-0 ml-2">{task.est_minutes}m</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-bold opacity-80 uppercase pt-2 border-t border-white/20">
                  Total: {backlogTasks.length} tasks needing rebalancing
                </p>
              </>
            )}
          </div>
        </div>

        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            <h3 className="text-lg font-bold">StudyPlanOS Agent</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 opacity-70">
                <span>SYSTEM PROGRESS</span>
                <span>{stats.progress}%</span>
              </div>
              <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-700" 
                  style={{ width: `${stats.progress}%` }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-[10px] opacity-60 font-bold uppercase">Total Planned Capacity</p>
                <p className="text-xl font-black">{stats.totalHours}h Across All Weeks</p>
              </div>
            </div>

            <button
              onClick={onRebalance}
              disabled={isRebalancing}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                isRebalancing 
                  ? 'bg-amber-500/50 cursor-not-allowed text-amber-100' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30 ring-4 ring-indigo-500/20'
              }`}
            >
              {isRebalancing ? 'AGENT IS OPTIMIZING...' : 'Trigger Sync & Rebalance'}
            </button>
            <p className="text-[10px] text-center opacity-50 uppercase font-bold px-2">
              Updates future weeks based on your manual changes & misses
            </p>
          </div>
        </div>

        {/* Decision Log */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-h-[250px] overflow-y-auto">
          <h3 className="text-md font-bold text-slate-800 mb-4">Agent Decision History</h3>
          <div className="space-y-4">
            {(plan.decision_log || []).slice(0, 5).map((entry, idx) => (
              <div key={idx} className="relative pl-4 border-l-2 border-indigo-100 pb-2">
                <p className="text-[10px] font-bold text-slate-400 mb-1">{entry.date}</p>
                <p className="text-[11px] text-slate-600 line-clamp-2">{entry.changes[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: The Study Plan */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-wrap gap-1 overflow-x-auto scrollbar-hide">
            {studyPlanArray.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedWeekIndex(idx)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all border uppercase tracking-wider ${
                  selectedWeekIndex === idx 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-50'
                }`}
              >
                Week {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 pr-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showCompleted} 
                onChange={() => setShowCompleted(!showCompleted)} 
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase">Show Done</span>
            </label>
          </div>
        </div>

        <div className="space-y-12">
          {(currentWeek.sessions || []).map((session, sIdx) => {
            const allTasks = session.tasks || [];
            const visibleTasks = showCompleted ? allTasks : allTasks.filter(t => t.status !== 'completed');

            return (
              <div key={sIdx} className="space-y-4">
                <div className="flex items-center justify-between px-2 border-l-4 border-indigo-500">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">
                      {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      {session.time_block_label} • {((session.planned_minutes || 0) / 60).toFixed(1)} hrs capacity
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {visibleTasks.length === 0 && !showCompleted ? (
                    <div className="p-4 text-center bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-xs font-bold uppercase">
                      Session Complete!
                    </div>
                  ) : (
                    visibleTasks.map(task => (
                      <TaskCard 
                        key={task.task_id} 
                        task={task} 
                        onStatusUpdate={(status) => onUpdateStatus(task.task_id, status)}
                        onUpdateTask={onUpdateTask}
                        onDeleteTask={() => onDeleteTask(task.task_id)}
                      />
                    ))
                  )}
                  
                  <button 
                    onClick={() => triggerManualAdd(sIdx)}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                    </svg>
                    ADD TASK TO SESSION
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
