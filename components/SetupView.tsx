
import React, { useState, useCallback } from 'react';
import { UserConstraints } from '../types';

interface Props {
  onPlanGenerated: (constraints: UserConstraints) => void;
  isLoading: boolean;
}

const TEMPLATES = {
  cs: {
    weeklyTopics: "Week 1: Big O & Arrays\nWeek 2: Linked Lists\nWeek 3: Stacks & Queues\nWeek 4: Hash Tables\nWeek 5: Recursion & Trees",
    readings: "CLRS Chapter 1-10\nOptional: Cracking the Coding Interview",
    assignments: "Lab 1: Array Reversal (Due W2)\nLab 2: Queue Implementation (Due W4)\nMidterm Project (Due W6)",
    examsGrading: "Weekly Quizzes (10%)\nMidterm Exam (30%)\nFinal Project (60%)",
    importantDates: "Midterm: Oct 15\nFinal Project Due: Dec 12",
    policies: "No late submissions. Standard academic integrity applies.",
    studentPreferences: "Morning focused. Avoid studying Friday evenings.",
    fixedCommitments: "Gym: Mon/Wed/Fri 7am-8am\nWork: Tue/Thu 4pm-8pm",
    preferredFocusHours: "9am - 12pm",
    hours: 12,
    deadline: "2025-12-20"
  },
  econ: {
    weeklyTopics: "Market Equilibrium\nElasticity\nConsumer Theory\nProduction Functions\nMonopoly & Oligopoly",
    readings: "Mankiw Microeconomics Ch 1-8\nWall Street Journal daily review",
    assignments: "Problem Set 1: Supply/Demand Curves\nCase Study: Tech Monopolies",
    examsGrading: "Problem Sets (20%)\nMidterm (35%)\nFinal (45%)",
    importantDates: "Midterm: Nov 2\nFinal: Dec 18",
    policies: "Collaboration encouraged on P-Sets.",
    studentPreferences: "Weekend heavy learner. No study before 10am.",
    fixedCommitments: "Club Meeting: Wed 7pm",
    preferredFocusHours: "10am - 4pm",
    hours: 10,
    deadline: "2025-12-18"
  },
  bio: {
    weeklyTopics: "Cell Structure\nMetabolism\nDNA Replication\nProtein Synthesis\nGenetics",
    readings: "Campbell Biology Ch 4-12\nLab Manual Section 1-5",
    assignments: "Lab Report 1: Osmosis\nDNA Modeling Project",
    examsGrading: "Labs (25%)\nQuizzes (15%)\nFinal Exam (60%)",
    importantDates: "Lab Quiz: Oct 20\nFinal: Dec 15",
    policies: "Lab attendance is mandatory.",
    studentPreferences: "Night owl. Strict Focus after 8pm.",
    fixedCommitments: "Lab: Mon 2pm-5pm",
    preferredFocusHours: "8pm - 11pm",
    hours: 18,
    deadline: "2025-12-15"
  }
};

export const SetupView: React.FC<Props> = ({ onPlanGenerated, isLoading }) => {
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

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const fillTemplate = (key: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[key];
    setFormData(prev => ({
      ...prev,
      ...template
    }));
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
        <div className="inline-block px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest">Initialization Phase</div>
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Agent Onboarding</h2>
        
        {/* QUICK TEMPLATES */}
        <div className="pt-8 flex flex-wrap justify-center gap-3">
          <p className="w-full text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Quick-Fill Presets:</p>
          <button type="button" onClick={() => fillTemplate('cs')} className="px-5 py-2 rounded-full border border-white/5 bg-white/5 text-[9px] font-black uppercase text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all">Computer Science</button>
          <button type="button" onClick={() => fillTemplate('econ')} className="px-5 py-2 rounded-full border border-white/5 bg-white/5 text-[9px] font-black uppercase text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all">Microeconomics</button>
          <button type="button" onClick={() => fillTemplate('bio')} className="px-5 py-2 rounded-full border border-white/5 bg-white/5 text-[9px] font-black uppercase text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all">Biology Lab</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 pb-20">
        {/* SECTION 1: COURSE INTELLIGENCE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white/[0.02] border border-white/5 p-8 rounded-[3rem]">
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">01. Academic Data</h3>
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">The agent analyzes grade weights to prioritize high-impact sessions.</p>
          </div>
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-8">
            {renderField("Weekly Topics", "weeklyTopics", "List modules or weekly focus...")}
            {renderField("Exams & Weights", "examsGrading", "Final Exam (40%), Project (20%)...")}
            {renderField("Readings", "readings", "Textbooks, research papers...")}
            {renderField("Assignments", "assignments", "HW 1, Case Study, Lab Reports...")}
          </div>
        </div>

        {/* SECTION 2: CALENDAR CONFLICTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white/[0.02] border border-white/5 p-8 rounded-[3rem]">
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">02. Fixed Reality</h3>
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">The agent will never schedule study during these times.</p>
          </div>
          <div className="lg:col-span-8 space-y-8">
            {renderField("Weekly Fixed Commitments", "fixedCommitments", "Mon: 9am–10:15am Math 231\nTue: 2pm–5pm Golf practice\nWed: 6pm-9pm Work shift")}
            {renderField("Energy Windows & Sleep", "preferredFocusHours", "Best focus: Morning (9am–12pm)\nAvoid studying after 9pm\nNo-study days: Sunday")}
            {renderField("AI Override Protocol", "allowOverride", "Allow AI to use non-preferred hours if deadlines are < 48h away", "checkbox")}
          </div>
        </div>

        {/* SECTION 3: DEPLOYMENT SETTINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white/[0.02] border border-white/5 p-8 rounded-[3rem]">
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">03. Activation</h3>
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Global limits for the planning algorithm.</p>
          </div>
          <div className="lg:col-span-8 grid md:grid-cols-3 gap-6">
            {renderField("Max Hours / Wk", "hours", "15", "number")}
            {renderField("Start Date", "start", "", "date")}
            {renderField("End Date", "deadline", "", "date")}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="group relative w-full overflow-hidden py-8 bg-indigo-600 text-white font-black uppercase tracking-[0.5em] rounded-[2.5rem] shadow-2xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <div className="relative z-10 flex items-center justify-center gap-4">
            {isLoading ? "Syncing Logic..." : "Deploy StudyPlan OS"}
          </div>
        </button>
      </form>
    </div>
  );
};
