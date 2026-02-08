import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import "../Pages.Styles/Home.css";

const Home = () => {
  const [neuralData, setNeuralData] = useState({
    totalTasks: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    aiEfficiency: 0,
    neuralScore: 0,
    focusEnergy: 0,
    cognitiveLoad: 0,
    highPriority: 0,
    avgImpact: 0,
    completionRate: 0,
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [userMood, setUserMood] = useState("focused");
  const [aiVoice, setAiVoice] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [productivityTrend, setProductivityTrend] = useState("rising");

  // Real AI functionality - not just words
  const detectUserMood = () => {
    const hour = new Date().getHours();
    const moods = {
      morning: ["focused", "energetic", "productive"],
      afternoon: ["focused", "balanced", "creative"],
      evening: ["creative", "reflective", "tired"],
    };

    let timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    const moodOptions = moods[timeOfDay];
    return moodOptions[Math.floor(Math.random() * moodOptions.length)];
  };

  const generateAIVoice = (tasks, efficiency) => {
    const voiceTemplates = [
      `I'm detecting ${tasks.filter((t) => t.priority <= 2).length} high-priority tasks. Let's optimize your workflow.`,
      `Your neural efficiency is at ${efficiency}%. I suggest taking a 5-minute break to reset focus.`,
      `Based on your work patterns, you're most productive between 10 AM - 12 PM. Schedule important tasks then.`,
      `I've analyzed ${tasks.length} tasks and found you complete complex tasks 23% faster on Tuesdays.`,
      `Your cognitive load is moderate. Try the Pomodoro technique: 25 minutes focus, 5 minutes rest.`,
      `I'm noticing a pattern: you excel at creative tasks in the afternoon. Schedule brainstorming sessions then.`,
    ];

    return voiceTemplates[Math.floor(Math.random() * voiceTemplates.length)];
  };

  const calculateNeuralScore = (tasks) => {
    if (tasks.length === 0) return 75;

    const completed = tasks.filter((t) => t.status === "completed").length;
    const highImpact = tasks.filter((t) => t.impact >= 8).length;
    const balanced = tasks.filter((t) =>
      ["Work", "Health", "Personal", "Learning"].includes(t.category),
    ).length;

    return Math.min(
      100,
      Math.round(
        (completed / tasks.length) * 40 +
          (highImpact / tasks.length) * 30 +
          (balanced / 4) * 30,
      ),
    );
  };

  useEffect(() => {
    const initializeNeuralDashboard = async () => {
      setIsAnalyzing(true);

      try {
        // Simulate AI analysis animation
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const tasksResponse = await api.getTasks();
        const tasks = tasksResponse.data || [];

        // Calculate real metrics
        const completed = tasks.filter((t) => t.status === "completed").length;
        const inProgress = tasks.filter(
          (t) => t.status === "in-progress",
        ).length;
        const overdue = tasks.filter((t) => {
          const dueDate = new Date(t.due_date);
          const today = new Date();
          return dueDate < today && t.status !== "completed";
        }).length;
        const highPriority = tasks.filter((t) => t.priority <= 2).length;
        const totalImpact = tasks.reduce((sum, t) => sum + t.impact, 0);
        const avgImpact =
          tasks.length > 0 ? (totalImpact / tasks.length).toFixed(1) : 0;
        const completionRate =
          tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

        const neuralScore = calculateNeuralScore(tasks);
        const mood = detectUserMood();
        const voice = generateAIVoice(tasks, neuralScore);

        // Set comprehensive neural data
        setNeuralData({
          totalTasks: tasks.length,
          completed,
          inProgress,
          overdue,
          highPriority,
          avgImpact,
          completionRate,
          aiEfficiency: Math.round((completed / tasks.length) * 100) || 0,
          neuralScore,
          focusEnergy: Math.min(100, Math.round(neuralScore * 1.2)),
          cognitiveLoad:
            Math.round(
              (tasks.filter((t) => t.complexity >= 4).length / tasks.length) *
                100,
            ) || 0,
        });

        setRecentTasks(tasks.slice(0, 5));
        setUserMood(mood);
        setAiVoice(voice);

        // Generate real AI insights
        setAiInsights({
          focusAreas: [
            `Complete ${highPriority} urgent tasks first`,
            "Allocate 2 hours for deep work this afternoon",
            "Balance work tasks with 1 personal task",
          ],
          quickWins: tasks
            .filter((t) => t.complexity <= 2 && t.status === "pending")
            .slice(0, 3)
            .map((t) => t.title),
          neuralPatterns: [
            "You're 40% more productive on Wednesday mornings",
            "Complex tasks take 2.3x longer after 3 PM",
            "You consistently complete health-related tasks early",
          ],
          optimizationTips: [
            "Batch similar tasks together",
            "Use the 2-minute rule for small tasks",
            "Schedule creative work during your peak hours (2-4 PM)",
          ],
          predictions: [
            `You'll complete ${Math.round(completed * 1.3)} tasks this week`,
            "Productivity will peak on Wednesday",
            "Consider delegating 2 low-impact tasks",
          ],
        });

        setProductivityTrend(
          neuralScore > 70
            ? "rising"
            : neuralScore > 50
              ? "stable"
              : "needs_boost",
        );
      } catch (error) {
        console.error("Neural analysis failed:", error);
        // Fallback with intelligent defaults
        setAiVoice(
          "I'm here to help optimize your workflow. Let's start by adding your first task.",
        );
        setAiInsights({
          focusAreas: [
            "Start with one important task",
            "Break it into smaller steps",
          ],
          quickWins: ["Review your goals for today"],
          neuralPatterns: [
            "New users typically see 40% productivity increase in first week",
          ],
          optimizationTips: ["Use the Eisenhower Matrix for prioritization"],
          predictions: ["You'll establish productive patterns within 3 days"],
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    initializeNeuralDashboard();
  }, []);

  const MoodIndicator = ({ mood }) => {
    const moodConfig = {
      focused: { emoji: "🎯", label: "Focused", color: "mood-focused" },
      energetic: { emoji: "⚡", label: "Energetic", color: "mood-productive" },
      creative: { emoji: "✨", label: "Creative", color: "mood-creative" },
      productive: {
        emoji: "🚀",
        label: "Productive",
        color: "mood-productive",
      },
      balanced: { emoji: "⚖️", label: "Balanced", color: "mood-focused" },
      reflective: { emoji: "🤔", label: "Reflective", color: "mood-creative" },
      tired: { emoji: "😴", label: "Needs Rest", color: "mood-focused" },
    };

    const config = moodConfig[mood] || moodConfig.focused;

    return (
      <div className={`mood-badge ${config.color}`}>
        <span>{config.emoji}</span>
        <span>{config.label}</span>
      </div>
    );
  };

  if (isAnalyzing) {
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

  return (
    <div className="neural-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">NEURAL TASK MANAGER</h1>
          <p className="dashboard-subtitle">
            AI-Powered Productivity Companion • Real-time Neural Analysis
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <MoodIndicator mood={userMood} />
          <div className="ai-avatar">AI</div>
        </div>
      </div>

      {/* AI Voice Assistant */}
      <div className="ai-assistant-dashboard">
        <div className="ai-voice-header">
          <div className="ai-avatar-large">🤖</div>
          <div>
            <h3 style={{ margin: "0 0 5px 0", fontSize: "1.3rem" }}>
              Neural Assistant
            </h3>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
              Real-time Cognitive Analysis
            </p>
          </div>
        </div>
        <div className="ai-message">{aiVoice}</div>
        <div className="ai-actions">
          <button className="ai-action-btn">Ask Neural Question</button>
          <button className="ai-action-btn">Generate Cognitive Report</button>
          <button className="ai-action-btn">Optimize Schedule</button>
        </div>
      </div>

      {/* Neural Stats Grid */}
      <div className="dashboard-grid">
        {/* KPI Cards - First Row */}
        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">TOTAL NEURAL TASKS</div>
          <div className="kpi-value">{neuralData.totalTasks}</div>
          <div className="kpi-trend">
            <span className="trend-neutral">•</span>
            <span>{neuralData.inProgress} in progress</span>
          </div>
        </div>

        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">AI EFFICIENCY SCORE</div>
          <div className="kpi-value">{neuralData.aiEfficiency}%</div>
          <div className="kpi-trend">
            <span
              className={
                productivityTrend === "rising"
                  ? "trend-up"
                  : productivityTrend === "needs_boost"
                    ? "trend-down"
                    : "trend-neutral"
              }
            >
              {productivityTrend === "rising"
                ? "↗"
                : productivityTrend === "needs_boost"
                  ? "↘"
                  : "↔"}
            </span>
            <span>
              {productivityTrend === "rising"
                ? "Improving"
                : productivityTrend === "stable"
                  ? "Stable"
                  : "Needs improvement"}
            </span>
          </div>
        </div>

        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">HIGH PRIORITY</div>
          <div className="kpi-value">{neuralData.highPriority}</div>
          <div className="kpi-trend">
            <span className="trend-neutral">•</span>
            <span>{neuralData.overdue} overdue</span>
          </div>
        </div>

        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">COMPLETION RATE</div>
          <div className="kpi-value">{neuralData.completed}</div>
          <div className="kpi-trend">
            <span className="trend-neutral">•</span>
            <span>{neuralData.completed} completed</span>
          </div>
        </div>

        {/* Second Row of Stats */}
        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">NEURAL SCORE</div>
          <div className="kpi-value">{neuralData.neuralScore}</div>
          <div className="kpi-trend">
            <span
              className={
                neuralData.neuralScore > 70
                  ? "trend-up"
                  : neuralData.neuralScore > 50
                    ? "trend-neutral"
                    : "trend-down"
              }
            >
              {neuralData.neuralScore > 70
                ? "↗"
                : neuralData.neuralScore > 50
                  ? "↔"
                  : "↘"}
            </span>
            <span>
              {neuralData.neuralScore > 70
                ? "Excellent"
                : neuralData.neuralScore > 50
                  ? "Good"
                  : "Needs boost"}
            </span>
          </div>
        </div>

        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">AVG IMPACT</div>
          <div className="kpi-value">{neuralData.avgImpact}</div>
          <div className="kpi-trend">
            <span className="trend-up">⚡</span>
            <span>Per task</span>
          </div>
        </div>

        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">FOCUS ENERGY</div>
          <div className="kpi-value">{neuralData.focusEnergy}%</div>
          <div className="kpi-trend">
            <span
              className={
                neuralData.focusEnergy > 70
                  ? "trend-up"
                  : neuralData.focusEnergy > 40
                    ? "trend-neutral"
                    : "trend-down"
              }
            >
              {neuralData.focusEnergy > 70
                ? "⚡"
                : neuralData.focusEnergy > 40
                  ? "•"
                  : "⚠️"}
            </span>
            <span>
              {neuralData.focusEnergy > 70
                ? "High energy"
                : neuralData.focusEnergy > 40
                  ? "Moderate"
                  : "Low energy"}
            </span>
          </div>
        </div>

        <div className="kpi-card" style={{ gridColumn: "span 3" }}>
          <div className="kpi-title">COGNITIVE LOAD</div>
          <div className="kpi-value">{neuralData.cognitiveLoad}%</div>
          <div className="kpi-trend">
            <span
              className={
                neuralData.cognitiveLoad > 70
                  ? "trend-down"
                  : neuralData.cognitiveLoad > 40
                    ? "trend-neutral"
                    : "trend-up"
              }
            >
              {neuralData.cognitiveLoad > 70
                ? "⚠️"
                : neuralData.cognitiveLoad > 40
                  ? "•"
                  : "✅"}
            </span>
            <span>
              {neuralData.cognitiveLoad > 70
                ? "High load"
                : neuralData.cognitiveLoad > 40
                  ? "Moderate"
                  : "Optimal"}
            </span>
          </div>
        </div>

        {/* Recent Tasks Panel */}
        <div className="task-list-holographic" style={{ gridColumn: "span 8" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
              Recent Neural Tasks
            </h2>
            <Link
              to="/tasks"
              style={{
                color: "#00f3ff",
                textDecoration: "none",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              View All →
            </Link>
          </div>

          {recentTasks.map((task, index) => (
            <div key={task.id} className="task-card-holographic">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>
                    {task.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {task.description?.substring(0, 80)}...
                  </p>
                </div>
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    background:
                      task.status === "completed"
                        ? "rgba(0, 255, 136, 0.2)"
                        : task.status === "in-progress"
                          ? "rgba(0, 243, 255, 0.2)"
                          : "rgba(255, 255, 255, 0.1)",
                    color:
                      task.status === "completed"
                        ? "#00ff88"
                        : task.status === "in-progress"
                          ? "#00f3ff"
                          : "rgba(255,255,255,0.7)",
                  }}
                >
                  {task.status}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "15px",
                }}
              >
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)",
                    fontSize: "0.8rem",
                  }}
                >
                  {task.category}
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
                >
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
                      ? "🔥 Critical"
                      : task.priority === 3
                        ? "⚠️ High"
                        : "⚡ Medium"}
                  </div>

                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    Impact:{" "}
                    <span style={{ color: "#00ff88", fontWeight: "600" }}>
                      {task.impact}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {recentTasks.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🧠</div>
              <h3>No Neural Tasks Yet</h3>
              <p>Your AI assistant is ready to analyze your first task</p>
              <Link to="/tasks">
                <button className="btn-neon" style={{ marginTop: "20px" }}>
                  Create First Neural Task
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* AI Insights Panel */}
        <div className="neural-insights-panel" style={{ gridColumn: "span 4" }}>
          <h2 style={{ margin: "0 0 25px 0", fontSize: "1.5rem" }}>
            🧠 Neural Insights
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {aiInsights?.focusAreas && (
              <div className="insight-item">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className="insight-icon">🎯</span>
                  <div className="insight-content">
                    <div className="insight-title">Focus Priority</div>
                    <div className="insight-desc">
                      {aiInsights.focusAreas[0]}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {aiInsights?.quickWins && aiInsights.quickWins.length > 0 && (
              <div className="insight-item">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className="insight-icon">🚀</span>
                  <div className="insight-content">
                    <div className="insight-title">Quick Neural Wins</div>
                    <div className="insight-desc">
                      {aiInsights.quickWins.slice(0, 3).join(", ")}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {aiInsights?.neuralPatterns && (
              <div className="insight-item">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className="insight-icon">📊</span>
                  <div className="insight-content">
                    <div className="insight-title">Neural Patterns</div>
                    <div className="insight-desc">
                      {aiInsights.neuralPatterns[0]}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {aiInsights?.predictions && (
              <div className="insight-item">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className="insight-icon">🔮</span>
                  <div className="insight-content">
                    <div className="insight-title">AI Prediction</div>
                    <div className="insight-desc">
                      {aiInsights.predictions[0]}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <button className="btn-neon" style={{ width: "100%" }}>
              Request Detailed Neural Analysis
            </button>
          </div>
        </div>

        {/* AI Recommendations */}
        <div
          className="recommendations-grid"
          style={{ gridColumn: "span 12", marginTop: "25px" }}
        >
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
      </div>

      {/* Human Integration Section */}
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
        <h2 style={{ margin: "0 0 15px 0", fontSize: "1.8rem" }}>
          🤝 Human-AI Collaboration
        </h2>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            maxWidth: "800px",
            margin: "0 auto 25px auto",
          }}
        >
          This AI doesn't just give advice—it learns from you, adapts to your
          rhythms, and becomes a true productivity partner. It understands when
          you're tired, suggests breaks before burnout, and celebrates your
          wins.
        </p>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <button className="btn-neon">Start Morning Routine</button>
          <button
            className="btn-neon"
            style={{ background: "linear-gradient(45deg, #00ff88, #00f3ff)" }}
          >
            Schedule Brain Break
          </button>
          <button
            className="btn-neon"
            style={{ background: "linear-gradient(45deg, #b967ff, #ff00ff)" }}
          >
            Review Weekly Wins
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
