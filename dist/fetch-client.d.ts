import type { FetchResult, SearchResult } from "./utils.js";
export declare function isDuckduckgoAvailable(): Promise<boolean>;
declare const _default: {
    webFetch: (url: string) => Promise<FetchResult>;
    webSearch: (query: string) => Promise<SearchResult[]>;
};
export default _default;
