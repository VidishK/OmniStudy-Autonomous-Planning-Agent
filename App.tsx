
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { SetupView } from './components/SetupView';
import { PlanDashboard } from './components/PlanDashboard';
import { StudyPlanOS, UserConstraints, TaskStatus, StudyTask } from './types';
import { generateInitialPlan, rebalancePlanOS } from './services/geminiService';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [plan, setPlan] = useState<StudyPlanOS | null>(null);
  const [constraints, setConstraints] = useState<UserConstraints | null>(null);

  const handleGeneratePlan = async (userConstraints: UserConstraints) => {
    setIsInitializing(true);
    try {
      const generated = await generateInitialPlan(userConstraints);
      setPlan(generated);
      setConstraints(userConstraints);
    } catch (error) {
      console.error("Failed to generate plan:", error);
      alert("Error generating plan. Check API Key or try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (!plan || !plan.study_plan) return;
    
    const newPlan = { ...plan };
    newPlan.study_plan = newPlan.study_plan.map(week => ({
      ...week,
      sessions: (week.sessions || []).map(session => ({
        ...session,
        tasks: (session.tasks || []).map(task => 
          task.task_id === taskId ? { ...task, status: newStatus } : task
        )
      }))
    }));

    setPlan(newPlan);
    if (newStatus === 'missed') {
      handleRebalance(newPlan);
    }
  };

  const handleUpdateTask = (updatedTask: StudyTask) => {
    if (!plan) return;
    const newPlan = { ...plan };
    newPlan.study_plan = newPlan.study_plan.map(week => ({
      ...week,
      sessions: (week.sessions || []).map(session => ({
        ...session,
        tasks: (session.tasks || []).map(task => 
          task.task_id === updatedTask.task_id ? updatedTask : task
        )
      }))
    }));
    setPlan(newPlan);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!plan) return;
    const newPlan = { ...plan };
    newPlan.study_plan = newPlan.study_plan.map(week => ({
      ...week,
      sessions: (week.sessions || []).map(session => ({
        ...session,
        tasks: (session.tasks || []).filter(task => task.task_id !== taskId)
      }))
    }));
    setPlan(newPlan);
  };

  const handleAddTask = (weekIndex: number, sessionIndex: number, newTask: StudyTask) => {
    if (!plan) return;
    const newPlan = { ...plan };
    const week = newPlan.study_plan[weekIndex];
    if (week && week.sessions[sessionIndex]) {
      week.sessions[sessionIndex].tasks = [...(week.sessions[sessionIndex].tasks || []), newTask];
      setPlan({ ...newPlan });
    }
  };

  const handleRebalance = async (currentPlanOverride?: StudyPlanOS) => {
    const targetPlan = currentPlanOverride || plan;
    if (!targetPlan || !constraints || isRebalancing) return;
    
    setIsRebalancing(true);
    try {
      const rebalanced = await rebalancePlanOS(targetPlan, constraints);
      setPlan(rebalanced);
    } catch (error) {
      console.error("Rebalance failed:", error);
    } finally {
      setIsRebalancing(false);
    }
  };

  return (
    <Layout>
      {!plan ? (
        <SetupView onPlanGenerated={handleGeneratePlan} isLoading={isInitializing} />
      ) : (
        <PlanDashboard 
          plan={plan} 
          onUpdateStatus={handleUpdateStatus}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleAddTask}
          onRebalance={() => handleRebalance()}
          isRebalancing={isRebalancing}
        />
      )}
    </Layout>
  );
};

export default App;
