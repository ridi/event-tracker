import { loadGTag } from "../utils/externalServices";
import { BaseTracker } from "./base";

export interface GTagOptions {
  trackingId: string;
}

declare global {
  interface Window {
    dataLayer?: object[];
  }
}

export class GTagTracker extends BaseTracker {
  constructor(private options: GTagOptions) {
    super();
  }
  private tagCalled = false;

  public initialize(): void {
    loadGTag(this.options.trackingId);
    this.tagCalled = true;
  }

  public isInitialized(): boolean {
    return this.tagCalled;
  }
}
