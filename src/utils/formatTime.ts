export const formatTimeAgo = (unixTimestamp: number): string => {
  const now = Date.now();
  const past = unixTimestamp * 1000;
  const diffMs = now - past;

  if (diffMs < 0) {
    return "just now";
  }

  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;
  const MS_PER_MONTH = 30 * MS_PER_DAY;
  const MS_PER_YEAR = 365 * MS_PER_DAY;

  if (diffMs < MS_PER_MINUTE) {
    // Less than 1 minute
    return "just now";
  } else if (diffMs < MS_PER_HOUR) {
    // Less than 1 hour
    const minutes = Math.floor(diffMs / MS_PER_MINUTE);
    if (!minutes) return "";
    return `${minutes}m ago`;
  } else if (diffMs < MS_PER_DAY) {
    // Less than 1 day
    const hours = Math.floor(diffMs / MS_PER_HOUR);
    if (!hours) return "";
    return `${hours}h ago`;
  } else if (diffMs < MS_PER_MONTH) {
    // Less than ~1 month
    const days = Math.floor(diffMs / MS_PER_DAY);
    if (!days) return "";
    return `${days}d ago`;
  } else if (diffMs < MS_PER_YEAR) {
    // Less than ~1 year
    const months = Math.floor(diffMs / MS_PER_MONTH);
    if (!months) return "";
    return `${months}mo ago`;
  } else {
    // 1 year or more
    const years = Math.floor(diffMs / MS_PER_YEAR);
    if (!years) return "";
    return `${years}y ago`;
  }
};

export const formatDuration = (duration: number): string => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);  
  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  
  return `${minutes}:${formattedSeconds}`;
}