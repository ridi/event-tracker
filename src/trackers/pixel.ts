import { loadPixel } from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';
import { Item, Promotion } from '../ecommerce';
import { PurchaseInfo } from '../ecommerce/models/transaction';

export interface PixelOptions {
  pixelId: string | string[];
}

export class PixelTracker extends BaseTracker {
  constructor(private options: PixelOptions) {
    super();
  }

  private initialPageViewEventFired = false;

  public async initialize(): Promise<void> {
    await loadPixel();
    const pixelIds =
      typeof this.options.pixelId === 'string'
        ? [this.options.pixelId]
        : this.options.pixelId;

    pixelIds.forEach(id => fbq('init', id));
  }

  public isInitialized(): boolean {
    return typeof fbq === 'function';
  }

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    if (!this.initialPageViewEventFired) {
      // Pixel automatically tracks route changes itself.
      // So we don't need to evaluate this block for every call.

      this.initialPageViewEventFired = true;

      // Pixel does not support custom page view event.
      // They only refer to global objects such as 'location', 'history'.

      fbq('track', 'PageView');
    }
  }

  public sendEvent(
    name: string,
    data?: Record<string, unknown>,
    ts?: Date,
  ): void {}

  public sendSignUp(method: string, ts?: Date): void {}

  public sendAddPaymentInfo(
    paymentType: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void {}

  public sendViewItem(items: Item[], ts?: Date): void {}

  public sendViewItemList(items: Item[], ts?: Date): void {}

  public sendPurchase(
    transactionId: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void {}
}
