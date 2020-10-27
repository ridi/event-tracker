import { DeviceType, MainTrackerOptions } from '../index';
import { EcommerceTracker } from '../ecommerce';

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

  sendScreenView(
    screenName: string,
    previousScreenName: string,
    referrer?: string,
    ts?: Date,
  ): void;

  sendEvent(name: string, data?: Record<string, unknown>, ts?: Date): void;

  sendSignUp(method: string, ts?: Date): void;
}

// https://github.com/Microsoft/TypeScript/issues/4670#issuecomment-326585615
export interface BaseTracker extends EventTracker, EcommerceTracker {}

export abstract class BaseTracker implements EventTracker, EcommerceTracker {
  public mainOptions: MainTrackerOptions;

  public abstract isInitialized(): boolean;

  public abstract async initialize(): Promise<void>;

  public setMainOptions(newOptions: MainTrackerOptions): void {
    this.mainOptions = newOptions;
  }
}
