import { loadKakao } from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';
import {
  PaymentInfo,
  Product,
  Promotion,
  PurchaseInfo,
  UIElement,
} from '../ecommerce/model';

declare let kakaoPixel: (trackingId: string) => KakaoPixel;

export interface KakaoOptions {
  trackingId: string;
}

declare global {
  interface KakaoPixel {
    pageView(...fields: any[]): void;

    completeRegistration(...fields: any[]): void;

    signUp(...fields: any[]): void;

    viewContent(...fields: any[]): void;
  }
}

export class KakaoTracker extends BaseTracker {
  constructor(private options: KakaoOptions) {
    super();
  }

  private tracker: KakaoPixel;

  public async initialize(): Promise<void> {
    await loadKakao();
    this.tracker = kakaoPixel(this.options.trackingId);
  }

  public isInitialized(): boolean {
    return typeof this.tracker === 'object';
  }

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    this.tracker.pageView();
  }

  public sendSignUp(args?: Record<string, unknown>, ts?: Date): void {
    this.tracker.completeRegistration();
  }

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {
    this.tracker.signUp();
  }

  public sendImpression(items: Product[], ts?: Date): void {
    this.tracker.viewContent();
  }

  public sendAddPaymentInfo(
    payInfo: PaymentInfo,
    items: Product[],
    ts?: Date,
  ): void {}

  public sendAddToCart(items: Product[], ts?: Date): void {}

  public sendClick(items: UIElement[], ts?: Date): void {}

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

  public sendSearch(searchTerm: string, ts?: Date): void {}

  public sendEvent(
    name: string,
    data?: Record<string, unknown>,
    ts?: Date,
  ): void {}

  public sendViewPromotion(
    promotion: Promotion,
    items?: [Product][],
    ts?: Date,
  ): void {}
}
