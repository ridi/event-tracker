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

  private eventQueue: QueueItem[] = [];

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

    this.flush();

    setTimeout(() => {
      this.flush();
    }, 500);

    window.addEventListener("unload", (event) => {
      this.flush();
    })
  }

  private flush(): void {
    const queue = this.eventQueue;
    while(queue.length) {
      const item = queue.shift();
      switch (item.type) {
        case "pageview":
          this.doSendPageView(<PageViewQueueItem> item);
          break;
        case "event":
          this.doSendEvent(<EventQueueItem> item);
          break;
      }
    }
  }

  public sendPageView(href: string, referrer?: string): void {
    this.eventQueue.push({
      type: "pageview",
      ts: new Date(),
      href,
      referrer,
    });
  }

  private doSendPageView(item: PageViewQueueItem): void {
    const pageMeta = this.getPageMeta(item.href, item.referrer);

    for (const tracker of this.trackers) {
      tracker.sendPageView(pageMeta, item.ts);
    }

    this.log("PageView", pageMeta);

  }

  public sendEvent(name: string, data: any = {}): void {
    this.eventQueue.push({
      type: "event",
      ts: new Date(),
      name,
      data,
    });
  }

  private doSendEvent(item: EventQueueItem): void {
    this.log(`Event:${item.name}`, item.data);
    for (const tracker of this.trackers) {
      tracker.sendEvent(item.name, item.data, item.ts);
    }

  }
}

