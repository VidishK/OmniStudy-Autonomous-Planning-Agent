import React, { useState, useCallback } from 'react';
import { UserConstraints } from '../types';
import { parseSyllabus } from '../services/geminiService';

interface Props {
  onPlanGenerated: (constraints: UserConstraints) => void;
  isLoading: boolean;
}

export const SetupView: React.FC<Props> = ({ onPlanGenerated, isLoading }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [rawSyllabus, setRawSyllabus] = useState('');
  const [formData, setFormData] = useState({
    weeklyTopics: '',
    readings: '',
    assignments: '',
    examsGrading: '',
    importantDates: '',
    policies: '',
    studentPreferences: '',
    fixedCommitments: '',
    preferredFocusHours: '',
    allowOverride: true,
    hours: 15,
    start: new Date().toISOString().split('T')[0],
    deadline: ''
  });

  const isKeyPresent = !!process.env.API_KEY && process.env.API_KEY !== 'undefined' && process.env.API_KEY.length > 5;

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSmartExtract = async () => {
    if (!rawSyllabus.trim()) return;
    setIsExtracting(true);
    try {
      const extracted = await parseSyllabus(rawSyllabus);
      setFormData(prev => ({
        ...prev,
        ...extracted
      }));
      setRawSyllabus('');
    } catch (e: any) {
      alert(e.message || "Extraction failed. Please ensure your API key is active.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.weeklyTopics.trim() || !formData.deadline) {
      alert("System Error: Critical fields (Weekly Topics & Deadline) are required for core logic.");
      return;
    }
    onPlanGenerated({
      ...formData,
      hoursPerWeek: formData.hours,
      startDate: formData.start,
      deadlineDate: formData.deadline
    });
  };

  const renderField = (label: string, id: keyof typeof formData, placeholder: string, type: string = 'textarea', icon?: React.ReactNode) => (
    <div className="space-y-3">
      <label htmlFor={id} className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
        {icon}
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          value={formData[id] as string}
          onChange={(e) => updateField(id, e.target.value)}
          placeholder={placeholder}
          className="w-full h-32 p-5 rounded-2xl border border-white/5 bg-white/5 font-medium text-sm outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all resize-none placeholder:text-slate-700 text-white"
        />
      ) : type === 'checkbox' ? (
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
          <input
            id={id}
            name={id}
            type="checkbox"
            checked={formData[id] as boolean}
            onChange={(e) => updateField(id, e.target.checked)}
            className="w-5 h-5 accent-indigo-500 cursor-pointer"
          />
          <label htmlFor={id} className="text-xs font-bold text-slate-400 cursor-pointer">{placeholder}</label>
        </div>
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={formData[id] as any}
          onChange={(e) => updateField(id, e.target.value)}
          className="w-full p-4 rounded-xl border border-white/5 bg-white/5 font-bold text-sm outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all text-white"
          placeholder={placeholder}
        />
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="mb-12 text-center space-y-3">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10">
          <span className={`w-2 h-2 rounded-full ${isKeyPresent ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
          <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">
            {isKeyPresent ? "Neural Link Active" : "Neural Link Offline (Check API Key)"}
          </span>
        </div>
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Agent Onboarding</h2>
      </div>

      <div className="mb-16 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[3rem] blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-[#0d0f17] border border-white/10 p-10 rounded-[3rem] space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                <span className="text-indigo-500">⚡</span> Intelligence Intake
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Paste raw syllabus text to auto-populate the fields below.</p>
            </div>
            <button 
              type="button"
              disabled={isExtracting || !rawSyllabus || !isKeyPresent}
              onClick={handleSmartExtract}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
            >
              {isExtracting ? "Analyzing Neural Patterns..." : "Execute Smart Extract"}
            </button>
          </div>
          <textarea 
            value={rawSyllabus}
            onChange={(e) => setRawSyllabus(e.target.value)}
            placeholder="Copy and paste entire syllabus text here..."
            className="w-full h-40 bg-white/5 border border-white/5 rounded-[2rem] p-6 text-sm text-slate-300 font-medium outline-none focus:border-indigo-500/50 transition-all resize-none italic"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white/[0.02] border border-white/5 p-8 rounded-[3rem]">
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">01. Academic Data</h3>
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Core syllabus inputs.</p>
          </div>
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-8">
            {renderField("Weekly Topics", "weeklyTopics", "Module 1, Module 2...")}
            {renderField("Exams & Weights", "examsGrading", "Weights and grading...")}
            {renderField("Readings", "readings", "Reading list...")}
            {renderField("Assignments", "assignments", "Homework and labs...")}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white/[0.02] border border-white/5 p-8 rounded-[3rem]">
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">02. Activation</h3>
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Scheduling constraints.</p>
          </div>
          <div className="lg:col-span-8 grid md:grid-cols-3 gap-6">
            {renderField("Max Hours / Wk", "hours", "15", "number")}
            {renderField("Start Date", "start", "", "date")}
            {renderField("End Date", "deadline", "", "date")}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !isKeyPresent}
          className="group relative w-full overflow-hidden py-8 bg-indigo-600 text-white font-black uppercase tracking-[0.5em] rounded-[2.5rem] shadow-2xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? "Syncing Logic..." : isKeyPresent ? "Deploy StudyPlan OS" : "API Key Required"}
        </button>
      </form>
    </div>
  );
};


