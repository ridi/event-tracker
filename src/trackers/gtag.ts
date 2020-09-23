import { loadGTag } from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';
import { Archiveable, Displayable, Impression, Purchasable } from './ecommerce';

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

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {}

  public sendEvent(
    name: string,
    data?: Record<string, unknown>,
    ts?: Date,
  ): void {}

  public sendAddPaymentInfo(args?: Record<string, unknown>, ts?: Date): void {}

  public sendImpression(items: Displayable[], ts?: Date): void {}

  public sendSignUp(args?: Record<string, unknown>, ts?: Date): void {}

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {}

  public sendAddToCart(items: Archiveable[], ts?: Date): void {}

  public sendPurchase(tId: string, items: Purchasable[], ts?: Date): void {}
}
