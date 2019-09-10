import { MainTrackerOptions } from "..";

import { loadTagManager } from "../utils/externalServices";
import { BaseTracker, PageMeta } from "./base";

export interface TagManagerOptions {
  trackingId: string;
}

declare global {
  interface Window {
    dataLayer?: object[];
  }
}

export class TagManagerTracker extends BaseTracker {
  constructor(private options: TagManagerOptions) {
    super();
  }
  private tagCalled = false;

  private get dataLayer() {
    if (!this.tagCalled) {
      window.dataLayer = window.dataLayer || [];
    }

    return window.dataLayer;
  }

  private pushDataLayer(data: object): void {
    this.dataLayer.push(data);
  }

  public setMainOptions(newOptions: MainTrackerOptions): void {
    super.setMainOptions(newOptions);

    this.pushDataLayer(newOptions);
    this.sendEvent("Options Changed", newOptions);
  }

  public initialize(): void {
    this.pushDataLayer(this.mainOptions);

    loadTagManager(this.options.trackingId);
    this.tagCalled = true;
  }

  public isInitialized(): boolean {
    return this.tagCalled;
  }

  public sendPageView(pageMeta: PageMeta): void {
    this.sendEvent("Page View", pageMeta);
  }

  public sendEvent(name: string, data: object = {}): void {
    this.dataLayer.push({
      event: name,
      data
    });
  }
}
