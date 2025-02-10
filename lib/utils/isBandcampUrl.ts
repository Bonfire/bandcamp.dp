const bandcampTrack = /(^https:)\/\/(www\.)?(.*\.)?bandcamp.com\/track\/.*/;
const bandcampAlbum = /(^https:)\/\/(www\.)?(.*\.)?bandcamp.com\/album\/.*/;

export function isBandcampURL(query: string) {
  try {
    const parsedURL = new URL(query.trim());

    if (
      bandcampTrack.test(parsedURL.toString()) ||
      bandcampAlbum.test(parsedURL.toString())
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
