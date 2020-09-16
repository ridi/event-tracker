import { loadGTag } from '../utils/externalServices';
import { BaseTracker } from './base';

export interface GTagOptions {
  trackingId: string;
}

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
  }
}

export class GTagTracker extends BaseTracker {
  constructor(private options: GTagOptions) {
    super();
  }

  private tagCalled = false;

  public async initialize(): Promise<void> {
    await loadGTag(this.options.trackingId);
    this.tagCalled = true;
  }

  public isInitialized(): boolean {
    return this.tagCalled;
  }
}
