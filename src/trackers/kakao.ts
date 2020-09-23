import { loadKakao } from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';
import { Impression } from './ecommerce';

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

  public sendImpression(items: Impression[], ts?: Date): void {
    this.tracker.viewContent();
  }

  public sendAddPaymentInfo(args?: Record<string, unknown>, ts?: Date): void {}

  public sendEvent(
    name: string,
    data?: Record<string, unknown>,
    ts?: Date,
  ): void {}
}
