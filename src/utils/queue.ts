import { Log } from "./log";

export class QueueManager<T extends Log> {
  constructor(
    private size: number = 1,
    private flushIntervalInMs: number = 3000
  ) {}
  private queue: T[] = [];
  private flushTimerId: number = null;

  public enqueue(log: T) {
    if (!this.queue.length) {
      this.setFlushTimer();
    }
    this.queue.push(log);

    if (this.queue.length >= this.size) {
      this.flush();
    }
  }

  public flush() {
    while (this.queue.length) {
      const log = this.queue.shift();
      log.send();
    }
    this.clearFlushTimer();
  }

  public setFlushTimer() {
    this.flushTimerId = setTimeout(() => {
      this.flush();
    }, this.flushIntervalInMs);
  }

  public clearFlushTimer() {
    clearInterval(this.flushTimerId);
  }
}
