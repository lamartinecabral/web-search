import type { FetchResult, SearchResult } from "./utils.js";
export declare const setTavilyApiKey: (value: string) => void;
declare const _default: {
    webFetch: (url: string) => Promise<FetchResult>;
    webSearch: (query: string) => Promise<SearchResult[]>;
};
export default _default;
