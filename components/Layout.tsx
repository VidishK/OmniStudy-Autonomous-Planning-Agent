
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode; onReset?: () => void }> = ({ children, onReset }) => {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0c10]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none text-white">
                StudyPlan<span className="text-indigo-500">OS</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Autonomous Academic Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> System Live</span>
              <span className="opacity-30">|</span>
              <span>Gemini 3 Pro Engine</span>
            </div>
            {onReset && (
              <button 
                onClick={onReset}
                className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-full transition-all"
              >
                Reset Core
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-12">{children}</main>
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Target Objective: 100% Syllabus Mastery</p>
      </footer>
    </div>
  );
};
