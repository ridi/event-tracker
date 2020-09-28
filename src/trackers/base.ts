import { DeviceType, MainTrackerOptions } from '../index';
import { EcommerceTracker } from '../ecommerce';
import { Product, PurchaseInfo, UIElement } from '../ecommerce/model';

/* eslint-disable camelcase */
export interface PageMeta {
  page: string;
  device: DeviceType;
  query_params: { [key: string]: string | undefined };
  path: string;
  href: string;
  referrer: string;
}
/* eslint-enable camelcase */

export interface EventTracker {
  sendPageView(pageMeta: PageMeta, ts?: Date): void;

  sendEvent(name: string, data?: Record<string, unknown>, ts?: Date): void;

  sendSignUp(args?: Record<string, unknown>, ts?: Date): void;
}

export abstract class BaseTracker implements EventTracker, EcommerceTracker {
  public mainOptions: MainTrackerOptions;

  public abstract sendPageView(pageMeta: PageMeta, ts?: Date): void;

  public abstract sendEvent(
    name: string,
    data?: Record<string, unknown>,
    ts?: Date,
  ): void;

  public abstract sendSignUp(args?: Record<string, unknown>, ts?: Date): void;

  public abstract sendImpression(items: Product[], ts?: Date): void;

  public abstract sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void;

  public abstract sendAddPaymentInfo(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void;

  public abstract isInitialized(): boolean;

  public abstract async initialize(): Promise<void>;

  public setMainOptions(newOptions: MainTrackerOptions): void {
    this.mainOptions = newOptions;
  }

  public abstract sendAddToCart(items: Product[], ts?: Date): void;

  public abstract sendClick(items: UIElement[], ts?: Date): void;

  public abstract sendItemView(items: Product[], ts?: Date): void;

  public abstract sendItemViewFromList(items: Product[], ts?: Date): void;

  public abstract sendPurchase(
    purchaseInfo: PurchaseInfo,
    items: Product[],
    ts?: Date,
  ): void;

  public abstract sendRefund(
    purchaseInfo: PurchaseInfo,
    items: Product[],
    ts?: Date,
  ): void;

  public abstract sendRemoveFromCart(items: Product[], ts?: Date): void;

  public abstract sendSearch(searchTerm: string, ts?: Date): void;
}
