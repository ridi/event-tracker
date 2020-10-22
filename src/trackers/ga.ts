import { loadGA } from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';
import { PurchaseInfo } from '../ecommerce/models/transaction';
import { Item, Promotion } from '../ecommerce/models';

interface GAFields extends UniversalAnalytics.FieldsObject {
  allowAdFeatures?: boolean;
}

export interface GAOptions {
  trackingId: string;
  pathPrefix?: string;
  fields?: GAFields;
}

/**
 * @deprecated Use GTagTracker Instead
 * @see GTagTracker
 */

export class GATracker extends BaseTracker {
  constructor(private options: GAOptions) {
    super();
  }

  private refinePath(originalPath: string): string {
    const refiners: Array<(path: string) => string> = [
      path => (this.options.pathPrefix ? this.options.pathPrefix + path : path),
      path =>
        path.startsWith('/')
          ? path
          : `/${
              path // Ref: https://app.asana.com/0/inbox/463186034180509/765912307342230/766156873493449 // Pathname in some browsers doesn't start with slash character (/)
            }`,
    ];

    return refiners.reduce((value, refiner) => refiner(value), originalPath);
  }

  public async initialize(): Promise<void> {
    await loadGA();
    if (this.options.fields) {
      ga('create', this.options.trackingId, this.options.fields);
    } else {
      ga('create', this.options.trackingId, 'auto');
    }
  }

  public isInitialized(): boolean {
    return typeof ga === 'function';
  }

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    const refinedPath = this.refinePath(pageMeta.path);
    const queryString = pageMeta.href.split('?')[1] || '';

    const pageName = `${refinedPath}?${queryString}`;

    ga('set', 'page', pageName);

    const fields: UniversalAnalytics.FieldsObject = {
      hitType: 'pageview',
      dimension1: this.mainOptions.deviceType,
    };
    if (ts) {
      fields.queueTime = Math.max(Date.now() - ts.getTime(), 0);
    }
    ga('send', fields);
  }

  public sendEvent(name: string, data?: Record<string, any>, ts?: Date): void {
    const fields: UniversalAnalytics.FieldsObject = {
      hitType: 'event',
      eventCategory: data.category || 'All',
      eventAction: data.action || name,
      eventLabel: data.label || 'All',
    };
    if (ts) {
      fields.queueTime = Math.max(Date.now() - ts.getTime(), 0);
    }
    ga('send', fields);
  }

  public sendImpression(items: Item[], ts?: Date): void {}

  public sendSignUp(method: string, ts?: Date): void {}

  public sendAddPaymentInfo(
    paymentType: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void {}

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {}

  public sendAddToCart(items: Item[], ts?: Date): void {}

  public sendItemView(items: Item[], ts?: Date): void {}

  public sendItemViewFromList(items: Item[], ts?: Date): void {}

  public sendPurchase(
    transactionId: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void {}

  public sendRefund(
    purchaseInfo: PurchaseInfo,
    items: Item[],
    ts?: Date,
  ): void {}

  public sendRemoveFromCart(items: Item[], ts?: Date): void {}

  public sendSearch(searchTerm: string, ts?: Date): void {}

  public sendViewPromotion(
    promotion: Promotion,
    items?: Item[],
    ts?: Date,
  ): void {}
}
