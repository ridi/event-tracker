import { loadPixel } from "../utils/loadPixel";
import { BaseTracker, PageMeta } from "./base";

export interface PixelOptions {
  pixelId: string;
}

export class PixelTracker extends BaseTracker {
  constructor(private options: PixelOptions) {
    super();
  }

  private initialPageViewEventFired = false;

  public initialize(): void {
    loadPixel();
    fbq("init", this.options.pixelId);
  }

  public isInitialized(): boolean {
    return typeof fbq === "function";
  }

  public sendPageView(pageMeta: PageMeta): void {
    if (!this.initialPageViewEventFired) {
      // Pixel automatically tracks route changes itself.
      // So we don't need to evaluate this block for every call.
      this.initialPageViewEventFired = true;

      // Pixel does not support custom page view event.
      // They only refer to global objects such as 'location', 'history'.
      fbq("track", "PageView");
    }
  }
}
