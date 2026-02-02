
import React, { useState } from 'react';

interface Props {
  onAdjust: (command: string) => void;
  isLoading: boolean;
}

export const QuickAdjust: React.FC<Props> = ({ onAdjust, isLoading }) => {
  const [command, setCommand] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isLoading) return;
    onAdjust(command);
    setCommand('');
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
      <form 
        onSubmit={handleSubmit}
        className="relative bg-[#0a0c10] border border-white/10 rounded-[2rem] p-2 flex items-center shadow-2xl"
      >
        <div className="flex-shrink-0 ml-6 mr-4">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-indigo-500'}`}></div>
        </div>
        <input 
          disabled={isLoading}
          type="text" 
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={isLoading ? "Reprogramming StudyPlanOS..." : "Type adjustment (e.g., 'Make this week lighter', 'I have a quiz Friday')..."}
          className="flex-grow bg-transparent border-none outline-none py-4 text-sm font-bold text-white placeholder:text-slate-600"
        />
        <button 
          disabled={!command.trim() || isLoading}
          type="submit"
          className="mr-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all"
        >
          {isLoading ? "Syncing..." : "Execute"}
        </button>
      </form>
      <div className="mt-3 px-8 flex gap-4 overflow-x-auto no-scrollbar">
         {["Lighter Friday", "Heavier Weekends", "Skip tomorrow", "Study earlier"].map((suggestion) => (
           <button 
             key={suggestion}
             onClick={() => setCommand(suggestion)}
             className="text-[9px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest whitespace-nowrap transition-colors"
           >
             + {suggestion}
           </button>
         ))}
      </div>
    </div>
  );
};
