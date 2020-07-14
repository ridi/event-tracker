import throttle from "lodash/throttle";
import URL from "url-parse";

import {
  BeaconOptions,
  BeaconTracker,
  GAOptions,
  GATracker,
  GTagOptions,
  GTagTracker,
  KakaoOptions,
  KakaoTracker,
  PixelOptions,
  PixelTracker,
  TagManagerOptions,
  TagManagerTracker,
  TwitterOptions,
  TwitterTracker
} from "./trackers";
import {BaseTracker, PageMeta} from "./trackers/base";

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
  throttleWait?: number;
  kakaoOptions?: KakaoOptions;
  twitterOptions?: TwitterOptions;
  isSelect?: boolean;
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

type QueueItem = PageViewQueueItem | EventQueueItem | { type: "impression" | "registration" };


export class Tracker {

  constructor(private options: MainTrackerOptions) {
    if (this.options.isSelect === undefined) {
      this.options.isSelect = false;
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

    if (options.kakaoOptions) {
      this.trackers.push(new KakaoTracker(options.kakaoOptions));
    }

    if (options.twitterOptions) {
      this.trackers.push(new TwitterTracker(options.twitterOptions));
    }


    for (const tracker of this.trackers) {
      tracker.setMainOptions(options);
    }


    this.throttledFlush = throttle(() => this.flush(), options.throttleWait || 1000);
  }

  private eventQueue: QueueItem[] = [];

  private initialized = false;

  private readonly throttledFlush: () => void;

  protected trackers: BaseTracker[] = [];

  private initializedTrackers(): BaseTracker[] {
    return this.trackers.filter(t => t.isInitialized());
  }

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
    if (this.options.debug) {
      console.log(`[@ridi/event-tracker] ${message}`);
    }
  }

  private logEvent(eventType: string, meta: object = {}): void {
    if (this.options.debug) {
      console.group(`[@ridi/event-tracker] Sending '${eventType}' event`);
      for (const [key, value] of Object.entries(meta)) {
        console.log(`${key}\t ${JSON.stringify(value)}`);
      }
      console.groupEnd();
    }
  }

  private count(key: string): void {
    if (this.options.debug) {
      document.body.dataset[key] = String(Number(document.body.dataset[key] || 0) + 1)
    }
  }

  private flush(): void {
    const queue = this.eventQueue;
    if (this.options.debug) {
      console.group("[@ridi/event-tracker] Flushing events...");
    }
    while (queue.length) {
      const item = queue.shift();

      switch (item.type) {
        case "pageview":
          this.doSendPageView(item as PageViewQueueItem);
          break;
        case "event":
          this.doSendEvent(item as EventQueueItem);
          break;
        case "registration":
          this.doSendRegistration();
          break;
        case "impression":
          this.doSendImpression();
          break;
      }
    }
    if (this.options.debug) {
      console.groupEnd();
    }
  }

  private doSendPageView(item: PageViewQueueItem): void {
    const pageMeta = this.getPageMeta(item.href, item.referrer);

    this.initializedTrackers().forEach(t => t.sendPageView(pageMeta, item.ts));

    this.logEvent("PageView", pageMeta);
    this.count("eventTrackerSent");
  }

  private doSendEvent(item: EventQueueItem): void {
    this.initializedTrackers().forEach(t => t.sendEvent(item.name, item.data, item.ts));

    this.logEvent(`Event:${item.name}`, item.data);
    this.count("eventTrackerSent");
  }

  private doSendImpression(): void {
    this.initializedTrackers().forEach(t => t.sendImpression());
    this.logEvent("Impression")
    this.count("eventTrackerSent");
  }

  private doSendRegistration(): void {
    this.initializedTrackers().forEach(t => t.sendRegistration());
    this.logEvent("Registration")
    this.count("eventTrackerSent");
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

  public async initialize(): Promise<void> {
    this.log("Initialize");

    await Promise.all(
      this.trackers
        .filter((t) => !t.isInitialized())
        .map((t) => t.initialize())
        .map((p) => p.catch(error => null))
    );

    if (!this.initialized) {
      this.flush();
      window.addEventListener("unload", (event) => {
        this.flush();
      });
      this.initialized = true;
    }

  }

  public sendPageView(href: string, referrer?: string): void {
    this.count("eventTrackerQueue");

    this.eventQueue.push({
      type: "pageview",
      ts: new Date(),
      href,
      referrer,
    });

    if (this.initialized) {
      this.throttledFlush();
    }
  }

  public sendEvent(name: string, data: any = {}): void {
    this.count("eventTrackerQueue");

    this.eventQueue.push({
      type: "event",
      ts: new Date(),
      name,
      data,
    });

    if (this.initialized) {
      this.throttledFlush();
    }
  }

  public sendImpression(): void {
    this.count("eventTrackerQueue");

    this.eventQueue.push({type: "impression"})

    if (this.initialized) {
      this.throttledFlush();
    }
  }

  public sendRegistration(): void {
    this.count("eventTrackerQueue");

    this.eventQueue.push({type: "registration"})

    if (this.initialized) {
      this.throttledFlush();
    }
  }
}


