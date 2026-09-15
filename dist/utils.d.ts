export type SearchResult = {
    title: string;
    url: string;
    snippet: string;
};
export type FetchResult = {
    title: string;
    content: string;
};
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
