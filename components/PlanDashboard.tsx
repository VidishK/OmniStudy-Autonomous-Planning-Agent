
import React, { useState, useMemo } from 'react';
import { StudyPlan, StudyTask, TaskStatus, UserConstraints, RebalanceLog } from '../types';
import { TaskCard } from './TaskCard';

interface Props {
  plan: StudyPlan;
  constraints: UserConstraints;
  logs: RebalanceLog[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onRebalance: () => void;
  isRebalancing: boolean;
}

export const PlanDashboard: React.FC<Props> = ({ 
  plan, 
  constraints, 
  logs, 
  onUpdateStatus, 
  onRebalance,
  isRebalancing 
}) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  
  const weeks = useMemo(() => {
    const w = Array.from(new Set(plan.tasks.map(t => t.week))).sort((a, b) => a - b);
    return w;
  }, [plan.tasks]);

  const weekTasks = useMemo(() => {
    return plan.tasks.filter(t => t.week === selectedWeek).sort((a, b) => a.day - b.day);
  }, [plan.tasks, selectedWeek]);

  const stats = useMemo(() => {
    const total = plan.tasks.length;
    const completed = plan.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const missed = plan.tasks.filter(t => t.status === TaskStatus.MISSED).length;
    const progress = Math.round((completed / total) * 100) || 0;
    const hours = plan.tasks.reduce((acc, t) => acc + (t.status === TaskStatus.PENDING ? t.durationHours : 0), 0);
    return { total, completed, missed, progress, hours };
  }, [plan.tasks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Stats & Logs */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Mission Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Course Progress</span>
                <span className="font-bold text-indigo-600">{stats.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-500" 
                  style={{ width: `${stats.progress}%` }} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-black text-emerald-700">{stats.completed}</p>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">Missed</p>
                <p className="text-2xl font-black text-rose-700">{stats.missed}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Workload Remaining</p>
              <p className="text-lg font-bold text-slate-800">{stats.hours.toFixed(1)} hrs</p>
            </div>
          </div>
          
          <button
            onClick={onRebalance}
            disabled={isRebalancing}
            className={`mt-6 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isRebalancing 
                ? 'bg-amber-100 text-amber-600 cursor-not-allowed' 
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            {isRebalancing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing Agent...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync & Rebalance
              </>
            )}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-h-[400px] overflow-y-auto">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Agent Log
          </h3>
          <div className="space-y-4">
            {logs.length === 0 && (
              <p className="text-sm text-slate-400 italic">No rebalances performed yet.</p>
            )}
            {logs.map(log => (
              <div key={log.id} className="text-sm p-3 bg-slate-50 rounded-lg border-l-4 border-indigo-400">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold">
                    REBALANCE
                  </span>
                </div>
                <p className="text-slate-600 leading-snug">{log.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main: Plan List */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto scrollbar-hide">
          {weeks.map(w => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all border whitespace-nowrap ${
                selectedWeek === w 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              Week {w}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-800">Week {selectedWeek} Agenda</h2>
            <span className="text-sm text-slate-500">
              {weekTasks.reduce((a, b) => a + b.durationHours, 0).toFixed(1)} hrs total
            </span>
          </div>
          
          {weekTasks.length === 0 && (
            <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400">No tasks assigned for this week.</p>
            </div>
          )}

          {weekTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onStatusUpdate={(status) => onUpdateStatus(task.id, status)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
