import FetchClient, { isDuckduckgoAvailable } from "./fetch-client.js";
import LocalClient, { isChromeAvailable } from "./local-client.js";
import OllamaClient, { setOllamaApiKey } from "./ollama-client.js";
import TavilyClient, { setTavilyApiKey } from "./tavily-client.js";
export const getWebSearchClient = async (providerConfig) => {
    const candidates = [];
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
    candidates.push({ isAvailable: isChromeAvailable, getClient: () => LocalClient }, { isAvailable: isDuckduckgoAvailable, getClient: () => FetchClient });
    for (const candidate of candidates) {
        if (await candidate.isAvailable())
            return await candidate.getClient();
    }
    throw new Error("Web search feature is not available");
};
