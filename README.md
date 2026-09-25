# @lamartinecabral/web-search

A TypeScript/ESM client for web search and page-content extraction in RAG workflows. It exposes one API and selects an available backend automatically.

## Requirements

- Node.js 24 or newer
- Network access to the selected backend
- Google Chrome only when the local browser backend is used

## Installation

```bash
npm install @lamartinecabral/web-search
```

The package is ESM-only, so import it from an ES module:

```ts
import { getWebSearchClient } from "@lamartinecabral/web-search";
```

## Usage

```ts
const web = await getWebSearchClient({
  tavily: { apiKey: process.env.TAVILY_API_KEY },
});

const results = await web.webSearch("latest developments in retrieval augmented generation");

for (const result of results) {
  console.log(result.title, result.url);
  console.log(result.snippet);
}

if (results[0]) {
  const page = await web.webFetch(results[0].url);
  console.log(page.title);
  console.log(page.content);
}
```

Create the client once and reuse it. `webSearch` returns `SearchResult[]`:

```ts
{
  title: string;
  url: string;
  snippet: string;
}
```

`webFetch` returns a `FetchResult`:

```ts
{
  title: string;
  content: string;
}
```

The returned title can be empty for providers that do not supply one. Both methods reject with an error when the selected backend cannot complete the operation.

## Backend selection

`getWebSearchClient` checks providers in this order:

1. Ollama, when `ollama.apiKey` is set
2. Tavily, when `tavily.apiKey` is set
3. Local Chrome with Brave Search, when `local.chromePath` is configured and the executable is available
4. DuckDuckGo HTML search and native `fetch`, when DuckDuckGo is reachable

Only the first matching backend is used. If none is available, the function throws `Web search feature is not available`.

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

The local backend uses `puppeteer-core` to open a visible Chrome window, search Brave Search, and extract content from the requested page. Set `local.chromePath` to the Chrome executable's path, or use `"default"`. With `"default"`, the backend uses the path in the `CHROME_PATH` environment variable when set; otherwise, it uses this platform-specific default:

- macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Linux: `/usr/bin/google-chrome`

The local backend is skipped when `local.chromePath` is omitted.

For example, to use the platform default (or `CHROME_PATH`):

```ts
const web = await getWebSearchClient({
  local: { chromePath: "default" },
});
```

To use a different Chrome installation, provide its executable path instead:

```ts
const web = await getWebSearchClient({
  local: { chromePath: "path/to/chrome" },
});
```

### DuckDuckGo fallback

When local Chrome is not configured or unavailable, the fallback uses DuckDuckGo's HTML endpoint for search and native `fetch` plus content extraction for page fetching. It depends on DuckDuckGo being reachable from the host.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Use `npm run lint:fix` to apply Biome fixes. `npm run build` emits JavaScript and declaration files to `dist/`; `prepack` runs the same build automatically. The project currently has no test script.

## License

ISC
