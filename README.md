# bandcamp.dp

This is a simple bandcamp extractor for discord-player.

```ts
import { BandCampExtractor } from "bandcamp.dp"

await player.extractors.register(BandCampExtractor, {
    cookie: "" // optional for high quality streaming for tracks you have purchased
})
```