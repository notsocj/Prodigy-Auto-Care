// Shift Management System for Prodigy Auto Care
// Handles bay assignments, team shifts, and washing cycles

// Bay configuration
export const BAYS = {
  1: { id: 1, name: "Bay 1", status: "available" },
  2: { id: 2, name: "Bay 2", status: "available" },
  3: { id: 3, name: "Bay 3", status: "available" },
  4: { id: 4, name: "Bay 4", status: "available" },
  5: { id: 5, name: "Bay 5", status: "available" },
  6: { id: 6, name: "Bay 6", status: "available" }
};

// Team configuration
export const TEAMS = {
  AM: {
    name: "AM Team",
    detailers: 3,
    startTime: "6:00 AM",
    endTime: "3:00 PM",
    battlePlan: "6:00 AM",
    maintenance: { start: "6:15 AM", end: "6:30 AM", bays: [4, 5, 6] },
    breakTime: { start: "11:00 AM", end: "12:00 PM" }
  },
  PM: {
    name: "PM Team",
    detailers: 3,
    startTime: "2:00 PM",
    endTime: "11:00 PM",
    battlePlan: "2:00 PM",
    maintenance: { start: "2:15 PM", end: "2:30 PM", bays: [1, 2, 3] },
    breakTime: { start: "5:30 PM", end: "6:30 PM" }
  },
  GY: {
    name: "Graveyard Team",
    detailers: 3,
    startTime: "10:00 PM",
    endTime: "7:00 AM",
    battlePlan: "10:00 PM",
    maintenance: { start: "10:15 PM", end: "10:30 PM", bays: [4, 5, 6] },
    breakTime: { start: "1:30 AM", end: "2:30 AM" }
  }
};

// Washing cycle definitions with bay assignments
export const WASHING_CYCLES = {
  // AM TEAM CYCLES
  "W1-W3": { team: "AM", time: "6:30 AM", bays: [4, 5, 6], duration: 90, cycle: 1 },
  "W4-W6": { team: "AM", time: "8:00 AM", bays: [1, 2, 3], duration: 90, cycle: 2 },
  "W7-W9": { team: "AM", time: "9:30 AM", bays: [1, 2, 3], duration: 90, cycle: 3 },
  "W10-W12": { team: "AM", time: "12:00 PM", bays: [1, 2, 3], duration: 90, cycle: 4 },
  "W13-W15": { team: "AM", time: "1:30 PM", bays: [4, 5, 6], duration: 90, cycle: 5, type: "Bay Shift" },

  // PM TEAM CYCLES
  "W16-W18": { team: "PM", time: "2:30 PM", bays: [1, 2, 3], duration: 90, cycle: 1 },
  "W19-W21": { team: "PM", time: "4:00 PM", bays: [4, 5, 6], duration: 90, cycle: 2 },
  "W22-W24": { team: "PM", time: "6:30 PM", bays: [4, 5, 6], duration: 90, cycle: 3 },
  "W25-W27": { team: "PM", time: "8:00 PM", bays: [4, 5, 6], duration: 90, cycle: 4 },
  "W28-W30": { team: "PM", time: "9:30 PM", bays: [1, 2, 3], duration: 90, cycle: 5, type: "Bay Shift" },

  // GY TEAM CYCLES
  "W31-W33": { team: "GY", time: "10:30 PM", bays: [4, 5, 6], duration: 90, cycle: 1 },
  "W34-W36": { team: "GY", time: "12:00 AM", bays: [4, 5, 6], duration: 90, cycle: 2 },
  "W37-W39": { team: "GY", time: "2:30 AM", bays: [1, 2, 3], duration: 90, cycle: 3 },
  "W40-W42": { team: "GY", time: "4:00 AM", bays: [1, 2, 3], duration: 90, cycle: 4 },
  "W43-W45": { team: "GY", time: "5:30 AM", bays: [1, 2, 3], duration: 90, cycle: 5, type: "Bay Shift" }
};

// Get the appropriate washing cycle for a given time
export function getWashingCycleByTime(time) {
  for (const [cycleCode, details] of Object.entries(WASHING_CYCLES)) {
    if (details.time === time) {
      return { code: cycleCode, ...details };
    }
  }
  return null;
}

// Get available bay for a booking based on time slot
export function getAvailableBay(time, bookingCount = 0) {
  const cycle = getWashingCycleByTime(time);
  if (!cycle) return null;

  // Return the bay assignment based on booking order (0, 1, 2 = first, second, third detailer)
  const bayIndex = bookingCount % cycle.bays.length;
  return cycle.bays[bayIndex];
}

// Get team information for a given time
export function getTeamByTime(time) {
  const cycle = getWashingCycleByTime(time);
  if (!cycle) return null;

  return TEAMS[cycle.team];
}

// Check if a time slot is a break period
export function isBreakTime(time) {
  for (const team of Object.values(TEAMS)) {
    if (team.breakTime &&
      time >= team.breakTime.start &&
      time <= team.breakTime.end) {
      return true;
    }
  }
  return false;
}

// Check if a time slot is maintenance period
export function isMaintenanceTime(time) {
  for (const team of Object.values(TEAMS)) {
    if (team.maintenance &&
      time >= team.maintenance.start &&
      time <= team.maintenance.end) {
      return true;
    }
  }
  return false;
}

// Check if a time slot is battle plan period
export function isBattlePlanTime(time) {
  for (const team of Object.values(TEAMS)) {
    if (team.battlePlan === time) {
      return true;
    }
  }
  return false;
}

// Get all operational time slots (excludes breaks, maintenance, battle plans)
export function getOperationalTimeSlots() {
  const operationalSlots = [];

  for (const [cycleCode, details] of Object.entries(WASHING_CYCLES)) {
    operationalSlots.push({
      time: details.time,
      team: details.team,
      cycle: cycleCode,
      bays: details.bays,
      maxBookings: details.bays.length, // One booking per bay
      duration: details.duration
    });
  }

  return operationalSlots.sort((a, b) => {
    // Sort by time (basic string comparison works for this format)
    return new Date('1970/01/01 ' + convertTo24Hour(a.time)) -
      new Date('1970/01/01 ' + convertTo24Hour(b.time));
  });
}

// Helper function to convert 12-hour format to 24-hour format
function convertTo24Hour(time12) {
  const [time, ampm] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);

  if (ampm === 'PM' && hour !== 12) {
    hour += 12;
  } else if (ampm === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

// Get shift details for admin reporting
export function getShiftSummary(date) {
  return {
    date,
    teams: TEAMS,
    cycles: WASHING_CYCLES,
    totalBays: Object.keys(BAYS).length,
    totalDetailers: Object.values(TEAMS).reduce((sum, team) => sum + team.detailers, 0),
    totalCycles: Object.keys(WASHING_CYCLES).length
  };
}

// Enhanced booking data with bay assignment
export function enhanceBookingWithBayInfo(booking, currentBookingsInSlot = 0) {
  const bay = getAvailableBay(booking.time, currentBookingsInSlot);
  const cycle = getWashingCycleByTime(booking.time);
  const team = getTeamByTime(booking.time);

  return {
    ...booking,
    bay: bay ? { id: bay, name: `Bay ${bay}` } : null,
    washingCycle: cycle ? cycle.code : null,
    team: team ? team.name : null,
    cycleDetails: cycle || null
  };
}
