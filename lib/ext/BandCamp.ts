import { Album, BandcampFetch } from "bandcamp-fetch";
import {
  BaseExtractor,
  ExtractorInfo,
  ExtractorSearchContext,
  ExtractorStreamable,
  SearchQueryType,
  Track,
  Util,
} from "discord-player";
import { bridge } from "../utils/bridge";
import { isBandcampURL } from "../utils/isBandcampUrl";

export interface BandCampExtOpt {
  cookie?: string;
}

export class BandCampExtractor extends BaseExtractor<BandCampExtOpt> {
  readonly bandcampFetch = new BandcampFetch();
  readonly trackFetcher = this.bandcampFetch.limiter.track;
  readonly albumFetcher = this.bandcampFetch.limiter.album;
  readonly bandcampSearch = this.bandcampFetch.limiter.search;

  static identifier = "com.retrouser955.discord-player.bandcamp" as const;

  async activate(): Promise<void> {
    if (this.options.cookie) {
      this.bandcampFetch.setCookie(this.options.cookie);
    }
  }

  async handle(
    query: string,
    context: ExtractorSearchContext
  ): Promise<ExtractorInfo> {
    if (query.includes("/track/")) {
      const trackSearch = await this.fetchBandcampTrack(query).catch(() => {
        return null;
      });

      if (!trackSearch) return this.createResponse();

      return this.createResponse(null, [trackSearch as Track]);
    } else if (query.includes("/album/")) {
      const albumSearch: Album = await this.albumFetcher.getInfo({
        albumUrl: query,
      });

      if (!albumSearch) return this.createResponse();

      const albumTracks = albumSearch.tracks;

      if (!albumTracks) return this.createResponse();

      const playlistInfo = this.context.player.createPlaylist({
        author: {
          name: albumSearch.artist?.name || "Unknown Artist",
          url: albumSearch.artist?.url || "Unknown URL",
        },
        description: albumSearch.description || "No Description",
        id: albumSearch.id?.toString() || "unknown-id",
        source: "arbitrary",
        thumbnail: albumSearch.imageUrl || "",
        title: albumSearch.name,
        tracks: [],
        type: "album",
        url: albumSearch?.url || "",
      });

      const fetchedTracks: Track[] = [];

      for (const albumTrack of albumTracks) {
        if (albumTrack.url) {
          await this.fetchBandcampTrack(albumTrack.url).then(
            (bandcampTrack) => {
              if (!bandcampTrack) return;

              bandcampTrack.playlist = playlistInfo;
              fetchedTracks.push(bandcampTrack);
            }
          );
        }
      }

      playlistInfo.tracks = fetchedTracks;

      return this.createResponse(playlistInfo, fetchedTracks);
    }

    return this.createResponse();
  }

  async bridge(
    track: Track,
    sourceExtractor: BaseExtractor | null
  ): Promise<ExtractorStreamable | null> {
    try {
      return bridge(track, sourceExtractor);
    } catch (error) {
      this.context.player.debug("Failed due to following error(s)\n" + error);
      return null;
    }
  }

  async validate(
    query: string,
    type?: SearchQueryType | null | undefined
  ): Promise<boolean> {
    return isBandcampURL(query);
  }

  async fetchBandcampTrack(query: string): Promise<Track | undefined> {
    return await this.trackFetcher
      .getInfo({ trackUrl: query, includeRawData: true })
      .then((bandcampTrack) => {
        if (!bandcampTrack) return;

        const playerTrack = new Track(this.context.player, {
          title: bandcampTrack.name,
          duration: Util.buildTimeCode(
            Util.parseMS((bandcampTrack.duration || 0) * 1000)
          ),
          author: bandcampTrack.artist?.name || "Unknown Artist",
          raw: bandcampTrack,
          thumbnail: bandcampTrack.imageUrl,
          source: "arbitrary",
          queryType: "arbitrary",
          live: false,
          url: bandcampTrack.url,
        });

        return playerTrack;
      });
  }
}
