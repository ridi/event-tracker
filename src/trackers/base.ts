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

  public abstract sendPageView(pageMeta: PageMeta, ts?: Date): void;

  public abstract sendEvent(
    name: string,
    data?: Record<string, unknown>,
    ts?: Date,
  ): void;

  public abstract sendSignUp(args?: Record<string, unknown>, ts?: Date): void;

  public abstract sendImpression(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void;

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
}
