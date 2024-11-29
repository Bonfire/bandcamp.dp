import { BaseExtractor, ExtractorInfo, ExtractorSearchContext, ExtractorStreamable, Track } from "discord-player"
import bcfetch from "bandcamp-fetch"

export interface BandCampExtOpt {
    cookie?: string;
}

export class BandCampExtractor extends BaseExtractor<BandCampExtOpt> {
    async activate(): Promise<void> {
        bcfetch.setCookie(this.options.cookie)
    }

    emptyResponse(): ExtractorInfo {
        return {
            playlist: null,
            tracks: []
        }
    }

    async handle(_query: string, _context: ExtractorSearchContext): Promise<ExtractorInfo> {
        // TODO: IMPLEMENT THIS
        return this.emptyResponse()
    }

    async bridge(track: Track, sourceExtractor: BaseExtractor | null): Promise<ExtractorStreamable | null> {
        const query = sourceExtractor?.createBridgeQuery(track) || `${track.author} ${track.source === "youtube" ? track.cleanTitle : track.title}`

        try {
            const search = await bcfetch.search.tracks({query})
            if(search.items.length === 0) return null
            const info = await bcfetch.track.getInfo({
                trackUrl: search.items[0].url
            })
            const streamUrl = info.streamUrlHQ || info.streamUrl
            return streamUrl || null
        } catch (error) {
            this.context.player.debug("Bridge failed. The error is as follows\n" + error)
            return null
        }
    }
}