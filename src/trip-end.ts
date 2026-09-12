export function shouldPromptToEndTrip({ now, returnDate, allTodayItemsComplete }: { now: Date; returnDate?: string; allTodayItemsComplete: boolean }) {
  if (allTodayItemsComplete) return true;
  if (!returnDate) return false;
  const returned = new Date(`${returnDate}T00:00:00`);
  if (Number.isNaN(returned.getTime())) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return returned < today;
}
