
import React, { useState } from 'react';
import { UserConstraints } from '../types';

interface Props {
  onPlanGenerated: (constraints: UserConstraints) => void;
  isLoading: boolean;
}

export const SetupView: React.FC<Props> = ({ onPlanGenerated, isLoading }) => {
  const [syllabus, setSyllabus] = useState('');
  const [hours, setHours] = useState(10);
  const [start, setStart] = useState('');
  const [deadline, setDeadline] = useState('');
  const [availability, setAvailability] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlanGenerated({
      syllabus,
      hoursPerWeek: hours,
      startDate: start,
      deadlineDate: deadline,
      availabilityDetails: availability
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
           </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">System Initialization</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Syllabus / Reading List</label>
              <textarea
                required
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none bg-slate-50 font-mono"
                placeholder="Paste course contents, assignments, weights..."
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Constraints & Preferences</label>
              <textarea
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none bg-slate-50 font-mono mb-4"
                placeholder="e.g. No study on Sundays. Prefer 2-hour blocks. High difficulty in mornings."
              />
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weekly Capacity (Hrs)</label>
                  <input
                    type="number"
                    required
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Final Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-2xl font-black text-white transition-all uppercase tracking-widest shadow-xl ${
            isLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isLoading ? 'Architecting Plan...' : 'Compile StudyPlanOS'}
        </button>
      </form>
    </div>
  );
};
