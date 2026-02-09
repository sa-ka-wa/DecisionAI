// services/lifePatterns.js
export const detectLifePatterns = async (calendarData) => {
  const patterns = {
    workSchedule: detectWorkSchedule(calendarData),
    meetingPatterns: detectMeetingPatterns(calendarData),
    breakPatterns: detectBreakPatterns(calendarData),
    focusPeriods: detectFocusPeriods(calendarData),
    energyPatterns: detectEnergyPatterns(calendarData),
    weekendPatterns: detectWeekendPatterns(calendarData),
  };

  return patterns;
};

const detectWorkSchedule = (events) => {
  const workHours = { start: 9, end: 17 };
  const workEvents = events.filter(
    (e) =>
      e.summary?.toLowerCase().includes("work") ||
      e.description?.toLowerCase().includes("work"),
  );

  if (workEvents.length > 0) {
    const startHours = workEvents.map((e) => new Date(e.start).getHours());
    const endHours = workEvents.map((e) => new Date(e.end).getHours());

    workHours.start = Math.min(...startHours);
    workHours.end = Math.max(...endHours);
  }

  return workHours;
};

const detectMeetingPatterns = (events) => {
  const meetings = events.filter(
    (e) =>
      e.summary?.toLowerCase().includes("meeting") ||
      e.summary?.toLowerCase().includes("call") ||
      e.summary?.toLowerCase().includes("sync"),
  );

  const patterns = {
    frequentHours: {},
    averageDuration: 0,
    preferredDays: {},
  };

  meetings.forEach((meeting) => {
    const hour = new Date(meeting.start).getHours();
    const day = new Date(meeting.start).getDay();
    const duration =
      (new Date(meeting.end) - new Date(meeting.start)) / (1000 * 60 * 60);

    patterns.frequentHours[hour] = (patterns.frequentHours[hour] || 0) + 1;
    patterns.preferredDays[day] = (patterns.preferredDays[day] || 0) + 1;
    patterns.averageDuration += duration;
  });

  patterns.averageDuration =
    meetings.length > 0 ? patterns.averageDuration / meetings.length : 0;

  return patterns;
};

const detectEnergyPatterns = (events) => {
  const energyMap = {};

  events.forEach((event) => {
    const hour = new Date(event.start).getHours();
    const energy = classifyEventEnergy(event);

    if (!energyMap[hour]) {
      energyMap[hour] = { high: 0, medium: 0, low: 0 };
    }

    energyMap[hour][energy]++;
  });

  return energyMap;
};

const classifyEventEnergy = (event) => {
  const title = event.summary?.toLowerCase() || "";
  const desc = event.description?.toLowerCase() || "";

  // High energy events
  if (
    title.includes("brainstorm") ||
    title.includes("creative") ||
    title.includes("planning") ||
    title.includes("strategy")
  ) {
    return "high";
  }

  // Medium energy events
  if (
    title.includes("meeting") ||
    title.includes("review") ||
    title.includes("sync")
  ) {
    return "medium";
  }

  // Low energy events
  if (
    title.includes("admin") ||
    title.includes("email") ||
    title.includes("routine")
  ) {
    return "low";
  }

  return "medium";
};
