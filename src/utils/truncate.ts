export const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 14)}...${address.slice(-12)}`;
};

export const truncateText = (text: string, maxLength: number) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};
