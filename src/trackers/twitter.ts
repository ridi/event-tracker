import {
  loadTwitterTag,
  loadTwitterUniversal,
} from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';
import { Item } from '../ecommerce';
import { PurchaseInfo } from '../ecommerce/models/transaction';

declare let twq: any;
declare let twttr: any;

export interface TwitterOptions {
  mainPid: string;
  booksSignUpPid?: string;
  selectStartSubscriptionPid?: string;
  impressionPid: string;
}

/**
 * @deprecated Use GTM provided tag
 */
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

  public sendSignUp(method: string, ts?: Date): void {
    this.twttr.conversion.trackPid(this.options.booksSignUpPid, {
      tw_sale_amount: 0,
      tw_order_quantity: 0,
    });
  }

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
