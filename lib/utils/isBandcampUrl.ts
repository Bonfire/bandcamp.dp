const bandcampURL =
  /(^https:)\/\/(www\.)?(.*\.)?bandcamp.com\/(track|album)\/.*/;

export function isBandcampURL(query: string) {
  try {
    const parsedURL = new URL(query.trim());

    if (bandcampURL.test(parsedURL.toString())) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
