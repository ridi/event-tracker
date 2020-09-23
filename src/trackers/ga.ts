import { loadGA } from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';
import {
  Archiveable,
  Displayable,
  GAEcommerceTracker,
  Impression,
  Purchasable,
} from './ecommerce';

interface GAFields extends UniversalAnalytics.FieldsObject {
  allowAdFeatures?: boolean;
}

export interface GAOptions {
  trackingId: string;
  pathPrefix?: string;
  fields?: GAFields;
}

export class GATracker extends BaseTracker {
  constructor(private options: GAOptions) {
    super();
  }

  private ecommerceTracker: GAEcommerceTracker;

  private refinePath(originalPath: string): string {
    const refiners: Array<(path: string) => string> = [
      path => (this.options.pathPrefix ? this.options.pathPrefix + path : path), // Ref: https://app.asana.com/0/inbox/463186034180509/765912307342230/766156873493449 // Pathname in some browsers doesn't start with slash character (/)

      path => (path.startsWith('/') ? path : `/${path}`),
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
    ga('require', 'ec');

    this.ecommerceTracker = new GAEcommerceTracker();
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

  public sendAddPaymentInfo(args?: Record<string, unknown>, ts?: Date): void {}

  public sendSignUp(args?: Record<string, unknown>, ts?: Date): void {}

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {}

  public sendImpression(items: Displayable[], ts?: Date): void {
    this.ecommerceTracker.sendDisplay(...items);
  }

  public sendPurchase(tId: string, items: Purchasable[], ts?: Date): void {
    this.ecommerceTracker.sendPurchase(tId, ...items);
  }

  public sendAddToCart(items: Archiveable[], ts?: Date): void {
    this.ecommerceTracker.sendAdd('cart', ...items);
  }
}
