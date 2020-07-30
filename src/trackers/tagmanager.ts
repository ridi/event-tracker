import {MainTrackerOptions} from "..";

import {loadTagManager} from "../utils/externalServices";
import {BaseTracker, PageMeta} from "./base";

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

  public async initialize(): Promise<void> {
    this.pushDataLayer(this.mainOptions);
    await loadTagManager(this.options.trackingId);
    this.tagCalled = true;

  }

  public isInitialized(): boolean {
    return this.tagCalled;
  }

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    this.sendEvent("Page View", pageMeta);
  }

  public sendEvent(name: string, data: object = {}, ts?: Date): void {
    this.dataLayer.push({
      event: name,
      data
    });
  }
}
