
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SetupView } from './components/SetupView';
import { PlanDashboard } from './components/PlanDashboard';
import { StudyPlanResponse, UserConstraints, TaskStatus, StudyTask, StudyPlanOS } from './types';
import { generateInitialPlan, rebalancePlanOS } from './services/geminiService';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [fullResponse, setFullResponse] = useState<StudyPlanResponse | null>(() => {
    const saved = localStorage.getItem('study_plan_full_response');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number>(() => {
    const saved = localStorage.getItem('study_plan_selected_idx');
    return saved ? JSON.parse(saved) : 0;
  });
  const [constraints, setConstraints] = useState<UserConstraints | null>(() => {
    const saved = localStorage.getItem('study_constraints');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (fullResponse) localStorage.setItem('study_plan_full_response', JSON.stringify(fullResponse));
    localStorage.setItem('study_plan_selected_idx', JSON.stringify(selectedOptionIdx));
    if (constraints) localStorage.setItem('study_constraints', JSON.stringify(constraints));
  }, [fullResponse, selectedOptionIdx, constraints]);

  const handleGeneratePlan = async (userConstraints: UserConstraints) => {
    setIsInitializing(true);
    try {
      const response = await generateInitialPlan(userConstraints);
      setFullResponse(response);
      setSelectedOptionIdx(0);
      setConstraints(userConstraints);
    } catch (error) {
      console.error("Failed to generate plan:", error);
      alert("Error generating plan options. Ensure your API Key is valid and syllabus is concise.");
    } finally {
      setIsInitializing(false);
    }
  };

  const currentPlan = fullResponse?.schedule_options[selectedOptionIdx] || null;

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    if (!fullResponse || !currentPlan) return;
    
    const updatedOptions = fullResponse.schedule_options.map((opt, idx) => {
      if (idx !== selectedOptionIdx) return opt;
      return {
        ...opt,
        study_plan: opt.study_plan.map(week => ({
          ...week,
          sessions: week.sessions.map(session => ({
            ...session,
            tasks: session.tasks.map(task => 
              task.task_id === taskId ? { ...task, status: newStatus } : task
            )
          }))
        }))
      };
    });

    setFullResponse({ ...fullResponse, schedule_options: updatedOptions });
  };

  const handleUpdateTask = (updatedTask: StudyTask) => {
    if (!fullResponse || !currentPlan) return;
    const updatedOptions = fullResponse.schedule_options.map((opt, idx) => {
      if (idx !== selectedOptionIdx) return opt;
      return {
        ...opt,
        study_plan: opt.study_plan.map(week => ({
          ...week,
          sessions: week.sessions.map(session => ({
            ...session,
            tasks: session.tasks.map(task => 
              task.task_id === updatedTask.task_id ? updatedTask : task
            )
          }))
        }))
      };
    });
    setFullResponse({ ...fullResponse, schedule_options: updatedOptions });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!fullResponse || !currentPlan) return;
    const updatedOptions = fullResponse.schedule_options.map((opt, idx) => {
      if (idx !== selectedOptionIdx) return opt;
      return {
        ...opt,
        study_plan: opt.study_plan.map(week => ({
          ...week,
          sessions: week.sessions.map(session => ({
            ...session,
            tasks: session.tasks.filter(task => task.task_id !== taskId)
          }))
        }))
      };
    });
    setFullResponse({ ...fullResponse, schedule_options: updatedOptions });
  };

  const handleAddTask = (weekIdx: number, sessionIdx: number, newTask: StudyTask) => {
    if (!fullResponse || !currentPlan) return;
    const updatedOptions = [...fullResponse.schedule_options];
    const opt = { ...updatedOptions[selectedOptionIdx] };
    const weeks = [...opt.study_plan];
    const week = { ...weeks[weekIdx] };
    const sessions = [...week.sessions];
    const session = { ...sessions[sessionIdx] };
    session.tasks = [...session.tasks, newTask];
    sessions[sessionIdx] = session;
    week.sessions = sessions;
    weeks[weekIdx] = week;
    opt.study_plan = weeks;
    updatedOptions[selectedOptionIdx] = opt;
    setFullResponse({ ...fullResponse, schedule_options: updatedOptions });
  };

  const handleRebalance = async () => {
    if (!constraints || isRebalancing) return;
    setIsRebalancing(true);
    try {
      const response = await rebalancePlanOS(fullResponse, constraints);
      setFullResponse(response);
    } catch (error) {
      console.error("Rebalance failed:", error);
    } finally {
      setIsRebalancing(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset core memory? All schedule variants will be purged.")) {
      localStorage.clear();
      setFullResponse(null);
      setConstraints(null);
      setSelectedOptionIdx(0);
    }
  };

  return (
    <Layout onReset={fullResponse ? handleReset : undefined}>
      {!fullResponse ? (
        <SetupView onPlanGenerated={handleGeneratePlan} isLoading={isInitializing} />
      ) : (
        <PlanDashboard 
          fullResponse={fullResponse}
          selectedIdx={selectedOptionIdx}
          onSelectOption={setSelectedOptionIdx}
          onUpdateStatus={handleUpdateStatus}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleAddTask}
          onRebalance={handleRebalance}
          isRebalancing={isRebalancing}
        />
      )}
    </Layout>
  );
};

export default App;
