import type { SearchClient } from "./utils.js";
export type Provider = {
    ollama?: {
        apiKey?: string;
    };
    tavily?: {
        apiKey?: string;
    };
};
export type { FetchResult, SearchClient, SearchResult } from "./utils.js";
export declare const getWebSearchClient: (providerConfig?: Provider) => Promise<SearchClient>;
