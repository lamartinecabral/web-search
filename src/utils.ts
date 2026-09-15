export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

export type FetchResult = { title: string; content: string };

/** The common interface implemented by every web-search backend. */
export interface SearchClient {
  webSearch(query: string): Promise<SearchResult[]>;
  webFetch(url: string): Promise<FetchResult>;
}

export class Mutex {
  private locked = false;
  private queue: Array<() => void> = [];

  /**
   * Acquires the lock. Resolves with a release function once acquired.
   */
  async acquire(): Promise<() => void> {
    if (!this.locked) {
      this.locked = true;
      return this.createRelease();
    }

    return new Promise<() => void>((resolve) => {
      this.queue.push(() => {
        this.locked = true;
        resolve(this.createRelease());
      });
    });
  }

  /**
   * Runs a callback within the lock, automatically releasing it even if an error occurs.
   */
  async runExclusive<T>(callback: () => Promise<T> | T): Promise<T> {
    const release = await this.acquire();
    try {
      return await callback();
    } finally {
      release();
    }
  }

  /**
   * Returns whether the lock is currently acquired.
   */
  isLocked(): boolean {
    return this.locked;
  }

  private createRelease(): () => void {
    let released = false;

    return () => {
      if (released) return;
      released = true;

      const next = this.queue.shift();
      if (next) {
        next();
      } else {
        this.locked = false;
      }
    };
  }
}
