
import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SetupView } from './components/SetupView';
import { PlanDashboard } from './components/PlanDashboard';
import { StudyPlan, UserConstraints, TaskStatus, RebalanceLog } from './types';
import { generateInitialPlan, rebalancePlan } from './services/geminiService';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [constraints, setConstraints] = useState<UserConstraints | null>(null);
  const [logs, setLogs] = useState<RebalanceLog[]>([]);

  const handleGeneratePlan = async (userConstraints: UserConstraints) => {
    setIsInitializing(true);
    try {
      const generated = await generateInitialPlan(userConstraints);
      setPlan(generated);
      setConstraints(userConstraints);
      setLogs([{
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        reason: generated.agentRational || "Initial course mapping completed.",
        previousTaskCount: 0,
        newTaskCount: generated.tasks.length
      }]);
    } catch (error) {
      console.error("Failed to generate plan:", error);
      alert("Error generating plan. Check API Key or try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    if (!plan) return;
    setPlan({
      ...plan,
      tasks: plan.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    });
  };

  const handleRebalance = async () => {
    if (!plan || !constraints || isRebalancing) return;
    
    setIsRebalancing(true);
    try {
      // Logic: Determine current week based on date
      const start = new Date(constraints.startDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - start.getTime());
      const currentWeek = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)) || 1;

      const rebalanced = await rebalancePlan(plan, constraints, currentWeek);
      
      setLogs(prev => [{
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        reason: rebalanced.agentRational || "Agent adjusted future schedule to maintain compliance.",
        previousTaskCount: plan.tasks.length,
        newTaskCount: rebalanced.tasks.length
      }, ...prev]);

      setPlan(rebalanced);
    } catch (error) {
      console.error("Rebalance failed:", error);
      alert("Rebalancing failed. The agent hit a wall!");
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
          constraints={constraints!} 
          logs={logs}
          onUpdateStatus={handleUpdateStatus}
          onRebalance={handleRebalance}
          isRebalancing={isRebalancing}
        />
      )}
    </Layout>
  );
};

export default App;
