
import React, { useState } from 'react';
import { StudyTask, TaskType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: StudyTask) => void;
}

export const AddTaskModal: React.FC<Props> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [type, setType] = useState<TaskType>('reading');
  const [minutes, setMinutes] = useState(60);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newTask: StudyTask = {
      task_id: `manual-${Date.now()}`,
      title,
      course: course || "Manual Entry",
      type,
      deliverable: "",
      est_minutes: minutes,
      difficulty_1to5: 3,
      priority_1to5: 3,
      deadline: null,
      status: "planned",
      depends_on: [],
      reasoning: "Manually prioritized by student."
    };

    onAdd(newTask);
    setTitle('');
    setCourse('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#12141c] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Inject New Task</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Task Identification</label>
              <input 
                autoFocus
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Review Week 3 Quiz Prep"
                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Course Code</label>
                <input 
                  type="text" 
                  value={course} 
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="ECON 101"
                  className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration (Min)</label>
                <input 
                  type="number" 
                  value={minutes} 
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Task Classification</label>
              <div className="grid grid-cols-3 gap-2">
                {(['reading', 'problem_set', 'project', 'review', 'practice_exam', 'admin'] as TaskType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${type === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
            >
              Add to Schedule
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
