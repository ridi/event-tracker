import URL from "url-parse";

import {
  BeaconOptions,
  BeaconTracker,
  GAOptions,
  GATracker,
  GTagOptions,
  GTagTracker,
  PixelOptions,
  PixelTracker,
  TagManagerOptions,
  TagManagerTracker
} from "./trackers";
import { BaseTracker, PageMeta } from "./trackers/base";

export enum DeviceType {
  PC = "pc",
  Mobile = "mobile",
  Paper = "paper"
}

export type ServiceProp = Record<string, string>

export interface MainTrackerOptions {
  debug?: boolean;
  development?: boolean;
  queueWhenUninitialized?: boolean;
  userId?: string;
  deviceType: DeviceType;
  serviceProps?: ServiceProp;
  gaOptions?: GAOptions;
  beaconOptions?: BeaconOptions;
  pixelOptions?: PixelOptions;
  tagManagerOptions?: TagManagerOptions;
  gTagOptions?: GTagOptions;
}

export interface ChangeableTrackerOptions {
  userId?: string;
  deviceType?: DeviceType;
  serviceProps?: ServiceProp;
}

interface PageViewQueueItem {
  type: "pageview";
  ts: Date;
  href: string;
  referrer?: string;
}

interface EventQueueItem {
  type: "event";
  ts: Date;
  name: string;
  data: any;
}

type QueueItem = PageViewQueueItem | EventQueueItem;

export class Tracker {
  constructor(private options: MainTrackerOptions) {
    if (options.queueWhenUninitialized) {
      this.eventQueue = [];
    } else {
      this.eventQueue = null;
    }

    if (options.gaOptions) {
      this.trackers.push(new GATracker(options.gaOptions));
    }
    if (options.beaconOptions && options.beaconOptions.use !== false) {
      this.trackers.push(new BeaconTracker(options.beaconOptions));
    }
    if (options.pixelOptions) {
      this.trackers.push(new PixelTracker(options.pixelOptions));
    }
    if (options.tagManagerOptions) {
      this.trackers.push(new TagManagerTracker(options.tagManagerOptions));
    }
    if (options.gTagOptions) {
      this.trackers.push(new GTagTracker(options.gTagOptions));
    }

    for (const tracker of this.trackers) {
      tracker.setMainOptions(options);
    }
  }

  private trackers: BaseTracker[] = [];

  private eventQueue: QueueItem[] | null;

  private getPageMeta(href: string, referrer: string = ""): PageMeta {
    const url = new URL(href, {}, true);

    const path = url.pathname;

    return {
      page: url.pathname.split("/")[1] || "index",
      device: this.options.deviceType,
      query_params: url.query,
      path,
      href,
      referrer
    };
  }

  private log(eventType: string, meta: object = {}): void {
    if (!this.options.debug) {
      return;
    }
    meta = {
      ...this.options,
      ...meta
    };

    console.group(`[@ridi/event-tracker] Sending '${eventType}' event`);
    for (const [key, value] of Object.entries(meta)) {
      console.log(`${key}\t ${JSON.stringify(value)}`);
    }
    console.groupEnd();
  }

  private throwIfInitializeIsNotCalled(): void {
    if (this.trackers.some(tracker => !tracker.isInitialized())) {
      throw Error(
        "[@ridi/event-tracker] this.initialize must be called first."
      );
    }
  }

  public set(options: ChangeableTrackerOptions): void {
    this.options = {
      ...this.options,
      ...options
    };

    for (const tracker of this.trackers) {
      tracker.setMainOptions(this.options);
    }
  }

  public initialize(): void {
    for (const tracker of this.trackers) {
      if (tracker.isInitialized()) {
        continue;
      }
      tracker.initialize();
    }

    this.log("Initialize");

    if (this.eventQueue) {
      const queue = this.eventQueue;
      this.eventQueue = null;
      for (const item of queue) {
        switch (item.type) {
          case "pageview":
            this.sendPageView(item.href, item.referrer, item.ts);
            break;
          case "event":
            this.sendEvent(item.name, item.data, item.ts);
            break;
        }
      }
    }
  }

  public sendPageView(href: string, referrer?: string, ts?: Date): void {
    if (this.eventQueue) {
      this.eventQueue.push({
        type: "pageview",
        ts: ts || new Date(),
        href,
        referrer,
      });
      return;
    }

    this.throwIfInitializeIsNotCalled();

    const pageMeta = this.getPageMeta(href, referrer);

    for (const tracker of this.trackers) {
      tracker.sendPageView(pageMeta, ts);
    }

    this.log("PageView", pageMeta);
  }

  public sendEvent(name: string, data: any = {}, ts?: Date) {
    if (this.eventQueue) {
      this.eventQueue.push({
        type: "event",
        ts: ts || new Date(),
        name,
        data,
      });
    }

    this.throwIfInitializeIsNotCalled();

    for (const tracker of this.trackers) {
      tracker.sendEvent(name, data, ts);
    }

    this.log(`Event:${name}`, data);
  }
}
