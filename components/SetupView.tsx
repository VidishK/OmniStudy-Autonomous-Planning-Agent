
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlanGenerated({
      syllabus,
      hoursPerWeek: hours,
      startDate: start,
      deadlineDate: deadline,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Mission Initialization</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Course Syllabus / Topics List
          </label>
          <textarea
            required
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none"
            placeholder="Paste your syllabus text or topics here..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Available Hours/Week</label>
            <input
              type="number"
              required
              min="1"
              max="168"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              required
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Final Deadline</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all ${
            isLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Architecting Your Plan...
            </span>
          ) : 'Generate Autonomous Plan'}
        </button>
      </form>
    </div>
  );
};
