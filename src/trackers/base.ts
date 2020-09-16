import { DeviceType, MainTrackerOptions } from '../index';

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

  sendStartSubscription(args?: Record<string, unknown>, ts?: Date): void;

  sendImpression(args?: Record<string, unknown>, ts?: Date): void;

  sendAddPaymentInfo(args?: Record<string, unknown>, ts?: Date): void;
}

export abstract class BaseTracker implements EventTracker {
  public mainOptions: MainTrackerOptions;

  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {}

  public sendEvent(
    name: string,
    data?: Record<string, unknown>,
    ts?: Date,
  ): void {}

  public sendSignUp(args?: Record<string, unknown>, ts?: Date): void {}

  public sendImpression(args?: Record<string, unknown>, ts?: Date): void {}

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {}

  public sendAddPaymentInfo(args?: Record<string, unknown>, ts?: Date): void {}

  /* eslint-enable @typescript-eslint/no-empty-function */

  public abstract isInitialized(): boolean;

  public abstract async initialize(): Promise<void>;

  public setMainOptions(newOptions: MainTrackerOptions): void {
    this.mainOptions = newOptions;
  }
}
