export function isBandcampURL(query: string) {
  try {
    const parsedURL = new URL(query.trim());

    if (parsedURL.hostname.endsWith("bandcamp.com")) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
