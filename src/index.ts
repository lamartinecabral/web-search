import FetchClient, { isDuckduckgoAvailable } from "./fetch-client.js";
import LocalClient, { isChromeAvailable } from "./local-client.js";
import OllamaClient, { setOllamaApiKey } from "./ollama-client.js";
import TavilyClient, { setTavilyApiKey } from "./tavily-client.js";

type Provider = {
  ollama?: { apiKey?: string };
  tavily?: { apiKey?: string };
};

export const getWebSearchClient = async (providerConfig?: Provider) => {
  if (providerConfig?.ollama?.apiKey) {
    setOllamaApiKey(providerConfig?.ollama?.apiKey);
    return OllamaClient;
  }
  if (providerConfig?.tavily?.apiKey) {
    setTavilyApiKey(providerConfig?.tavily?.apiKey);
    return TavilyClient;
  }
  if (isChromeAvailable()) return LocalClient;
  if (await isDuckduckgoAvailable()) return FetchClient;
  throw new Error("Web search feature is not available");
};
