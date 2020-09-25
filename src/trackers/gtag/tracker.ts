import { loadGTag } from '../../utils/externalServices';
import { BaseTracker, PageMeta } from '../base';
import { Product, PurchaseInfo } from '../../ecommerce/model';

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

  public async initialize(): Promise<void> {
    await loadGTag(this.options.trackingId);
    gtag('config', this.options.trackingId);
  }

  public isInitialized(): boolean {
    return typeof gtag === 'function';
  }

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    gtag('event', 'page_view', {
      page_location: pageMeta.href,
      page_path: pageMeta.path,
      page_title: pageMeta.page,
    });
  }

  public sendEvent(
    name: string,
    data?: Record<string, unknown>,
    ts?: Date,
  ): void {
    gtag('event', name, data);
  }

  public sendAddPaymentInfo(args?: Record<string, unknown>, ts?: Date): void {
    gtag('event', 'add_payment_info');
  }

  public sendSignUp(args?: Record<string, unknown>, ts?: Date): void {
    gtag('event', 'sign_up', {
      method: 'ridi',
    });
  }

  public sendImpression(items: Product[], ts?: Date): void {}

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {}

  public sendAddToCart(items: Product[], ts?: Date): void {}

  public sendClick(items: Product[], ts?: Date): void {}

  public sendItemView(items: Product[], ts?: Date): void {}

  public sendItemViewFromList(items: Product[], ts?: Date): void {}

  public sendPurchase(
    purchaseInfo: PurchaseInfo,
    items: Product[],
    ts?: Date,
  ): void {}

  public sendRefund(
    purchaseInfo: PurchaseInfo,
    items: Product[],
    ts?: Date,
  ): void {}

  public sendRemoveFromCart(items: Product[], ts?: Date): void {}

  public sendSearch(items: Product[], ts?: Date): void {}
}
