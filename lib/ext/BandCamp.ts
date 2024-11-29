import { BaseExtractor, ExtractorInfo, ExtractorSearchContext, ExtractorStreamable, Track } from "discord-player"
import bcfetch from "bandcamp-fetch"
import { bridge } from "../utils/bridge";

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

    async handle(_query: string, _context: ExtractorSearchContext): Promise<ExtractorInfo> {
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