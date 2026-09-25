import FetchClient, { isDuckduckgoAvailable } from "./fetch-client.js";
import LocalClient, {
  isChromeAvailable,
  setLocalChromePath,
} from "./local-client.js";
import OllamaClient, { setOllamaApiKey } from "./ollama-client.js";
import TavilyClient, { setTavilyApiKey } from "./tavily-client.js";
import type { SearchClient } from "./utils.js";

export type Provider = {
  ollama?: { apiKey?: string };
  tavily?: { apiKey?: string };
  local?: { chromePath?: string };
};

export type { FetchResult, SearchClient, SearchResult } from "./utils.js";

type ClientCandidate = {
  isAvailable: () => boolean | Promise<boolean>;
  getClient: () => SearchClient | Promise<SearchClient>;
};

export const getWebSearchClient = async (
  providerConfig?: Provider,
): Promise<SearchClient> => {
  const candidates: ClientCandidate[] = [];

  candidates.push({
    isAvailable: () => !!providerConfig?.ollama?.apiKey,
    getClient: () => {
      setOllamaApiKey(String(providerConfig?.ollama?.apiKey));
      return OllamaClient;
    },
  });

  candidates.push({
    isAvailable: () => !!providerConfig?.tavily?.apiKey,
    getClient: () => {
      setTavilyApiKey(String(providerConfig?.tavily?.apiKey));
      return TavilyClient;
    },
  });

  candidates.push({
    isAvailable: () => isChromeAvailable(providerConfig?.local?.chromePath),
    getClient: () => {
      setLocalChromePath(providerConfig?.local?.chromePath);
      return LocalClient;
    },
  });

  candidates.push({
    isAvailable: isDuckduckgoAvailable,
    getClient: () => FetchClient,
  });

  for (const candidate of candidates) {
    if (await candidate.isAvailable()) return await candidate.getClient();
  }

  throw new Error("Web search feature is not available");
};
