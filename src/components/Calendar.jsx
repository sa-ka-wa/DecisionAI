import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import "../Pages.Styles/Calendar.css";

const CalendarIntegration = () => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [integrations, setIntegrations] = useState({
    google: false,
    outlook: false,
    apple: false,
  });
  const [aiSchedule, setAiSchedule] = useState([]);
  const [userRhythms, setUserRhythms] = useState({
    peakHours: [10, 12],
    lowEnergyHours: [14, 16],
    creativeHours: [20, 22],
    focusDays: ["Monday", "Wednesday", "Friday"],
  });
  const [scheduleConflicts, setScheduleConflicts] = useState([]);
  const [lifePatterns, setLifePatterns] = useState({});

  // Detect user's natural rhythms from calendar data
  const detectLifePatterns = (events) => {
    const patterns = {
      workHours: { start: 9, end: 17 },
      meetingFrequency: {},
      breakPatterns: [],
      focusSessions: [],
      creativeSpurts: [],
      lowEnergyPeriods: [],
    };

    events.forEach((event) => {
      const hour = new Date(event.start).getHours();

      // Detect work patterns
      if (
        event.type === "work" ||
        event.title?.toLowerCase().includes("meeting")
      ) {
        patterns.meetingFrequency[hour] =
          (patterns.meetingFrequency[hour] || 0) + 1;
      }

      // Detect focus sessions (1+ hour blocks with no meetings)
      if (
        event.duration > 60 &&
        !event.title?.toLowerCase().includes("meeting")
      ) {
        patterns.focusSessions.push({
          hour,
          duration: event.duration,
          day: new Date(event.start).getDay(),
        });
      }
    });

    // Calculate optimal schedule based on patterns
    const optimalSchedule = calculateOptimalSchedule(patterns);
    return { patterns, optimalSchedule };
  };

  // Generate AI-optimized schedule
  const calculateOptimalSchedule = (patterns) => {
    const schedule = [];

    // Schedule high-priority tasks during peak hours
    schedule.push({
      time: "10:00-12:00",
      type: "deep-work",
      recommendation: "Schedule complex tasks here",
      energy: "peak",
    });

    // Schedule meetings during moderate energy periods
    schedule.push({
      time: "14:00-16:00",
      type: "meetings",
      recommendation: "Group meetings in afternoon",
      energy: "moderate",
    });

    // Schedule creative work during creative hours
    schedule.push({
      time: "20:00-22:00",
      type: "creative-work",
      recommendation: "Brainstorming & planning",
      energy: "creative",
    });

    return schedule;
  };

  // Sync with external calendars
  const syncWithCalendar = async (provider) => {
    try {
      const response = await api.syncCalendar(provider);
      if (response.success) {
        setCalendarEvents(response.data.events);

        // Detect patterns from new events
        const patterns = detectLifePatterns(response.data.events);
        setLifePatterns(patterns);

        // Update integrations status
        setIntegrations((prev) => ({
          ...prev,
          [provider]: true,
        }));

        // Generate AI schedule based on patterns
        const aiSchedule = generateAISchedule(patterns, response.data.events);
        setAiSchedule(aiSchedule);
      }
    } catch (error) {
      console.error(`Failed to sync with ${provider}:`, error);
    }
  };

  // Generate AI-powered schedule recommendations
  const generateAISchedule = (patterns, events) => {
    const recommendations = [];

    // Find schedule conflicts
    const conflicts = findScheduleConflicts(events);
    setScheduleConflicts(conflicts);

    // Recommend breaks based on meeting density
    const meetingDensity = calculateMeetingDensity(events);
    if (meetingDensity > 0.7) {
      recommendations.push({
        type: "break-needed",
        message:
          "High meeting density detected. Schedule 15-min breaks between meetings.",
        priority: "high",
      });
    }

    // Recommend focus time based on patterns
    const bestFocusTime = findBestFocusTime(patterns);
    if (bestFocusTime) {
      recommendations.push({
        type: "focus-time",
        message: `Your most productive focus time is ${bestFocusTime.start}:00-${bestFocusTime.end}:00`,
        priority: "medium",
      });
    }

    // Suggest task distribution based on energy patterns
    const energyPatterns = analyzeEnergyPatterns(events);
    recommendations.push({
      type: "energy-optimization",
      message: `Schedule analytical tasks in morning (${energyPatterns.analytical.start}-${energyPatterns.analytical.end}), creative in evening (${energyPatterns.creative.start}-${energyPatterns.creative.end})`,
      priority: "medium",
    });

    return recommendations;
  };

  // Find schedule conflicts
  const findScheduleConflicts = (events) => {
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

  // Analyze energy patterns from calendar
  const analyzeEnergyPatterns = (events) => {
    const patterns = {
      analytical: { start: 9, end: 12, count: 0 },
      meetings: { start: 13, end: 16, count: 0 },
      creative: { start: 19, end: 22, count: 0 },
    };

    events.forEach((event) => {
      const hour = new Date(event.start).getHours();
      const type = classifyEventType(event);

      if (type === "analytical" && hour >= 9 && hour <= 12) {
        patterns.analytical.count++;
      } else if (type === "meeting" && hour >= 13 && hour <= 16) {
        patterns.meetings.count++;
      } else if (type === "creative" && hour >= 19 && hour <= 22) {
        patterns.creative.count++;
      }
    });

    return patterns;
  };

  // Classify event type based on content
  const classifyEventType = (event) => {
    const title = event.title.toLowerCase();
    const desc = event.description?.toLowerCase() || "";

    if (
      title.includes("meeting") ||
      title.includes("call") ||
      title.includes("sync")
    ) {
      return "meeting";
    } else if (
      title.includes("analysis") ||
      title.includes("report") ||
      title.includes("data")
    ) {
      return "analytical";
    } else if (
      title.includes("brainstorm") ||
      title.includes("design") ||
      title.includes("creative")
    ) {
      return "creative";
    } else if (
      title.includes("break") ||
      title.includes("lunch") ||
      title.includes("coffee")
    ) {
      return "break";
    }

    return "other";
  };

  // Integrate tasks with calendar
  const integrateTasksWithCalendar = async (tasks) => {
    const calendarEvents = tasks.map((task) => ({
      title: task.title,
      description: task.description,
      start: new Date(task.due_date),
      end: new Date(
        new Date(task.due_date).getTime() +
          task.estimated_hours * 60 * 60 * 1000,
      ),
      category: task.category,
      priority: task.priority,
      type: "task",
      taskId: task.id,
    }));

    try {
      const response = await api.addToCalendar(calendarEvents);
      return response.success;
    } catch (error) {
      console.error("Failed to integrate tasks with calendar:", error);
      return false;
    }
  };

  return (
    <div className="calendar-integration">
      <div className="calendar-header">
        <h1>🧠 Neural Calendar Integration</h1>
        <p>
          AI-powered schedule optimization that adapts to your life patterns
        </p>
      </div>

      <div className="integration-grid">
        {/* Calendar Providers */}
        <div className="integration-card">
          <h3>Connect Your Calendars</h3>
          <div className="calendar-providers">
            <button
              className={`provider-btn ${integrations.google ? "connected" : ""}`}
              onClick={() => syncWithCalendar("google")}
            >
              <span>📅</span>
              Google Calendar
              {integrations.google && (
                <span className="status-connected">✓ Connected</span>
              )}
            </button>

            <button
              className={`provider-btn ${integrations.outlook ? "connected" : ""}`}
              onClick={() => syncWithCalendar("outlook")}
            >
              <span>📧</span>
              Outlook Calendar
              {integrations.outlook && (
                <span className="status-connected">✓ Connected</span>
              )}
            </button>

            <button
              className={`provider-btn ${integrations.apple ? "connected" : ""}`}
              onClick={() => syncWithCalendar("apple")}
            >
              <span>🍎</span>
              Apple Calendar
              {integrations.apple && (
                <span className="status-connected">✓ Connected</span>
              )}
            </button>
          </div>
        </div>

        {/* Life Pattern Detection */}
        <div className="pattern-card">
          <h3>🎯 Your Life Patterns</h3>
          {lifePatterns.patterns ? (
            <div className="patterns-grid">
              <div className="pattern-item">
                <div className="pattern-label">Peak Focus Hours</div>
                <div className="pattern-value">
                  {userRhythms.peakHours[0]}:00-{userRhythms.peakHours[1]}:00
                </div>
              </div>
              <div className="pattern-item">
                <div className="pattern-label">Creative Hours</div>
                <div className="pattern-value">
                  {userRhythms.creativeHours[0]}:00-
                  {userRhythms.creativeHours[1]}:00
                </div>
              </div>
              <div className="pattern-item">
                <div className="pattern-label">Best Meeting Days</div>
                <div className="pattern-value">
                  {userRhythms.focusDays.join(", ")}
                </div>
              </div>
            </div>
          ) : (
            <p className="no-data">Connect calendars to detect your patterns</p>
          )}
        </div>

        {/* AI Schedule Recommendations */}
        <div className="schedule-card">
          <h3>🤖 AI Schedule Optimizer</h3>
          <div className="schedule-list">
            {aiSchedule.map((item, index) => (
              <div key={index} className="schedule-item">
                <div className="schedule-time">{item.time}</div>
                <div className="schedule-type">{item.type}</div>
                <div className="schedule-recommendation">
                  {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Conflicts */}
        <div className="conflicts-card">
          <h3>⚠️ Schedule Conflicts</h3>
          {scheduleConflicts.length > 0 ? (
            <div className="conflicts-list">
              {scheduleConflicts.map((conflict, index) => (
                <div key={index} className="conflict-item">
                  <div className="conflict-events">
                    {conflict.event1} & {conflict.event2}
                  </div>
                  <div className="conflict-overlap">
                    Overlap: {conflict.overlap} minutes
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-conflicts">No conflicts detected</p>
          )}
        </div>
      </div>

      {/* Task Integration */}
      <div className="task-integration-section">
        <h3>📝 Integrate Tasks with Calendar</h3>
        <button
          className="integrate-btn"
          onClick={() => integrateTasksWithCalendar(tasks)}
        >
          Sync All Tasks to Calendar
        </button>
      </div>
    </div>
  );
};

export default CalendarIntegration;
