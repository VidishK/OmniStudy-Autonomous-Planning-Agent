
import React, { useMemo } from 'react';
import { StudyPlanOS } from '../types';

interface Props {
  plan: StudyPlanOS;
}

export const CalendarView: React.FC<Props> = ({ plan }) => {
  // Aggregate all sessions across all weeks
  const allSessions = useMemo(() => {
    return plan.study_plan.flatMap(week => week.sessions);
  }, [plan]);

  // Determine date range
  const dates = useMemo(() => {
    if (allSessions.length === 0) return [];
    
    const sortedDates = allSessions
      .map(s => new Date(s.date))
      .sort((a, b) => a.getTime() - b.getTime());
      
    const start = new Date(sortedDates[0]);
    // Set to start of the week (Sunday)
    start.setDate(start.getDate() - start.getDay());
    
    const end = new Date(sortedDates[sortedDates.length - 1]);
    // Set to end of the week (Saturday)
    end.setDate(end.getDate() + (6 - end.getDay()));
    
    const days = [];
    let current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [allSessions]);

  const getSessionsForDate = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return allSessions.filter(s => s.date === dStr);
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700">
      <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/5">
          {daysOfWeek.map(day => (
            <div key={day} className="py-6 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-r border-white/5 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {dates.map((day, idx) => {
            const sessions = getSessionsForDate(day);
            const isToday = new Date().toDateString() === day.toDateString();
            const isCurrentMonth = day.getMonth() === new Date(allSessions[0]?.date || Date.now()).getMonth();
            
            return (
              <div 
                key={idx} 
                className={`min-h-[140px] p-4 border-r border-b border-white/5 group relative transition-all hover:bg-white/[0.02] ${idx % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-black tracking-widest ${isToday ? 'text-indigo-400' : isCurrentMonth ? 'text-slate-500' : 'text-slate-800'}`}>
                    {day.getDate()}
                  </span>
                  {sessions.length > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  {sessions.map((session, sIdx) => (
                    <div key={sIdx} className="p-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20">
                      <div className="text-[8px] font-black text-indigo-400 uppercase leading-none mb-1">
                        {session.start_time}
                      </div>
                      <div className="text-[9px] font-bold text-slate-300 leading-tight truncate">
                        {session.tasks[0]?.title || "Study Block"}
                      </div>
                      {session.tasks.length > 1 && (
                        <div className="text-[7px] font-bold text-slate-500 mt-0.5 uppercase">
                          + {session.tasks.length - 1} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isToday && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-indigo-600/20 border border-indigo-500/20"></div>
          Scheduled Block
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
          Active Mission
        </div>
      </div>
    </div>
  );
};
