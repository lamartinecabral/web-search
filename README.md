# @lamartinecabral/web-search

A TypeScript web-search client for RAG workflows. It provides a single API for searching the web and extracting readable page content, with automatic provider selection.

## Requirements

- Node.js 24 or newer
- Network access for the selected provider
- Google Chrome is required only when using the local browser backend

## Installation

```bash
npm install github:lamartinecabral/web-search
```

## Usage

```ts
import { getWebSearchClient } from "@lamartinecabral/web-search";

const web = await getWebSearchClient({
  tavily: { apiKey: process.env.TAVILY_API_KEY },
});

const results = await web.webSearch("latest developments in retrieval augmented generation");

for (const result of results) {
  console.log(result.title, result.url);
  console.log(result.snippet);
}

const page = await web.webFetch(results[0].url);
console.log(page.title);
console.log(page.content);
```

`webSearch` returns an array of objects with `title`, `url`, and `snippet`. `webFetch` returns an object with `title` and extracted `content`.

## Provider selection

Call `getWebSearchClient` once and reuse the returned client:

```ts
const web = await getWebSearchClient(providerConfig?);
```

Providers are selected in this order:

1. Ollama, when `ollama.apiKey` is provided
2. Tavily, when `tavily.apiKey` is provided
3. Local Chrome with Brave Search, when Chrome is available
4. DuckDuckGo's HTML search, when it is reachable

If no provider is available, `getWebSearchClient` throws `Web search feature is not available`.

### Ollama

```ts
const web = await getWebSearchClient({
  ollama: { apiKey: process.env.OLLAMA_API_KEY },
});
```

Uses Ollama's hosted `web_search` and `web_fetch` APIs.

### Tavily

```ts
const web = await getWebSearchClient({
  tavily: { apiKey: process.env.TAVILY_API_KEY },
});
```

Uses Tavily's Search and Extract APIs.

### Local Chrome

The local backend searches Brave Search and fetches pages through `puppeteer-core`. Chrome is launched with a visible browser window (`headless: false`). The default executable paths are:

- macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Linux: `/usr/bin/google-chrome`

Set `CHROME_PATH` when Chrome is installed elsewhere:

```bash
CHROME_PATH=/path/to/chrome node app.js
```

### DuckDuckGo fallback

When Chrome is unavailable, the library can use DuckDuckGo's HTML endpoint for search and the native `fetch` API plus content extraction for page fetching. This fallback depends on DuckDuckGo being reachable from the host.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm run lint:fix
```

The package is ESM-only and publishes the TypeScript source from `src/`. There is currently no test script in the project.

## License

ISC
