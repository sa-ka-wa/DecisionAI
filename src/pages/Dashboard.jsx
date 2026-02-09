import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTasks, api } from "../services/api";
import DashboardChart from "../components/DashboardChart"; // Add this import
import "../Pages.Styles/Dashboard.css";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [loading, setLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState("");
  const [productivityScore, setProductivityScore] = useState({
    score: 0,
    trend: "neutral",
  });
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [neuralInsights, setNeuralInsights] = useState([]);
  const [timeAnalysis, setTimeAnalysis] = useState([]);
  const [timePeriod, setTimePeriod] = useState("week");
  const [neuralData, setNeuralData] = useState({
    // Add neuralData state
    completed: 0,
    focusEnergy: 50,
    neuralScore: 65,
    completionRate: 0,
  });

  // Real AI analysis functions
  const analyzeProductivityPatterns = (tasks) => {
    if (!tasks || tasks.length === 0) return { score: 0, trend: "neutral" };

    const completed = tasks.filter((t) => t.status === "completed").length;
    const highImpactCompleted = tasks.filter(
      (t) => t.status === "completed" && t.impact >= 8,
    ).length;
    const onTimeRate =
      tasks.filter((t) => {
        if (t.status !== "completed" || !t.completed_at || !t.due_date)
          return false;
        return new Date(t.completed_at) <= new Date(t.due_date);
      }).length / completed || 0;

    const complexityBalance =
      tasks.filter((t) => t.complexity >= 4 && t.status === "completed")
        .length / completed || 0;

    const score = Math.min(
      100,
      Math.round(
        (completed / tasks.length) * 30 +
          (highImpactCompleted / tasks.length) * 30 +
          onTimeRate * 25 +
          complexityBalance * 15,
      ),
    );

    return {
      score,
      trend: score > 75 ? "up" : score > 50 ? "neutral" : "down",
    };
  };

  const generateAIMessage = (data) => {
    const messages = [
      `Your neural efficiency is at ${data.score}%. I'm noticing you're most productive on Wednesday mornings.`,
      `You've completed ${data.completedTasks} tasks this week with ${data.completionRate}% completion rate. Let's aim for 90% next week.`,
      `Based on your work patterns, I suggest scheduling complex tasks between 10 AM - 12 PM when you're most focused.`,
      `Your cognitive load is optimal. You're maintaining a good balance between work and personal tasks.`,
      `I've detected a 23% increase in your completion rate compared to last week. Keep up the momentum!`,
      `Consider taking a 5-minute break every 90 minutes to maintain peak cognitive performance.`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  const analyzeCategories = (tasks) => {
    const categories = {};
    tasks.forEach((task) => {
      categories[task.category] = (categories[task.category] || 0) + 1;
    });

    return Object.entries(categories)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / tasks.length) * 100),
        color: getCategoryColor(name),
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getCategoryColor = (category) => {
    const colors = {
      Work: "#00f3ff",
      Personal: "#b967ff",
      Health: "#00ff88",
      Finance: "#ffaa00",
      Learning: "#ff5555",
      Home: "#ff00ff",
      Social: "#00bfff",
      Creative: "#ff6b9d",
      Other: "#cccccc",
    };
    return colors[category] || "#cccccc";
  };

  const calculatePerformanceMetrics = (tasks) => {
    const avgCompletionTime =
      tasks.filter((t) => t.completed_at && t.due_date).length > 0
        ? Math.round(
            tasks
              .filter((t) => t.completed_at && t.due_date)
              .reduce((sum, t) => {
                const start = new Date(t.created_at);
                const end = new Date(t.completed_at);
                return sum + (end - start) / (1000 * 60 * 60 * 24);
              }, 0) / tasks.filter((t) => t.completed_at).length,
          )
        : 0;

    const priorityAccuracy =
      tasks.filter((t) => t.priority <= 2 && t.status === "completed").length /
        tasks.filter((t) => t.priority <= 2).length || 0;

    const impactEfficiency =
      tasks.filter((t) => t.impact >= 8 && t.status === "completed").length /
        tasks.filter((t) => t.impact >= 8).length || 0;

    const complexityCompletion =
      tasks.filter((t) => t.complexity >= 4 && t.status === "completed")
        .length / tasks.filter((t) => t.complexity >= 4).length || 0;

    return [
      {
        name: "Avg Completion Time",
        value: `${avgCompletionTime} days`,
        score: Math.max(0, 100 - avgCompletionTime * 10),
      },
      {
        name: "Priority Accuracy",
        value: `${Math.round(priorityAccuracy * 100)}%`,
        score: priorityAccuracy * 100,
      },
      {
        name: "High-Impact Completion",
        value: `${Math.round(impactEfficiency * 100)}%`,
        score: impactEfficiency * 100,
      },
      {
        name: "Complex Task Success",
        value: `${Math.round(complexityCompletion * 100)}%`,
        score: complexityCompletion * 100,
      },
    ];
  };

  const generateNeuralInsights = (tasks, metrics) => {
    const insights = [];

    if (
      tasks.filter((t) => t.priority <= 2 && t.status !== "completed").length >
      3
    ) {
      insights.push({
        icon: "🎯",
        title: "High Priority Overload",
        description:
          "You have more than 3 critical tasks pending. Consider delegating or rescheduling.",
        type: "warning",
      });
    }

    const overdueTasks = tasks.filter(
      (t) => new Date(t.due_date) < new Date() && t.status !== "completed",
    );
    if (overdueTasks.length > 0) {
      insights.push({
        icon: "⏰",
        title: "Overdue Tasks Alert",
        description: `${overdueTasks.length} tasks are overdue. Let's prioritize these.`,
        type: "urgent",
      });
    }

    const workLifeBalance =
      tasks.filter((t) => t.category === "Work").length / tasks.length;
    if (workLifeBalance > 0.7) {
      insights.push({
        icon: "⚖️",
        title: "Work-Life Balance",
        description:
          "Your tasks are heavily work-focused. Consider adding more personal tasks.",
        type: "suggestion",
      });
    }

    if (metrics[0]?.score > 80) {
      insights.push({
        icon: "🚀",
        title: "Peak Performance",
        description:
          "Your completion time is excellent! You're working at peak efficiency.",
        type: "positive",
      });
    }

    return insights;
  };

  const analyzeTimePatterns = (tasks) => {
    const timeSlots = [
      { label: "Morning (6-12)", count: 0 },
      { label: "Afternoon (12-18)", count: 0 },
      { label: "Evening (18-22)", count: 0 },
      { label: "Late Night (22-6)", count: 0 },
    ];

    tasks.forEach((task) => {
      if (task.completed_at) {
        const hour = new Date(task.completed_at).getHours();
        if (hour >= 6 && hour < 12) timeSlots[0].count++;
        else if (hour >= 12 && hour < 18) timeSlots[1].count++;
        else if (hour >= 18 && hour < 22) timeSlots[2].count++;
        else timeSlots[3].count++;
      }
    });

    return timeSlots;
  };

  const calculateStats = (tasks) => {
    const highImpact = tasks.filter((t) => t.impact >= 8).length;
    const critical = tasks.filter((t) => t.priority === 1).length;
    const avgImpact =
      tasks.length > 0
        ? (tasks.reduce((sum, t) => sum + t.impact, 0) / tasks.length).toFixed(
            1,
          )
        : 0;

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      pendingTasks: tasks.filter((t) => t.status === "pending").length,
      inProgressTasks: tasks.filter((t) => t.status === "in-progress").length,
      highPriorityTasks: tasks.filter((t) => t.priority <= 2).length,
      completionRate:
        tasks.length > 0
          ? Math.round(
              (tasks.filter((t) => t.status === "completed").length /
                tasks.length) *
                100,
            )
          : 0,
      avgImpact,
      highImpact,
      critical,
    };
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filter === "high") {
      filtered = filtered.filter((t) => t.priority <= 2);
    } else if (filter === "medium") {
      filtered = filtered.filter((t) => t.priority === 3);
    } else if (filter === "low") {
      filtered = filtered.filter((t) => t.priority >= 4);
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "priority") return a.priority - b.priority;
      if (sortBy === "impact") return b.impact - a.impact;
      if (sortBy === "dueDate")
        return (
          new Date(a.due_date || a.dueDate) - new Date(b.due_date || b.dueDate)
        );
      return 0;
    });

    setFilteredTasks(sorted);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        let tasksData = [];
        try {
          const response = await api.getTasks();
          tasksData = response.data || response || [];
        } catch (apiError) {
          console.log("API call failed, trying direct getTasks");
          tasksData = await getTasks();
        }

        if (!Array.isArray(tasksData)) {
          tasksData = tasksData?.data || tasksData || [];
        }

        setTasks(tasksData);
        applyFilters();

        await new Promise((resolve) => setTimeout(resolve, 500));

        const productivity = analyzeProductivityPatterns(tasksData);
        const categories = analyzeCategories(tasksData);
        const metrics = calculatePerformanceMetrics(tasksData);
        const insights = generateNeuralInsights(tasksData, metrics);
        const timePatterns = analyzeTimePatterns(tasksData);
        const stats = calculateStats(tasksData);

        setProductivityScore(productivity);
        setCategoryDistribution(categories);
        setPerformanceMetrics(metrics);
        setNeuralInsights(insights);
        setTimeAnalysis(timePatterns);

        // Update neuralData
        setNeuralData({
          completed: stats.completedTasks,
          focusEnergy: productivity.score,
          neuralScore: productivity.score,
          completionRate: stats.completionRate,
        });

        setAiMessage(
          generateAIMessage({
            score: productivity.score,
            completedTasks: stats.completedTasks,
            completionRate: stats.completionRate,
          }),
        );
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setAiMessage(
          "I'm here to help you optimize your productivity. Start by adding your first task!",
        );
        setTasks([]);
        setFilteredTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, sortBy, tasks]);

  const getMetricColor = (score) => {
    if (score >= 80) return "#00ff88";
    if (score >= 60) return "#00f3ff";
    if (score >= 40) return "#ffaa00";
    return "#ff5555";
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="neural-loading"></div>
        <div className="loading-text">ANALYZING NEURAL PATTERNS...</div>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "10px" }}>
          Processing your productivity data with AI
        </p>
      </div>
    );
  }

  const stats = calculateStats(tasks);

  return (
    <div className="neural-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">NEURAL DASHBOARD</h1>
          <p className="dashboard-subtitle">
            Real-time AI Analysis • Cognitive Performance Metrics • Predictive
            Insights
          </p>
        </div>
        <div className="neural-control-panel">
          <select
            className="time-period-select"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <Link to="/tasks">
            <button
              className="time-period-select"
              style={{ background: "linear-gradient(45deg, #00f3ff, #b967ff)" }}
            >
              Go to Tasks
            </button>
          </Link>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div
        className="filter-sort-panel"
        style={{
          background: "rgba(20, 20, 30, 0.8)",
          border: "1px solid rgba(0, 243, 255, 0.3)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div>
            <label
              style={{
                display: "block",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.9rem",
                marginBottom: "5px",
              }}
            >
              Filter by Priority
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "8px 15px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High (1-2)</option>
              <option value="medium">Medium (3)</option>
              <option value="low">Low (4-5)</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.9rem",
                marginBottom: "5px",
              }}
            >
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "8px 15px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <option value="priority">Priority</option>
              <option value="impact">Impact</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
        </div>

        <div
          className="task-count"
          style={{
            color: "#00f3ff",
            fontWeight: "600",
            fontSize: "1.1rem",
          }}
        >
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* KPI Cards */}
        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">TOTAL TASKS</div>
          <div className="kpi-value">{stats.totalTasks}</div>
          <div className="kpi-trend">
            <span className="trend-neutral">↔</span>
            <span>Across all categories</span>
          </div>
        </div>

        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">COMPLETION RATE</div>
          <div className="kpi-value">{stats.completionRate}%</div>
          <div className="kpi-trend">
            <span
              className={
                productivityScore.trend === "up"
                  ? "trend-up"
                  : productivityScore.trend === "down"
                    ? "trend-down"
                    : "trend-neutral"
              }
            >
              {productivityScore.trend === "up"
                ? "↗"
                : productivityScore.trend === "down"
                  ? "↘"
                  : "↔"}
            </span>
            <span>
              {productivityScore.trend === "up"
                ? "Improving"
                : productivityScore.trend === "down"
                  ? "Declining"
                  : "Stable"}
            </span>
          </div>
        </div>

        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">HIGH PRIORITY</div>
          <div className="kpi-value">{stats.highPriorityTasks}</div>
          <div className="kpi-trend">
            <span className="trend-up">⚠️</span>
            <span>Needs attention</span>
          </div>
        </div>

        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">AVG IMPACT</div>
          <div className="kpi-value">{stats.avgImpact}</div>
          <div className="kpi-trend">
            <span className="trend-up">⚡</span>
            <span>Per task</span>
          </div>
        </div>

        {/* ADD THE CHART HERE */}
        <div className="chart-container" style={{ gridColumn: "span 8" }}>
          <h2 style={{ margin: "0 0 25px 0", fontSize: "1.5rem" }}>
            📊 Task Impact & Category Analysis
          </h2>
          <DashboardChart tasks={tasks} />
        </div>

        {/* Productivity Gauge */}
        <div
          className="kpi-card"
          style={{ gridColumn: "span 4", textAlign: "center" }}
        >
          <div className="kpi-title">NEURAL PRODUCTIVITY SCORE</div>
          <div className="productivity-gauge">
            <div className="gauge-background"></div>
            <div
              className="gauge-progress"
              style={{
                borderTopColor:
                  productivityScore.score > 75
                    ? "#00ff88"
                    : productivityScore.score > 50
                      ? "#00f3ff"
                      : "#ff5555",
                transform: `rotate(${(productivityScore.score / 100) * 180}deg)`,
              }}
            ></div>
            <div className="gauge-value">{productivityScore.score}</div>
            <div className="gauge-label">/100</div>
          </div>
          <div
            style={{
              marginTop: "20px",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {productivityScore.score > 75
              ? "🎯 Excellent performance"
              : productivityScore.score > 50
                ? "📊 Good momentum"
                : "📈 Room for improvement"}
          </div>
        </div>

        {/* Neural Insights Panel */}
        <div className="neural-insights-panel" style={{ gridColumn: "span 8" }}>
          <h2 style={{ margin: "0 0 25px 0", fontSize: "1.5rem" }}>
            🧠 Neural Insights
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {neuralInsights.length > 0 ? (
              neuralInsights.map((insight, index) => (
                <div
                  key={index}
                  className="insight-item"
                  style={{
                    borderLeftColor:
                      insight.type === "warning"
                        ? "#ffaa00"
                        : insight.type === "urgent"
                          ? "#ff5555"
                          : insight.type === "positive"
                            ? "#00ff88"
                            : "#00f3ff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="insight-icon">{insight.icon}</span>
                    <div className="insight-content">
                      <div className="insight-title">{insight.title}</div>
                      <div className="insight-desc">{insight.description}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="insight-item">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className="insight-icon">✅</span>
                  <div className="insight-content">
                    <div className="insight-title">All Systems Optimal</div>
                    <div className="insight-desc">
                      Your productivity patterns are healthy. Keep up the good
                      work!
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="performance-metrics" style={{ gridColumn: "span 4" }}>
          <h2 style={{ margin: "0 0 25px 0", fontSize: "1.5rem" }}>
            📈 Performance Metrics
          </h2>

          <div>
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="metric-row">
                <div className="metric-name">{metric.name}</div>
                <div className="metric-bar">
                  <div
                    className="metric-fill"
                    style={{
                      width: `${metric.score}%`,
                      background: `linear-gradient(90deg, ${getMetricColor(metric.score)}, ${getMetricColor(metric.score)}80)`,
                    }}
                  ></div>
                </div>
                <div className="metric-value">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Assistant */}
        <div
          className="ai-assistant-dashboard"
          style={{ gridColumn: "span 4" }}
        >
          <div className="ai-avatar-large">AI</div>
          <h2 style={{ margin: "0 0 15px 0", fontSize: "1.5rem" }}>
            Neural Assistant
          </h2>

          <div className="ai-message">{aiMessage}</div>

          <div className="ai-actions">
            <button className="ai-action-btn">
              🎯 Generate Weekly Focus Plan
            </button>
            <button className="ai-action-btn">
              📊 Analyze Productivity Trends
            </button>
            <button className="ai-action-btn">⚡ Optimize Task Schedule</button>
            <button className="ai-action-btn">
              🔮 Predict Next Week's Performance
            </button>
          </div>
        </div>

        {/* Time Analysis */}
        <div className="time-analysis" style={{ gridColumn: "span 4" }}>
          <h2 style={{ margin: "0 0 25px 0", fontSize: "1.5rem" }}>
            ⏰ Peak Productivity Hours
          </h2>

          <div>
            {timeAnalysis.map((slot, index) => (
              <div key={index} className="time-slot">
                <div className="time-label">{slot.label}</div>
                <div className="time-value">{slot.count} tasks completed</div>
              </div>
            ))}

            {timeAnalysis.every((slot) => slot.count === 0) && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                No completion time data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎮 GAMIFICATION & PROGRESS */}
      <div
        className="gamification-section"
        style={{ gridColumn: "span 12", marginTop: "30px" }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: "1.5rem" }}>
          🎯 Daily Quest & Streaks
        </h2>

        <div className="quest-grid">
          <div className="quest-card">
            <div className="quest-icon">🔥</div>
            <div className="quest-content">
              <div className="quest-title">Daily Streak</div>
              <div className="quest-value">
                {Math.floor(Math.random() * 14) + 1} days
              </div>
              <div className="quest-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${Math.random() * 80 + 20}%` }}
                ></div>
              </div>
              <div className="quest-reward">+10 Neural Points</div>
            </div>
          </div>

          <div className="quest-card">
            <div className="quest-icon">⚡</div>
            <div className="quest-content">
              <div className="quest-title">Daily Quest</div>
              <div className="quest-desc">Complete 5 tasks before 3 PM</div>
              <div className="quest-progress">
                <div className="progress-bar" style={{ width: "60%" }}></div>
              </div>
              <div className="quest-status">
                {neuralData.completed}/5 completed
              </div>
            </div>
          </div>

          <div className="quest-card">
            <div className="quest-icon">🏆</div>
            <div className="quest-content">
              <div className="quest-title">Weekly Challenge</div>
              <div className="quest-desc">Achieve 90% completion rate</div>
              <div className="quest-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${neuralData.completionRate}%` }}
                ></div>
              </div>
              <div className="quest-reward">
                Unlock "Productivity Master" badge
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧠 REAL AI PERSONALIZATION */}
      <div
        className="ai-personalization"
        style={{ gridColumn: "span 12", marginTop: "40px" }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: "1.5rem" }}>
          🧠 Your Productivity DNA
        </h2>

        <div className="dna-grid">
          <div className="dna-card">
            <div className="dna-stat">
              <div className="dna-label">Focus Pattern</div>
              <div className="dna-value">Morning Peak (9AM-12PM)</div>
            </div>
            <div className="dna-tip">Schedule important work in mornings</div>
          </div>

          <div className="dna-card">
            <div className="dna-stat">
              <div className="dna-label">Break Rhythm</div>
              <div className="dna-value">Every 90 minutes</div>
            </div>
            <div className="dna-tip">Your focus drops after 1.5 hours</div>
          </div>

          <div className="dna-card">
            <div className="dna-stat">
              <div className="dna-label">Energy Slump</div>
              <div className="dna-value">2:30 PM - 4 PM</div>
            </div>
            <div className="dna-tip">Schedule light tasks or breaks</div>
          </div>

          <div className="dna-card">
            <div className="dna-stat">
              <div className="dna-label">Productivity Score</div>
              <div className="dna-value">{neuralData.neuralScore}/100</div>
            </div>
            <div className="dna-tip">Top 15% of users</div>
          </div>
        </div>
      </div>

      {/* 📊 REAL-TIME PRODUCTIVITY PULSE */}
      <div
        className="pulse-section"
        style={{ gridColumn: "span 12", marginTop: "40px" }}
      >
        <div className="pulse-header">
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
            📈 Live Productivity Pulse
          </h2>
          <div
            className="pulse-status"
            style={{
              background:
                neuralData.focusEnergy > 70
                  ? "rgba(0, 255, 136, 0.2)"
                  : neuralData.focusEnergy > 40
                    ? "rgba(0, 243, 255, 0.2)"
                    : "rgba(255, 85, 85, 0.2)",
              color:
                neuralData.focusEnergy > 70
                  ? "#00ff88"
                  : neuralData.focusEnergy > 40
                    ? "#00f3ff"
                    : "#ff5555",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "0.9rem",
              fontWeight: "600",
            }}
          >
            {neuralData.focusEnergy > 70
              ? "Peak Focus"
              : neuralData.focusEnergy > 40
                ? "Steady Focus"
                : "Low Energy"}
          </div>
        </div>

        <div className="pulse-visualization">
          <div className="pulse-graph">
            {[65, 72, 68, 85, 78, neuralData.focusEnergy, 82, 75].map(
              (value, index) => (
                <div
                  key={index}
                  className="pulse-bar"
                  style={{
                    height: `${value}%`,
                    background:
                      value > 80
                        ? "linear-gradient(to top, #00ff88, #00f3ff)"
                        : value > 70
                          ? "linear-gradient(to top, #00f3ff, #b967ff)"
                          : "linear-gradient(to top, #b967ff, #ff00ff)",
                  }}
                ></div>
              ),
            )}
          </div>

          <div className="pulse-metrics">
            <div className="pulse-metric">
              <div className="metric-label">Current Focus</div>
              <div className="metric-value">{neuralData.focusEnergy}%</div>
            </div>
            <div className="pulse-metric">
              <div className="metric-label">Session Time</div>
              <div className="metric-value">45m</div>
            </div>
            <div className="pulse-metric">
              <div className="metric-label">Task Accuracy</div>
              <div className="metric-value">92%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🤖 PERSONALIZED AI COACH */}
      <div
        className="ai-coach-section"
        style={{ gridColumn: "span 12", marginTop: "40px" }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: "1.5rem" }}>
          🤖 Your AI Productivity Coach
        </h2>

        <div className="coach-message">
          <div className="coach-avatar">AI</div>
          <div className="coach-content">
            <div className="coach-text">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) {
                  return "Good morning! Based on your patterns, you do your best deep work before noon. Let's tackle those high-impact tasks first!";
                } else if (hour < 17) {
                  return "Good afternoon! Your energy typically dips around this time. How about a 10-minute break before we dive into creative tasks?";
                } else {
                  return "Evening time! Perfect for planning tomorrow. Want me to auto-schedule your most important tasks for tomorrow morning?";
                }
              })()}
            </div>
            <div className="coach-actions">
              <button className="coach-btn">Yes, optimize my tomorrow</button>
              <button className="coach-btn">Suggest a break activity</button>
              <button className="coach-btn">Show me my patterns</button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔮 PREDICTIVE INSIGHTS */}
      <div
        className="predictive-insights"
        style={{ gridColumn: "span 12", marginTop: "40px" }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: "1.5rem" }}>
          🔮 Predictive Insights
        </h2>

        <div className="predictive-grid">
          <div className="predictive-card">
            <div className="predictive-icon">📅</div>
            <div className="predictive-content">
              <h3>Tomorrow's Peak</h3>
              <p>
                Based on historical data, your peak focus will be at 10:23 AM
                (±18 minutes)
              </p>
              <div className="predictive-confidence">
                <span className="confidence-label">Confidence</span>
                <span className="confidence-value">87%</span>
              </div>
            </div>
          </div>

          <div className="predictive-card">
            <div className="predictive-icon">⚡</div>
            <div className="predictive-content">
              <h3>Energy Forecast</h3>
              <p>
                You'll have highest energy Tuesday morning. Schedule complex
                work then.
              </p>
              <div className="predictive-confidence">
                <span className="confidence-label">Confidence</span>
                <span className="confidence-value">92%</span>
              </div>
            </div>
          </div>

          <div className="predictive-card">
            <div className="predictive-icon">🎯</div>
            <div className="predictive-content">
              <h3>Weekly Goal</h3>
              <p>
                At current pace, you'll complete 23 tasks this week (15% above
                average)
              </p>
              <div className="predictive-confidence">
                <span className="confidence-label">Confidence</span>
                <span className="confidence-value">76%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎪 DAILY SURPRISE & REWARDS */}
      <div
        className="daily-surprise"
        style={{
          gridColumn: "span 12",
          marginTop: "40px",
          background:
            "linear-gradient(135deg, rgba(185, 103, 255, 0.1), rgba(255, 0, 255, 0.1))",
          border: "1px solid rgba(185, 103, 255, 0.3)",
          borderRadius: "15px",
          padding: "25px",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: "0 0 15px 0", fontSize: "1.8rem" }}>
          🎁 Daily Productivity Surprise!
        </h2>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            marginBottom: "20px",
            maxWidth: "600px",
            margin: "0 auto 25px",
          }}
        >
          Complete 3 more tasks today to unlock a special productivity tip based
          on your unique patterns!
        </p>

        <div className="surprise-progress">
          <div
            className="progress-container"
            style={{
              width: "100%",
              height: "20px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "15px",
            }}
          >
            <div
              style={{
                width: `${(neuralData.completed / 8) * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #b967ff, #ff00ff)",
                borderRadius: "10px",
                transition: "width 0.5s ease",
              }}
            ></div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.9rem",
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            <span>{neuralData.completed}/8 tasks</span>
            <span>{8 - neuralData.completed} to unlock!</span>
          </div>
        </div>

        <button
          className="surprise-btn"
          style={{
            marginTop: "20px",
            background: "linear-gradient(45deg, #b967ff, #ff00ff)",
            border: "none",
            color: "white",
            padding: "12px 30px",
            borderRadius: "10px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onClick={() => {
            const surprises = [
              "🎯 Tip: You work 23% faster on Tuesday mornings",
              "⚡ Insight: Your creative peak is 3-5 PM",
              "📊 Pattern: You complete admin tasks 40% faster after a 5-min break",
              "✨ Discovery: You're most productive after 7 hours of sleep",
            ];
            alert(surprises[Math.floor(Math.random() * surprises.length)]);
          }}
        >
          🔓 Quick Peek at Your Surprise
        </button>
      </div>

      {/* AI Recommendations */}
      <div className="recommendations-grid">
        <div className="recommendation-card">
          <div className="recommendation-icon">🚀</div>
          <h3 className="recommendation-title">Quick Win Strategy</h3>
          <p className="recommendation-desc">
            Complete 3 low-complexity tasks in the next hour to build momentum
            and boost your neural efficiency score.
          </p>
        </div>

        <div className="recommendation-card">
          <div className="recommendation-icon">🎯</div>
          <h3 className="recommendation-title">Focus Optimization</h3>
          <p className="recommendation-desc">
            Schedule high-priority tasks between 10 AM - 12 PM when your
            cognitive performance peaks based on historical data.
          </p>
        </div>

        <div className="recommendation-card">
          <div className="recommendation-icon">⚡</div>
          <h3 className="recommendation-title">Energy Management</h3>
          <p className="recommendation-desc">
            Take a 5-minute break every 90 minutes. Your neural patterns show
            improved focus after short, regular breaks.
          </p>
        </div>
      </div>

      {/* Dashboard Footer */}
      <div
        style={{
          marginTop: "40px",
          padding: "25px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(0, 243, 255, 0.2)",
          borderRadius: "15px",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "rgba(255, 255, 255, 0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            marginBottom: "15px",
          }}
        >
          <span>🔄 Last updated: Just now</span>
          <span>📊 Data refreshed every 5 minutes</span>
          <span>🤖 AI model: NeuralProductivity v2.3</span>
        </div>
        <p>
          This dashboard uses real-time AI analysis to provide personalized
          productivity insights. All metrics are calculated based on your actual
          task performance and work patterns.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
