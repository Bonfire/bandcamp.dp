const bandcampRegex = /https:\/\/.*\.bandcamp\.com\//;

export function isBandcampURL(query: string) {
  try {
    const parsedURL = new URL(query.trim());

    if (bandcampRegex.test(parsedURL.toString())) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
