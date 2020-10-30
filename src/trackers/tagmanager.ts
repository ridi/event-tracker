import { MainTrackerOptions } from '..';

import { loadTagManager } from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';
import { Item } from '../ecommerce';
import { PurchaseInfo } from '../ecommerce/models/transaction';
import { convertKeyToSnakeCase } from '../utils/util';

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

  private pushDataLayer(data: Record<string, any>): void {
    this.dataLayer.push(data);
  }

  public setMainOptions(newOptions: MainTrackerOptions): void {
    super.setMainOptions(newOptions);

    this.pushDataLayer(newOptions);
    this.sendEvent('OptionsChanged', newOptions);
  }

  public async initialize(): Promise<void> {
    this.pushDataLayer(this.mainOptions);
    await loadTagManager(this.options.trackingId);
    this.tagCalled = true;
  }

  public sendEvent(
    name: string,
    data: Record<string, any> = {},
    ts?: Date,
  ): void {
    data = convertKeyToSnakeCase(data);
    this.pushDataLayer({ event: name, event_params: data, ts });
  }

  public isInitialized(): boolean {
    return this.tagCalled;
  }

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    this.sendEvent('PageView', { ...pageMeta }, ts);
  }

  public sendScreenView(
    screenName: string,
    previousScreenName: string,
    referrer?: string,
    ts?: Date,
  ): void {
    this.sendEvent(
      'ScreenView',
      { screenName, previousScreenName, referrer },
      ts,
    );
  }

  public sendSignUp(method: string, ts?: Date): void {
    this.sendEvent('SignUp', { method }, ts);
  }

  public sendLogin(method: string, ts?: Date): void {
    this.sendEvent('Login', { method }, ts);
  }

  public sendBeginCheckout(purchaseInfo: PurchaseInfo, ts?: Date): void {
    this.sendEvent('BeginCheckout', { ...purchaseInfo }, ts);
  }

  public sendAddPaymentInfo(
    paymentType: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void {
    this.sendEvent('AddPaymentInfo', { paymentType, ...purchaseInfo }, ts);
  }

  public sendAddToPreference(items: Item[], ts?: Date): void {
    this.sendEvent('AddToPreference', { items }, ts);
  }

  public sendAddToNewBookNotification(items: Item[], ts?: Date): void {
    this.sendEvent('AddToNewBookNotification', { items }, ts);
  }

  public sendViewItem(items: Item[], ts?: Date): void {
    this.sendEvent('ViewItem', { items }, ts);
  }

  public sendViewContent(item: Item, ts?: Date): void {
    this.sendEvent('ViewContent', { item }, ts);
  }

  public sendViewItemList(items: Item[], ts?: Date): void {}

  public sendPurchase(
    transactionId: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void {
    this.sendEvent('Purchase', { transactionId, ...purchaseInfo }, ts);
  }
}
