export function isPastPlannedCheckIn(now: Date, scheduledEndMinutes: number, graceMinutes = 20) {
  return now.getHours() * 60 + now.getMinutes() >= scheduledEndMinutes + graceMinutes;
}
