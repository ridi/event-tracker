import { loadGTag } from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';
import { PurchaseInfo } from '../ecommerce/models/transaction';
import { Item } from '../ecommerce/models';

export interface GTagOptions {
  trackingId: string;
  uId?: number;
  autoPageView?: boolean;
  defaultCurrency?: string;
}

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
  }
}

export class GTagTracker extends BaseTracker {
  constructor(private options: GTagOptions) {
    super();
    options.defaultCurrency = options.defaultCurrency || 'KRW';
  }

  public async initialize(): Promise<void> {
    await loadGTag(this.options.trackingId);
    gtag('config', this.options.trackingId, {
      send_page_view: this.options.autoPageView,
      // eslint-disable-next-line prettier/prettier
      user_id: this.options.uId?.toString(),
    });
    gtag('set', { currency: this.options.defaultCurrency });
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

  public sendAddPaymentInfo(
    paymentType: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void {
    gtag('event',
      'add_payment_info',
      {
      payment_type: paymentType,
        ...purchaseInfo,
        coupon: purchaseInfo.coupon_name,
      });
  }

  public sendSignUp(method: string, ts?: Date): void {
    gtag('event', 'sign_up', { method });
  }

  public sendScreenView(
    screenName: string,
    previousScreenName: string,
    referrer?: string,
    ts?: Date,
  ): void {
    gtag('event', 'screen_view', { screen_name: screenName });
  }

    public sendImpression(items: Item[], ts?: Date): void {}



  public sendViewItem(items: Item[], ts?: Date): void {
    gtag('event', 'view_item', { items });
  }

  public sendViewItemFromList(items: Item[], ts?: Date): void {
    gtag('event', 'view_item_list', { items });
  }

  public sendPurchase(
    transactionId: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void {
    gtag('event', 'purchase', {
      transaction_id: transactionId,
      ...purchaseInfo,
    });
  }

  public sendBeginCheckout(purchaseInfo: PurchaseInfo, ts?: Date): void {
    gtag('event', 'begin_checkout', {
      ...purchaseInfo,
      coupon: purchaseInfo.coupon_name,
    });
  }

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {}

}
