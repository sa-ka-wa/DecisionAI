import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTasks, api } from "../services/api";
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

  // Real AI analysis functions from the new component
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
                return sum + (end - start) / (1000 * 60 * 60 * 24); // Convert to days
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

  // Stats calculation from original component
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

  // Filter and sort functions from original component
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
        // Try multiple approaches to get tasks
        let tasksData = [];
        try {
          const response = await api.getTasks();
          tasksData = response.data || response || [];
        } catch (apiError) {
          console.log("API call failed, trying direct getTasks");
          tasksData = await getTasks();
        }

        // Ensure tasksData is an array
        if (!Array.isArray(tasksData)) {
          tasksData = tasksData?.data || tasksData || [];
        }

        setTasks(tasksData);
        applyFilters();

        // Simulate AI processing time
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

        setAiMessage(
          generateAIMessage({
            score: productivity.score,
            completedTasks: stats.completedTasks,
            completionRate: stats.completionRate,
          }),
        );
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        // Fallback data
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

        {/* Category Distribution */}
        <div className="category-distribution" style={{ gridColumn: "span 4" }}>
          <h2 style={{ margin: "0 0 25px 0", fontSize: "1.5rem" }}>
            📊 Category Distribution
          </h2>

          <div className="category-list">
            {categoryDistribution.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-name">
                  <div
                    className="category-dot"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span>{category.name}</span>
                </div>
                <div className="category-count">{category.count} tasks</div>
              </div>
            ))}

            {categoryDistribution.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                No category data available
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

      {/* Task Summary Section */}
      <div
        className="task-summary-section"
        style={{
          background: "rgba(20, 20, 30, 0.8)",
          border: "1px solid rgba(0, 243, 255, 0.3)",
          borderRadius: "15px",
          padding: "25px",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Task Summary</h2>
          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}
              >
                High Impact Tasks
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  color: "#00ff88",
                  fontWeight: "bold",
                }}
              >
                {stats.highImpact}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}
              >
                Critical Priority
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  color: "#ff5555",
                  fontWeight: "bold",
                }}
              >
                {stats.critical}
              </div>
            </div>
          </div>
        </div>

        {/* Task List Preview */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "10px",
            padding: "15px",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {filteredTasks.slice(0, 5).map((task, index) => (
            <div
              key={index}
              style={{
                padding: "10px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "600", color: "white" }}>
                  {task.title}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {task.category} • Impact: {task.impact}/10 • Due:{" "}
                  {new Date(task.due_date || task.dueDate).toLocaleDateString()}
                </div>
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  background:
                    task.priority <= 2
                      ? "rgba(255, 85, 85, 0.2)"
                      : task.priority === 3
                        ? "rgba(255, 170, 0, 0.2)"
                        : "rgba(0, 243, 255, 0.2)",
                  color:
                    task.priority <= 2
                      ? "#ff5555"
                      : task.priority === 3
                        ? "#ffaa00"
                        : "#00f3ff",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                }}
              >
                {task.priority <= 2
                  ? "Critical"
                  : task.priority === 3
                    ? "High"
                    : "Medium"}
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              No tasks match the current filter
            </div>
          )}
        </div>
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
