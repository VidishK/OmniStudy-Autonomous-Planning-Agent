
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SetupView } from './components/SetupView';
import { PlanDashboard } from './components/PlanDashboard';
import { StudyPlanResponse, UserConstraints, TaskStatus, StudyTask } from './types';
import { generateInitialPlan, rebalancePlanOS, adjustPlanOS } from './services/geminiService';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
    if (fullResponse) {
      localStorage.setItem('study_plan_full_response', JSON.stringify(fullResponse));
    }
    localStorage.setItem('study_plan_selected_idx', JSON.stringify(selectedOptionIdx));
    if (constraints) {
      localStorage.setItem('study_constraints', JSON.stringify(constraints));
    }
  }, [fullResponse, selectedOptionIdx, constraints]);

  const handleGeneratePlan = async (userConstraints: UserConstraints) => {
    setIsInitializing(true);
    setErrorMessage(null);
    try {
      const response = await generateInitialPlan(userConstraints);
      setFullResponse(response);
      setSelectedOptionIdx(0);
      setConstraints(userConstraints);
      localStorage.removeItem('study_plan_finalized');
    } catch (error: any) {
      console.error("Failed to generate plan:", error);
      const msg = error.message || "Operational error during initialization.";
      setErrorMessage(msg);
      alert(msg);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAdjust = async (command: string) => {
    if (!fullResponse || !constraints || isRebalancing) return;
    setIsRebalancing(true);
    try {
      const response = await adjustPlanOS(fullResponse, command, constraints);
      setFullResponse(response);
    } catch (error) {
      console.error("Adjustment sequence failed:", error);
    } finally {
      setIsRebalancing(false);
    }
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    if (!fullResponse) return;
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
    if (!fullResponse) return;
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
    if (!fullResponse) return;
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
    if (!fullResponse) return;
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
    if (!constraints || isRebalancing || !fullResponse) return;
    setIsRebalancing(true);
    try {
      const response = await rebalancePlanOS(fullResponse, constraints);
      setFullResponse(response);
    } catch (error) {
      console.error("System rebalance failed:", error);
    } finally {
      setIsRebalancing(false);
    }
  };

  const handleReset = () => {
    if (confirm("Initiate memory purge? All trajectories and constraints will be cleared.")) {
      localStorage.clear();
      setFullResponse(null);
      setConstraints(null);
      setSelectedOptionIdx(0);
      window.location.reload();
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
          onAdjust={handleAdjust}
          isRebalancing={isRebalancing}
        />
      )}
    </Layout>
  );
};

export default App;

