import {
  loadTwitterTag,
  loadTwitterUniversal,
} from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';
import { EcommerceTracker, Item, Promotion } from '../ecommerce';
import { PurchaseInfo } from '../ecommerce/models/transaction';

declare let twq: any;
declare let twttr: any;

export interface TwitterOptions {
  mainPid: string;
  booksSignUpPid?: string;
  selectStartSubscriptionPid?: string;
  impressionPid: string;
}

export class TwitterTracker extends BaseTracker {
  constructor(private options: TwitterOptions) {
    super();
  }

  private twttr: any;

  // eslint-disable-next-line @typescript-eslint/ban-types
  private twq: (...command: any[]) => {};

  public async initialize(): Promise<void> {
    await Promise.all([loadTwitterUniversal(), loadTwitterTag()]);
    this.twq = twq;
    this.twttr = twttr;
    this.twq('init', this.options.mainPid);
  }

  public isInitialized(): boolean {
    return typeof this.twq === 'function' && typeof this.twttr === 'object';
  }

  public sendEvent(
    name: string,
    data?: Record<string, unknown>,
    ts?: Date,
  ): void {}

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    this.twq('track', 'pageView');
  }

  public sendSignUp(args?: Record<string, unknown>, ts?: Date): void {
    this.twttr.conversion.trackPid(this.options.booksSignUpPid, {
      tw_sale_amount: 0,
      tw_order_quantity: 0,
    });
  }

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {
    this.twttr.conversion.trackPid(this.options.selectStartSubscriptionPid, {
      tw_sale_amount: 0,
      tw_order_quantity: 0,
    });
  }

  public sendImpression(items: Item[], ts?: Date): void {
    this.twttr.conversion.trackPid(this.options.impressionPid, {
      tw_sale_amount: 0,
      tw_order_quantity: 0,
    });
  }

  public sendAddPaymentInfo(
    paymentType: string,
    purchaseInfo: PurchaseInfo,
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
