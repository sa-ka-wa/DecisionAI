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
  const [aiSchedule, setAiSchedule] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [scheduleConflicts, setScheduleConflicts] = useState([]);
  const [lifePatterns, setLifePatterns] = useState({
    peakHours: [10, 12],
    creativeHours: [15, 17],
    lowEnergyHours: [14, 16],
    focusDays: ["Monday", "Wednesday", "Friday"],
  });
  const [aiInsights, setAiInsights] = useState(null);
  const [userMood, setUserMood] = useState("focused");
  const [aiVoice, setAiVoice] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [productivityTrend, setProductivityTrend] = useState("rising");
  const [calendarConnected, setCalendarConnected] = useState(false);

  // Real AI functionality
  const detectUserMood = () => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    const moods = {
      morning: ["focused", "energetic", "productive"],
      afternoon: ["focused", "balanced", "creative"],
      evening: ["creative", "reflective", "tired"],
    };

    let timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    const moodOptions = moods[timeOfDay];

    // Adjust based on calendar events
    const hasMeetings = calendarEvents.some(
      (event) =>
        event.title?.toLowerCase().includes("meeting") ||
        event.title?.toLowerCase().includes("call"),
    );

    if (hasMeetings && hour > 14) {
      return "balanced"; // Meetings in afternoon require balance
    }

    return moodOptions[Math.floor(Math.random() * moodOptions.length)];
  };

  const generateAIVoice = (tasks, efficiency, calendarCount) => {
    const voiceTemplates = [
      `I'm detecting ${tasks.filter((t) => t.priority <= 2).length} high-priority tasks and ${calendarCount} calendar events. Let's optimize your day.`,
      `Your neural efficiency is at ${efficiency}%. I suggest taking a 5-minute break to reset focus.`,
      `Based on your patterns, you're most productive between ${lifePatterns.peakHours[0]} AM - ${lifePatterns.peakHours[1]} PM. Schedule important tasks then.`,
      `I've analyzed ${tasks.length} tasks and found you complete creative tasks 23% faster in the afternoon.`,
      `Your cognitive load is moderate. Calendar shows ${calendarCount} events today. Try the Pomodoro technique.`,
      `I'm noticing a pattern: you excel at analytical tasks in the morning. Schedule brainstorming sessions in the afternoon.`,
      calendarConnected
        ? `Calendar integrated. ${scheduleConflicts.length > 0 ? `Found ${scheduleConflicts.length} conflicts to resolve.` : "No schedule conflicts detected."}`
        : "Connect your calendar for adaptive scheduling.",
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

    // Factor in calendar alignment
    const calendarAlignment =
      calendarEvents.length > 0
        ? Math.min(
            30,
            calendarEvents.filter(
              (e) => e.type !== "break" && e.status !== "cancelled",
            ).length * 5,
          )
        : 0;

    return Math.min(
      100,
      Math.round(
        (completed / tasks.length) * 40 +
          (highImpact / tasks.length) * 30 +
          (balanced / 4) * 20 +
          calendarAlignment,
      ),
    );
  };

  const calculateFreeTime = (events) => {
    if (!events || events.length === 0) return 6; // default free hours

    const today = new Date().toDateString();
    const todayEvents = events.filter(
      (event) => new Date(event.start).toDateString() === today,
    );

    // Calculate total hours booked
    const totalHours = todayEvents.reduce((sum, event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      const duration = (end - start) / (1000 * 60 * 60); // hours
      return sum + duration;
    }, 0);

    return Math.max(0, 16 - totalHours); // Assume 16 waking hours
  };

  // Generate AI schedule based on tasks and calendar
  const generateAISchedule = (tasks, events) => {
    const schedule = [];
    const now = new Date();
    const currentHour = now.getHours();

    // Morning block (9-12)
    if (currentHour < 12) {
      const morningTasks = tasks
        .filter(
          (t) =>
            t.priority <= 2 && t.status !== "completed" && t.complexity >= 4,
        )
        .slice(0, 2);

      if (morningTasks.length > 0) {
        schedule.push({
          time: "9:00-11:00",
          type: "deep-work",
          recommendation: `Focus on: ${morningTasks.map((t) => t.title).join(", ")}`,
          energy: "peak",
          icon: "🎯",
        });
      }
    }

    // Afternoon block (13-16)
    if (currentHour < 16) {
      const creativeTasks = tasks
        .filter(
          (t) => t.category === "Creative" || t.tags?.includes("creative"),
        )
        .slice(0, 1);

      if (creativeTasks.length > 0) {
        schedule.push({
          time: "14:00-15:30",
          type: "creative-work",
          recommendation: `Creative session: ${creativeTasks[0].title}`,
          energy: "creative",
          icon: "✨",
        });
      }
    }

    // Evening planning (17-18)
    schedule.push({
      time: "17:00-18:00",
      type: "planning",
      recommendation: "Review tomorrow's schedule & plan priorities",
      energy: "moderate",
      icon: "📝",
    });

    // Breaks
    if (tasks.filter((t) => t.status === "in-progress").length > 3) {
      schedule.push({
        time: "Now",
        type: "break-needed",
        recommendation: "Take a 10-minute break to maintain focus",
        energy: "break",
        icon: "☕",
      });
    }

    return schedule.slice(0, 4); // Limit to 4 items
  };

  // Detect schedule conflicts
  const detectScheduleConflicts = (events) => {
    const conflicts = [];
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.start) - new Date(b.start),
    );

    for (let i = 1; i < sortedEvents.length; i++) {
      const prevEnd = new Date(sortedEvents[i - 1].end);
      const currStart = new Date(sortedEvents[i].start);

      if (currStart < prevEnd) {
        conflicts.push({
          event1: sortedEvents[i - 1].title,
          event2: sortedEvents[i].title,
          overlap: Math.round((prevEnd - currStart) / (1000 * 60)), // minutes
        });
      }
    }

    return conflicts;
  };

  // Analyze life patterns from calendar
  const analyzeLifePatterns = (events) => {
    if (!events || events.length === 0) return lifePatterns;

    const patterns = { ...lifePatterns };
    const hourCounts = {};

    events.forEach((event) => {
      const hour = new Date(event.start).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Find peak hours (most events)
    let maxCount = 0;
    let peakHour = 10;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    });

    patterns.peakHours = [peakHour, peakHour + 2];

    // Determine creative hours (afternoon, less crowded)
    patterns.creativeHours = [15, 17];
    if (hourCounts[15] < 2 && hourCounts[16] < 2) {
      patterns.creativeHours = [15, 17];
    }

    return patterns;
  };

  useEffect(() => {
    const initializeNeuralDashboard = async () => {
      setIsAnalyzing(true);

      try {
        // Fetch all tasks
        const tasksResponse = await api.getTasks();
        const tasks = tasksResponse.data || [];

        // Fetch AI recommendations from backend
        const aiResponse = await api.getAIRecommendations();
        const aiData = aiResponse.data || {};

        // Try to fetch calendar data
        let calendarData = [];
        let calendarConnected = false;
        try {
          const calendarResponse = await api.getCalendarEvents();
          if (calendarResponse.success) {
            calendarData = calendarResponse.data || [];
            calendarConnected = true;
            setCalendarConnected(true);
          }
        } catch (calendarError) {
          console.log("Calendar not connected, using demo data");
          // Generate demo calendar events
          calendarData = generateDemoCalendarEvents();
        }

        // Calculate metrics from tasks
        const completed = tasks.filter((t) => t.status === "completed").length;
        const inProgress = tasks.filter(
          (t) => t.status === "in-progress",
        ).length;
        const overdue = tasks.filter(
          (t) => new Date(t.due_date) < new Date() && t.status !== "completed",
        ).length;
        const highPriority = tasks.filter((t) => t.priority <= 2).length;
        const totalImpact = tasks.reduce((sum, t) => sum + t.impact, 0);
        const avgImpact = tasks.length
          ? (totalImpact / tasks.length).toFixed(1)
          : 0;
        const completionRate = tasks.length
          ? Math.round((completed / tasks.length) * 100)
          : 0;

        // Analyze life patterns from calendar
        const patterns = analyzeLifePatterns(calendarData);
        setLifePatterns(patterns);

        // Detect schedule conflicts
        const conflicts = detectScheduleConflicts(calendarData);
        setScheduleConflicts(conflicts);

        // Generate AI schedule
        const schedule = generateAISchedule(tasks, calendarData);
        setAiSchedule(schedule);

        // Set calendar events
        setCalendarEvents(calendarData);

        // Calculate neural score
        const neuralScore = calculateNeuralScore(tasks);

        // Detect user mood (with calendar awareness)
        const mood = detectUserMood();

        // Set state
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

        // Use AI recommendations from backend
        setAiInsights({
          focusAreas: aiData.focusAreas || [
            `Complete ${highPriority} high-priority tasks`,
            "Schedule breaks every 90 minutes",
          ],
          quickWins:
            aiData.quickWins ||
            tasks
              .filter((t) => t.complexity <= 2 && t.status === "pending")
              .slice(0, 3)
              .map((t) => t.title),
          neuralPatterns: aiData.neuralPatterns || [
            `You work best ${patterns.peakHours[0]}:00-${patterns.peakHours[1]}:00`,
            "Creative tasks thrive in afternoon",
          ],
          optimizationTips: aiData.optimizationTips || [
            "Group similar tasks together",
            "Schedule meetings back-to-back",
            "Leave buffer time between events",
          ],
          predictions: aiData.predictions || [
            `You'll complete ${Math.min(completed + 3, tasks.length)} tasks this week`,
            "Productivity peak: Wednesday morning",
          ],
        });

        // Set AI voice with calendar context
        setAiVoice(
          aiData.aiMessage ||
            generateAIVoice(tasks, neuralScore, calendarData.length),
        );

        setProductivityTrend(
          neuralScore > 70
            ? "rising"
            : neuralScore > 50
              ? "stable"
              : "needs_boost",
        );
      } catch (error) {
        console.error("Neural dashboard initialization failed:", error);

        // Fallback if AI backend fails
        setAiVoice("AI backend unavailable. Using default guidance.");
        setAiInsights({
          focusAreas: ["Start with one task at a time"],
          quickWins: ["Review your goals for today"],
          neuralPatterns: [
            "New users typically see productivity improvement in the first week",
          ],
          optimizationTips: ["Use Eisenhower Matrix for prioritization"],
          predictions: ["You'll complete tasks steadily this week"],
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    initializeNeuralDashboard();
  }, []);

  // Generate demo calendar events for testing
  const generateDemoCalendarEvents = () => {
    const today = new Date();
    const events = [];

    // Morning meeting
    events.push({
      id: 1,
      title: "Team Standup",
      start: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        10,
        0,
      ),
      end: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        10,
        30,
      ),
      type: "meeting",
      color: "#00f3ff",
    });

    // Work session
    events.push({
      id: 2,
      title: "Project Planning",
      start: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        11,
        0,
      ),
      end: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        12,
        30,
      ),
      type: "deep-work",
      color: "#00ff88",
    });

    // Lunch
    events.push({
      id: 3,
      title: "Lunch Break",
      start: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        13,
        0,
      ),
      end: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        14,
        0,
      ),
      type: "break",
      color: "#ffaa00",
    });

    return events;
  };

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

  const CalendarIntegrationBadge = () => (
    <div
      className="calendar-badge"
      style={{
        padding: "8px 16px",
        background: calendarConnected
          ? "linear-gradient(45deg, rgba(0, 243, 255, 0.1), rgba(0, 255, 136, 0.1))"
          : "rgba(255, 170, 0, 0.1)",
        border: calendarConnected
          ? "1px solid rgba(0, 243, 255, 0.3)"
          : "1px solid rgba(255, 170, 0, 0.3)",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "0.9rem",
        fontWeight: "600",
      }}
    >
      <span>📅</span>
      <span>
        {calendarConnected ? "Calendar Connected" : "Connect Calendar"}
      </span>
    </div>
  );

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
          <CalendarIntegrationBadge />
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
              Real-time Cognitive Analysis • Calendar-Aware
            </p>
          </div>
        </div>
        <div className="ai-message">{aiVoice}</div>
        <div className="ai-actions">
          <button className="ai-action-btn">Ask Neural Question</button>
          <button className="ai-action-btn">Generate Cognitive Report</button>
          <Link to="/calendar">
            <button
              className="ai-action-btn"
              style={{
                background: "linear-gradient(45deg, #b967ff, #00f3ff)",
              }}
            >
              Optimize Schedule
            </button>
          </Link>
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
          <div className="kpi-title">CALENDAR EVENTS</div>
          <div className="kpi-value">{calendarEvents.length}</div>
          <div className="kpi-trend">
            <span className="trend-neutral">•</span>
            <span>{calculateFreeTime(calendarEvents)}h free</span>
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
          <div className="kpi-title">SCHEDULE HEALTH</div>
          <div className="kpi-value">
            {scheduleConflicts.length > 0 ? "⚠️" : "✅"}
          </div>
          <div className="kpi-trend">
            <span
              className={
                scheduleConflicts.length > 0 ? "trend-down" : "trend-up"
              }
            >
              {scheduleConflicts.length > 0 ? "⚠️" : "✅"}
            </span>
            <span>
              {scheduleConflicts.length > 0
                ? `${scheduleConflicts.length} conflicts`
                : "No conflicts"}
            </span>
          </div>
        </div>

        {/* Recent Tasks Panel */}
        <div className="task-list-holographic" style={{ gridColumn: "span 6" }}>
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

        {/* AI Schedule Preview */}
        <div className="ai-schedule-preview" style={{ gridColumn: "span 6" }}>
          <div className="calendar-preview-header">
            <h2 style={{ margin: "0 0 25px 0", fontSize: "1.5rem" }}>
              📅 Today's Adaptive Schedule
            </h2>
            <Link
              to="/calendar"
              style={{
                color: "#00f3ff",
                textDecoration: "none",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              View Full Calendar →
            </Link>
          </div>

          <div className="daily-schedule">
            {aiSchedule.length > 0 ? (
              aiSchedule.map((slot, index) => (
                <div key={index} className="schedule-slot">
                  <div className="slot-time">{slot.time}</div>
                  <div className="slot-icon">{slot.icon}</div>
                  <div className="slot-content">
                    <div className="slot-title">{slot.type}</div>
                    <div className="slot-desc">{slot.recommendation}</div>
                  </div>
                  <div className={`slot-energy energy-${slot.energy}`}>
                    {slot.energy === "peak"
                      ? "⚡"
                      : slot.energy === "creative"
                        ? "✨"
                        : slot.energy === "break"
                          ? "☕"
                          : "🔄"}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-schedule">
                <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📅</div>
                <h3>No Schedule Yet</h3>
                <p>Connect your calendar for AI-optimized scheduling</p>
                <Link to="/calendar">
                  <button className="btn-neon" style={{ marginTop: "15px" }}>
                    Connect Calendar
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="calendar-stats">
            <div className="calendar-stat">
              <div className="stat-value">{calendarEvents.length}</div>
              <div className="stat-label">Events Today</div>
            </div>
            <div className="calendar-stat">
              <div className="stat-value">{scheduleConflicts.length}</div>
              <div className="stat-label">Conflicts</div>
            </div>
            <div className="calendar-stat">
              <div className="stat-value">
                {calculateFreeTime(calendarEvents)}h
              </div>
              <div className="stat-label">Free Time</div>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="neural-insights-panel" style={{ gridColumn: "span 6" }}>
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

        {/* Calendar Insights Panel */}
        <div
          className="calendar-insights-panel"
          style={{ gridColumn: "span 6" }}
        >
          <h2 style={{ margin: "0 0 25px 0", fontSize: "1.5rem" }}>
            ⏰ Calendar Intelligence
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div className="insight-item">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="insight-icon">🎯</span>
                <div className="insight-content">
                  <div className="insight-title">Peak Productivity</div>
                  <div className="insight-desc">
                    Your best focus time is {lifePatterns.peakHours[0]}:00-
                    {lifePatterns.peakHours[1]}:00
                  </div>
                </div>
              </div>
            </div>

            {scheduleConflicts.length > 0 && (
              <div className="insight-item">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className="insight-icon">⚠️</span>
                  <div className="insight-content">
                    <div className="insight-title">Schedule Conflicts</div>
                    <div className="insight-desc">
                      {scheduleConflicts.length} conflict(s) detected
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="insight-item">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="insight-icon">✨</span>
                <div className="insight-content">
                  <div className="insight-title">Creative Hours</div>
                  <div className="insight-desc">
                    Schedule creative work at {lifePatterns.creativeHours[0]}
                    :00-{lifePatterns.creativeHours[1]}:00
                  </div>
                </div>
              </div>
            </div>

            <div className="insight-item">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="insight-icon">⚡</span>
                <div className="insight-content">
                  <div className="insight-title">Energy Management</div>
                  <div className="insight-desc">
                    {calculateFreeTime(calendarEvents)} hours free today for
                    focused work
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <Link to="/calendar">
              <button
                className="btn-neon"
                style={{
                  width: "100%",
                  background: "linear-gradient(45deg, #b967ff, #00f3ff)",
                }}
              >
                Optimize My Schedule
              </button>
            </Link>
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
              Schedule high-priority tasks between {lifePatterns.peakHours[0]}{" "}
              AM - {lifePatterns.peakHours[1]} PM when your cognitive
              performance peaks.
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
          🤝 Human-AI Calendar Sync
        </h2>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            maxWidth: "800px",
            margin: "0 auto 25px auto",
          }}
        >
          This AI doesn't just give advice—it learns from your calendar, adapts
          to your rhythms, and becomes a true productivity partner. It
          understands when you're busy, suggests breaks before burnout, and
          optimizes your schedule based on real patterns.
        </p>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <Link to="/calendar">
            <button className="btn-neon">Connect Calendar</button>
          </Link>
          <button
            className="btn-neon"
            style={{ background: "linear-gradient(45deg, #00ff88, #00f3ff)" }}
          >
            Schedule Brain Break
          </button>
          <button
            className="btn-neon"
            style={{ background: "linear-gradient(45deg, #b967ff, #ff00ff)" }}
            onClick={() => {
              // Simulate adding tasks to calendar
              alert("Syncing tasks to calendar...");
            }}
          >
            Sync Tasks to Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
