
import React, { useState } from 'react';
import { StudyTask, TaskStatus, TaskType } from '../types';

interface Props {
  task: StudyTask;
  onStatusUpdate: (status: TaskStatus) => void;
  onUpdateTask: (task: StudyTask) => void;
  onDeleteTask: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  reading: 'bg-blue-100 text-blue-700',
  problem_set: 'bg-orange-100 text-orange-700',
  project: 'bg-purple-100 text-purple-700',
  review: 'bg-emerald-100 text-emerald-700',
  practice_exam: 'bg-rose-100 text-rose-700',
  admin: 'bg-slate-100 text-slate-700',
};

export const TaskCard: React.FC<Props> = ({ task, onStatusUpdate, onUpdateTask, onDeleteTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<StudyTask>({ ...task });

  const isCompleted = task.status === 'completed';
  const isMissed = task.status === 'missed';

  const handleSave = () => {
    onUpdateTask(editedTask);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border-2 border-indigo-500 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Task Title</label>
          <input 
            className="w-full text-md font-bold p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={editedTask.title} 
            onChange={e => setEditedTask({...editedTask, title: e.target.value})}
            placeholder="What needs to be done?"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Category</label>
            <select 
              className="w-full text-xs font-bold p-3 border rounded-xl bg-slate-50 outline-none"
              value={editedTask.type}
              onChange={e => setEditedTask({...editedTask, type: e.target.value as TaskType})}
            >
              {["reading", "problem_set", "project", "review", "practice_exam", "admin"].map(t => (
                <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Duration (Mins)</label>
            <input 
              type="number"
              className="w-full text-xs font-bold p-3 border rounded-xl bg-slate-50 outline-none"
              placeholder="Minutes"
              value={editedTask.est_minutes}
              onChange={e => setEditedTask({...editedTask, est_minutes: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={handleSave} className="flex-grow bg-indigo-600 text-white text-xs font-black py-3 rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-200">Save Mission Update</button>
          <button onClick={() => setIsEditing(false)} className="px-6 bg-slate-100 text-slate-600 text-xs font-black py-3 rounded-xl uppercase tracking-widest">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border transition-all group relative overflow-hidden ${
      isCompleted ? 'opacity-60 bg-slate-50 grayscale' : 'hover:border-indigo-300 shadow-sm hover:shadow-md'
    } ${isMissed ? 'border-rose-500 bg-rose-50 shadow-rose-100 ring-2 ring-rose-500 ring-offset-0' : 'border-slate-100'}`}>
      
      {isMissed && (
        <div className="bg-rose-600 text-white text-[9px] font-black px-4 py-1 text-center uppercase tracking-widest">
          ⚠️ Missed - Added to Backlog
        </div>
      )}

      <div className="p-4 flex gap-4">
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${TYPE_COLORS[task.type] || 'bg-slate-100 text-slate-600'}`}>
                  {task.type.replace('_', ' ')}
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {task.est_minutes} MINS • PRIORITY {task.priority_1to5}/5
                </span>
              </div>
              <h4 className={`text-md font-bold text-slate-800 leading-tight ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </h4>
            </div>
            
            <div className="flex items-center gap-1 shrink-0 ml-4">
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                  title="Edit Task Details"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={onDeleteTask}
                  className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  title="Remove from Schedule"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="h-6 w-px bg-slate-100 mx-1" />

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onStatusUpdate(isCompleted ? 'planned' : 'completed')}
                  className={`p-2.5 rounded-xl transition-all ${
                    isCompleted ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-400 hover:bg-emerald-100 hover:text-emerald-700'
                  }`}
                  title="Complete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => onStatusUpdate(isMissed ? 'planned' : 'missed')}
                  className={`p-2.5 rounded-xl transition-all ${
                    isMissed ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-400 hover:bg-rose-100 hover:text-rose-700'
                  }`}
                  title="Missed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
