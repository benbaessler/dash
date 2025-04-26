export function generateCastIntentURL(text: string, embedUrl: string) {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(embedUrl)}`
}