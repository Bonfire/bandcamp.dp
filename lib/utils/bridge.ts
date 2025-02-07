import { BandcampFetch } from "bandcamp-fetch";
import type { BaseExtractor } from "discord-player";

export const bridge: BaseExtractor["bridge"] = async (track, _) => {
  const matchingTrack = await new BandcampFetch().limiter.track.getInfo({
    trackUrl: track.url,
  });

  if (!matchingTrack) return null;

  const bandcampUrlTest = await new BandcampFetch().limiter.stream.test(
    matchingTrack.streamUrlHQ || matchingTrack.streamUrl || ""
  );

  if (!bandcampUrlTest.ok) {
    const refreshedUrl = await new BandcampFetch().limiter.stream.refresh(
      track.url
    );

    if (!refreshedUrl) return null;

    return refreshedUrl;
  }

  return matchingTrack.streamUrlHQ || matchingTrack.streamUrl || null;
};
