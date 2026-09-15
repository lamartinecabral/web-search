import z from "zod";
import type { FetchResult, SearchClient, SearchResult } from "./utils.js";

let apiKey = "";

export const setOllamaApiKey = (value: string) => {
  apiKey = value;
};

const webSearch = async (query: string): Promise<SearchResult[]> => {
  const response = await fetch("https://ollama.com/api/web_search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, maxResults: 5 }),
  }).then((res) => res.text());

  try {
    const { results } = z
      .object({
        results: z.array(
          z.object({
            title: z.coerce.string(),
            url: z.coerce.string(),
            content: z.coerce.string(),
          }),
        ),
      })
      .parse(JSON.parse(response));

    return results.map((res) => ({
      title: res.title,
      url: res.url,
      snippet: res.content,
    }));
  } catch (_) {
    throw new Error("Web search failed");
  }
};

const webFetch = async (url: string): Promise<FetchResult> => {
  const response = await fetch("https://ollama.com/api/web_fetch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  }).then((res) => res.text());

  try {
    const result = z
      .object({
        title: z.coerce.string(),
        content: z.coerce.string(),
      })
      .parse(JSON.parse(response));

    return {
      title: result.title,
      content: result.content,
    };
  } catch (_) {
    throw new Error("Web fetch failed");
  }
};

const client: SearchClient = {
  webFetch,
  webSearch,
};

export default client;
