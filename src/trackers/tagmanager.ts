import { MainTrackerOptions } from '..';

import { loadTagManager } from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';
import { EcommerceTracker, Item, Promotion } from '../ecommerce';
import { PurchaseInfo } from '../ecommerce/models/transaction';

export interface TagManagerOptions {
  trackingId: string;
}

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
  }
}

export class TagManagerTracker extends BaseTracker {
  private tagCalled = false;

  constructor(private options: TagManagerOptions) {
    super();
  }

  private get dataLayer() {
    if (!this.tagCalled) {
      window.dataLayer = window.dataLayer || [];
    }

    return window.dataLayer;
  }

  public setMainOptions(newOptions: MainTrackerOptions): void {
    super.setMainOptions(newOptions);

    this.pushDataLayer(newOptions);
    this.sendEvent('Options Changed', newOptions);
  }

  public async initialize(): Promise<void> {
    this.pushDataLayer(this.mainOptions);
    await loadTagManager(this.options.trackingId);
    this.tagCalled = true;
  }

  public isInitialized(): boolean {
    return this.tagCalled;
  }

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    this.sendEvent('Page View', pageMeta, ts);
  }

  public sendEvent(
    name: string,
    data: Record<string, any> = {},
    ts?: Date,
  ): void {
    this.dataLayer.push({ event: name, data });
  }

  private pushDataLayer(data: Record<string, any>): void {
    this.dataLayer.push(data);
  }

  public sendImpression(items: Item[], ts?: Date): void {}

  public sendSignUp(args?: Record<string, unknown>, ts?: Date): void {}

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
