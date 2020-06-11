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

  private log(message: string): void {
    console.group(`[@ridi/event-tracker] ${message}`);
    console.groupEnd();
  }

  private log_event(eventType: string, meta: object = {}): void {
    if (!this.options.debug) {
      return;
    }
    console.group(`[@ridi/event-tracker] Sending '${eventType}' event`);
    for (const [key, value] of Object.entries(meta)) {
      console.log(`${key}\t ${JSON.stringify(value)}`);
    }
    console.groupEnd();
  }

  private flush(): void {
    this.log("Flushing events...");

    const queue = this.eventQueue;
    while(queue.length) {
      const item = queue.shift();
      switch (item.type) {
        case "pageview":
          this.doSendPageView(item as PageViewQueueItem);
          break;
        case "event":
          this.doSendEvent(item as EventQueueItem);
          break;
      }
    }
  }

  private doSendPageView(item: PageViewQueueItem): void {
    const pageMeta = this.getPageMeta(item.href, item.referrer);

    for (const tracker of this.trackers) {
      tracker.sendPageView(pageMeta, item.ts);
    }

    this.log_event("PageView", pageMeta);

  }

  private doSendEvent(item: EventQueueItem): void {
    this.log_event(`Event:${item.name}`, item.data);
    for (const tracker of this.trackers) {
      tracker.sendEvent(item.name, item.data, item.ts);
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
    this.log("Initialize");

    for (const tracker of this.trackers) {
      if (tracker.isInitialized()) {
        continue;
      }
      tracker.initialize();
    }

    this.flushAndWait();

    window.addEventListener("unload", (event) => {
      this.flush();
    })
  }

  private flushAndWait(): void {
    this.flush();
    setTimeout(() => {
      this.flushAndWait();
    }, 500);
  }

  public sendPageView(href: string, referrer?: string): void {
    this.eventQueue.push({
      type: "pageview",
      ts: new Date(),
      href,
      referrer,
    });
  }

  public sendEvent(name: string, data: any = {}): void {
    this.eventQueue.push({
      type: "event",
      ts: new Date(),
      name,
      data,
    });
  }
}

