
import React, { useMemo } from 'react';
import { StudyPlanOS } from '../types';

interface Props {
  plan: StudyPlanOS;
}

export const CalendarView: React.FC<Props> = ({ plan }) => {
  const allSessions = useMemo(() => {
    return plan.study_plan.flatMap(week => week.sessions);
  }, [plan]);

  const dates = useMemo(() => {
    if (allSessions.length === 0) return [];
    
    const sortedDates = allSessions
      .map(s => new Date(s.date))
      .sort((a, b) => a.getTime() - b.getTime());
      
    const start = new Date(sortedDates[0]);
    start.setUTCHours(0,0,0,0);
    start.setDate(start.getDate() - start.getDay());
    
    const end = new Date(sortedDates[sortedDates.length - 1]);
    end.setUTCHours(0,0,0,0);
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
      <div className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] overflow-hidden">
        <div className="grid grid-cols-7 bg-white/5 border-b border-white/5">
          {daysOfWeek.map(day => (
            <div key={day} className="py-6 text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {dates.map((day, idx) => {
            const sessions = getSessionsForDate(day);
            const isToday = new Date().toDateString() === day.toDateString();
            const hasActivity = sessions.length > 0;
            
            return (
              <div 
                key={idx} 
                className={`min-h-[160px] p-5 border-r border-b border-white/5 group hover:bg-white/[0.03] transition-all relative ${idx % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[11px] font-black tracking-widest ${isToday ? 'text-indigo-400 underline underline-offset-8 decoration-2' : hasActivity ? 'text-slate-400' : 'text-slate-700'}`}>
                    {day.getDate()}
                  </span>
                  {isToday && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>}
                </div>
                
                <div className="space-y-2">
                  {sessions.map((session, sIdx) => (
                    <div key={sIdx} className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all">
                      <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                        {session.start_time}
                      </div>
                      <div className="text-[10px] font-bold text-slate-200 leading-tight uppercase line-clamp-2">
                        {session.tasks[0]?.title || "Study Session"}
                      </div>
                      {session.tasks.length > 1 && (
                        <div className="mt-1 text-[7px] font-black text-slate-500 uppercase">
                          + {session.tasks.length - 1} Tasks
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

