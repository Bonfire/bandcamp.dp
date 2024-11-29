import { BaseExtractor, ExtractorInfo, ExtractorSearchContext, ExtractorStreamable, Track, Util } from "discord-player"
import bcfetch from "bandcamp-fetch"
import { bridge } from "../utils/bridge";
import { isURL } from "../utils/isUrl";

export interface BandCampExtOpt {
    cookie?: string;
}

export class BandCampExtractor extends BaseExtractor<BandCampExtOpt> {
    static identifier = "com.retrouser955.discord-player.bandcamp" as const

    async activate(): Promise<void> {
        if(this.options.cookie) {
            bcfetch.setCookie(this.options.cookie)
        }
    }

    async handle(query: string, context: ExtractorSearchContext): Promise<ExtractorInfo> {
        if(isURL(query)) return this.createResponse()
        const search = await bcfetch.search.tracks({query})
        if(search.items.length === 0) return this.createResponse()
        const tracks = await Promise.all(search.items.slice(0, 3).map(async (rawT) => {
            const item = await bcfetch.track.getInfo({
                trackUrl: rawT.url
            })

            const track = new Track(this.context.player, {
                title: item.name,
                duration: Util.buildTimeCode(Util.parseMS((item.duration || 0) * 1000)),
                author: item.artist?.name || "UNKNOWN",
                raw: rawT,
                thumbnail: item.imageUrl,
                source: 'arbitrary',
                queryType: 'arbitrary',
                live: false
            })
            return track
        })) // SUCKS! Search is not impressive
        return this.createResponse(null, tracks)
        // TODO: IMPLEMENT BANDCAMP URL QUERYING
        // TODO: IMPLEMENT THIS
        return this.createResponse() // empty response
    }

    async bridge(track: Track, sourceExtractor: BaseExtractor | null): Promise<ExtractorStreamable | null> {
        try {
            return bridge(track, sourceExtractor)
        } catch (error) {
            this.context.player.debug("Failed due to following error(s)\n" + error)
            return null
        }
    }
}