import type { BaseExtractor } from "discord-player";
import bcfetch from "bandcamp-fetch"

export const bridge: BaseExtractor['bridge'] = async (track, _) => {
    const query = `${track.author} ${track.source === "youtube" ? track.cleanTitle : track.title}`

    const search = await bcfetch.search.tracks({query})
    if(search.items.length === 0) return null
    const info = await bcfetch.track.getInfo({
        trackUrl: search.items[0].url
    })
    const streamUrl = info.streamUrlHQ || info.streamUrl
    return streamUrl || null
}