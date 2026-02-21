const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  return matches.filter((m) => {
    try {
      new URL(m);
      return true;
    } catch {
      return false;
    }
  });
}
