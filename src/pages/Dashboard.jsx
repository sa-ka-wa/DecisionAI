import React, { useState, useEffect } from "react";
import PriorityList from "../components/PriorityList";
import DashboardChart from "../components/DashboardChart";
import { getTasks } from "../services/api";
import "../Pages.Styles/Dashboard.css";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "high") return task.priority <= 2;
    if (filter === "medium") return task.priority === 3;
    if (filter === "low") return task.priority >= 4;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") return a.priority - b.priority;
    if (sortBy === "impact") return b.impact - a.impact;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const stats = {
    highImpact: tasks.filter((t) => t.impact >= 8).length,
    critical: tasks.filter((t) => t.priority === 1).length,
    avgImpact:
      tasks.reduce((sum, t) => sum + t.impact, 0) / (tasks.length || 1),
  };

  return (
    <div>
      <div className="dashboard-header mb-8">
        <h1>Decision Analytics Dashboard</h1>
        <p>
          AI-powered insights and visualizations for informed decision making
        </p>
      </div>

      <div className="stats-grid mb-8">
        <div className="stat-card high-impact">
          <div className="stat-header">
            <div>
              <div className="stat-title">High Impact Tasks</div>
              <div className="stat-value">{stats.highImpact}</div>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
          <div className="stat-footer">Tasks with impact ≥ 8/10</div>
        </div>

        <div className="stat-card critical-priority">
          <div className="stat-header">
            <div>
              <div className="stat-title">Critical Priority</div>
              <div className="stat-value">{stats.critical}</div>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
          <div className="stat-footer">
            Priority 1 tasks requiring immediate attention
          </div>
        </div>

        <div className="stat-card avg-impact">
          <div className="stat-header">
            <div>
              <div className="stat-title">Average Impact</div>
              <div className="stat-value">{stats.avgImpact.toFixed(1)}/10</div>
            </div>
            <div className="text-3xl">📊</div>
          </div>
          <div className="stat-footer">Overall task impact score</div>
        </div>
      </div>

      <div className="filter-sort mb-6">
        <div>
          <label>Filter by Priority</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="high">High (1-2)</option>
            <option value="medium">Medium (3)</option>
            <option value="low">Low (4-5)</option>
          </select>
        </div>

        <div>
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priority">Priority</option>
            <option value="impact">Impact</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>

        <div className="task-count">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      <div className="dashboard-main-grid">
        <PriorityList tasks={sortedTasks} />
        <DashboardChart tasks={sortedTasks} />
      </div>

      <div className="dashboard-card">
        <h2 className="text-xl font-bold text-gray-800 mb-6">AI Insights</h2>
        <div className="ai-grid">
          <div className="ai-card">
            <div className="ai-header">
              <div className="ai-avatar blue">AI</div>
              <div>
                <div className="ai-title">Optimization Tip</div>
                <div className="ai-subtitle">Based on your data</div>
              </div>
            </div>
            <p>
              Focus on the 3 highest impact tasks first. This will give you 80%
              of the results with 20% of the effort.
            </p>
          </div>

          <div className="ai-card">
            <div className="ai-header">
              <div className="ai-avatar purple">AI</div>
              <div>
                <div className="ai-title">Risk Alert</div>
                <div className="ai-subtitle">Attention required</div>
              </div>
            </div>
            <p>
              You have {tasks.filter((t) => t.priority === 1).length} critical
              tasks. Consider delegating or breaking them down.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
