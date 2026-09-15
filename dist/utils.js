export class Mutex {
    locked = false;
    queue = [];
    /**
     * Acquires the lock. Resolves with a release function once acquired.
     */
    async acquire() {
        if (!this.locked) {
            this.locked = true;
            return this.createRelease();
        }
        return new Promise((resolve) => {
            this.queue.push(() => {
                this.locked = true;
                resolve(this.createRelease());
            });
        });
    }
    /**
     * Runs a callback within the lock, automatically releasing it even if an error occurs.
     */
    async runExclusive(callback) {
        const release = await this.acquire();
        try {
            return await callback();
        }
        finally {
            release();
        }
    }
    /**
     * Returns whether the lock is currently acquired.
     */
    isLocked() {
        return this.locked;
    }
    createRelease() {
        let released = false;
        return () => {
            if (released)
                return;
            released = true;
            const next = this.queue.shift();
            if (next) {
                next();
            }
            else {
                this.locked = false;
            }
        };
    }
}
