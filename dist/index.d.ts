type Provider = {
    ollama?: {
        apiKey?: string;
    };
    tavily?: {
        apiKey?: string;
    };
};
export declare const getWebSearchClient: (providerConfig?: Provider) => Promise<{
    webFetch: (url: string) => Promise<import("./utils.js").FetchResult>;
    webSearch: (query: string) => Promise<import("./utils.js").SearchResult[]>;
}>;
export {};
