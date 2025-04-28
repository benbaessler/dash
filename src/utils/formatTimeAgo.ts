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
    return `${minutes}m ago`;
  } else if (diffMs < MS_PER_DAY) {
    // Less than 1 day
    const hours = Math.floor(diffMs / MS_PER_HOUR);
    return `${hours}h ago`;
  } else if (diffMs < MS_PER_MONTH) {
    // Less than ~1 month
    const days = Math.floor(diffMs / MS_PER_DAY);
    return `${days}d ago`;
  } else if (diffMs < MS_PER_YEAR) {
    // Less than ~1 year
    const months = Math.floor(diffMs / MS_PER_MONTH);
    return `${months}mo ago`;
  } else {
    // 1 year or more
    const years = Math.floor(diffMs / MS_PER_YEAR);
    return `${years}y ago`;
  }
};
