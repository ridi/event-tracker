import { DeviceType, MainTrackerOptions } from '../index';
import { EcommerceTracker } from '../ecommerce';
import {
  PaymentInfo,
  Item,
  Promotion,
  PurchaseInfo,
  UIElement,
} from '../ecommerce/model';

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

  public abstract sendImpression(items: Item[], ts?: Date): void;

  public abstract sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void;

  public abstract sendAddPaymentInfo(
    payInfo: PaymentInfo,
    items: Item[],
    ts?: Date,
  ): void;

  public abstract isInitialized(): boolean;

  public abstract async initialize(): Promise<void>;

  public setMainOptions(newOptions: MainTrackerOptions): void {
    this.mainOptions = newOptions;
  }

  public abstract sendAddToCart(items: Item[], ts?: Date): void;

  public abstract sendClick(items: UIElement[], ts?: Date): void;

  public abstract sendItemView(items: Item[], ts?: Date): void;

  public abstract sendItemViewFromList(items: Item[], ts?: Date): void;

  public abstract sendPurchase(
    purchaseInfo: PurchaseInfo,
    items: Item[],
    ts?: Date,
  ): void;

  public abstract sendRefund(
    purchaseInfo: PurchaseInfo,
    items: Item[],
    ts?: Date,
  ): void;

  public abstract sendRemoveFromCart(items: Item[], ts?: Date): void;

  public abstract sendSearch(searchTerm: string, ts?: Date): void;

  public abstract sendViewPromotion(
    promotion: Promotion,
    items?: [Item][],
    ts?: Date,
  ): void;
}
