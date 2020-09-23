import { MainTrackerOptions } from '..';

import { loadTagManager } from '../utils/externalServices';
import { BaseTracker, PageMeta } from './base';

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
    this.dataLayer.push({
      event: name,
      data,
    });
  }

  private pushDataLayer(data: Record<string, any>): void {
    this.dataLayer.push(data);
  }

  public sendAddPaymentInfo(args?: Record<string, unknown>, ts?: Date): void {}

  public sendImpression(args?: Record<string, unknown>, ts?: Date): void {}

  public sendSignUp(args?: Record<string, unknown>, ts?: Date): void {}

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {}
}
