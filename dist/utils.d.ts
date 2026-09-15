export type SearchResult = {
    title: string;
    url: string;
    snippet: string;
};
export type FetchResult = {
    title: string;
    content: string;
};
/** The common interface implemented by every web-search backend. */
export interface SearchClient {
    webSearch(query: string): Promise<SearchResult[]>;
    webFetch(url: string): Promise<FetchResult>;
}
export declare class Mutex {
    private locked;
    private queue;
    /**
     * Acquires the lock. Resolves with a release function once acquired.
     */
    acquire(): Promise<() => void>;
    /**
     * Runs a callback within the lock, automatically releasing it even if an error occurs.
     */
    runExclusive<T>(callback: () => Promise<T> | T): Promise<T>;
    /**
     * Returns whether the lock is currently acquired.
     */
    isLocked(): boolean;
    private createRelease;
}
