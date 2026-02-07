import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTasks } from "../services/api";
import "../Pages.Styles/Home.css";

const Home = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completed: 0,
    criticalPriority: 0,
    avgImpact: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const fetchStats = () => {
      const tasks = getTasks();
      const completed = tasks.filter((t) => t.status === "completed").length;
      const criticalPriority = tasks.filter((t) => t.priority <= 2).length;
      const avgImpact =
        tasks.reduce((sum, t) => sum + t.impact, 0) / (tasks.length || 1);
      const completionRate =
        tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

      setStats({
        totalTasks: tasks.length,
        completed,
        criticalPriority,
        avgImpact: avgImpact.toFixed(1),
        completionRate,
      });
    };

    fetchStats();
  }, []);

  const recentTasks = getTasks().slice(0, 3);

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="hero">
        <h1>
          AI-Assisted <span className="gradient-text">Decision Dashboard</span>
        </h1>
        <p>
          Prioritize what matters. Track impact. Ship faster with AI-powered
          task intelligence.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card-gradient dashboard-card">
          <div className="flex justify-between">
            <div>
              <div className="stat-title">Total Tasks</div>
              <div className="stat-value">{stats.totalTasks}</div>
            </div>
            <div className="text-3xl">📊</div>
          </div>
          <div className="stat-footer">+2 this week</div>
        </div>

        <div className="stat-card-gradient-success dashboard-card">
          <div className="flex justify-between">
            <div>
              <div className="stat-title">Completed</div>
              <div className="stat-value">{stats.completed}</div>
            </div>
            <div className="text-3xl">✅</div>
          </div>
          <div className="stat-footer">
            {stats.completionRate}% completion rate
          </div>
        </div>

        <div className="stat-card-gradient-warning dashboard-card">
          <div className="flex justify-between">
            <div>
              <div className="stat-title">Critical Priority</div>
              <div className="stat-value">{stats.criticalPriority}</div>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
          <div className="stat-footer">Needs immediate attention</div>
        </div>

        <div className="stat-card-gradient-danger dashboard-card">
          <div className="flex justify-between">
            <div>
              <div className="stat-title">Avg Impact</div>
              <div className="stat-value">{stats.avgImpact}</div>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
          <div className="stat-footer">Overall task impact score</div>
        </div>
      </div>

      {/* Recent Tasks & AI */}
      <div className="recent-ai-grid">
        {/* Recent Tasks */}
        <div>
          <div className="dashboard-card">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Tasks</h2>
              <Link to="/tasks" className="text-blue-600 font-medium text-sm">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="recent-task-card">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {task.description}
                      </p>
                    </div>
                    <span
                      className={`status-badge ${
                        task.status === "completed"
                          ? "status-completed"
                          : task.status === "in-progress"
                            ? "status-in-progress"
                            : "status-pending"
                      }`}
                    >
                      {task.status === "in-progress"
                        ? "In-progress"
                        : task.status === "completed"
                          ? "Completed"
                          : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between mt-3">
                    <span
                      className={`category-tag ${
                        "category-" + task.category.toLowerCase()
                      }`}
                    >
                      {task.category}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`priority-badge ${
                          task.priority <= 2
                            ? "priority-critical"
                            : task.priority === 3
                              ? "priority-urgent"
                              : "priority-high"
                        }`}
                      >
                        {task.priority <= 2
                          ? "Critical"
                          : task.priority === 3
                            ? "Urgent"
                            : "High"}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        Impact: {task.impact}/10
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(task.dueDate), "MMM dd")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="ai-bubble">
          <div className="flex items-center mb-4">
            <div className="ai-avatar blue">AI</div>
            <div>
              <h3 className="font-bold text-gray-800">AI Recommendations</h3>
              <p className="text-sm text-gray-600">
                Based on your current workload
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="ai-card blue">
              <div className="flex items-center mb-1">
                <span className="text-blue-500 mr-2">🎯</span>
                <span className="font-medium text-sm text-gray-800">
                  Focus Priority
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Complete 2 high-impact tasks today to maximize ROI
              </p>
            </div>

            <div className="ai-card purple">
              <div className="flex items-center mb-1">
                <span className="text-purple-500 mr-2">🚀</span>
                <span className="font-medium text-sm text-gray-800">
                  Quick Win
                </span>
              </div>
              <p className="text-sm text-gray-600">
                "User research interviews" can be completed in 2 hours
              </p>
            </div>

            <div className="ai-card green">
              <div className="flex items-center mb-1">
                <span className="text-green-500 mr-2">📈</span>
                <span className="font-medium text-sm text-gray-800">
                  Trend Alert
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Design tasks have 40% higher impact than average
              </p>
            </div>
          </div>

          <button className="btn-primary mt-6 w-full">
            Generate Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function for date formatting
function format(date, formatString) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const d = new Date(date);
  if (formatString === "MMM dd") {
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }
  return date.toString();
}

export default Home;
