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
import {BaseTracker, PageMeta, SendEvent} from "./trackers/base";

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
}

export interface ChangeableTrackerOptions {
  userId?: string;
  deviceType?: DeviceType;
  serviceProps?: ServiceProp;
}

type EventParameter = Parameters<SendEvent[keyof SendEvent]>;
type QueueItem = { consumerMethod: keyof SendEvent } & EventParameter;


function pushEventToQueue(consumerMethodName?: keyof SendEvent) {
  return (target: any, propertyKey: keyof SendEvent, descriptor: PropertyDescriptor) => {

    consumerMethodName = consumerMethodName || propertyKey

    const originalMethod = descriptor.value;

    descriptor.value = function () {
      const context = this
      const eventRecord:QueueItem = originalMethod.apply(context, arguments);

      eventRecord.consumerMethod = consumerMethodName;

      context.eventQueue.push(eventRecord)
      context.count("eventTrackerQueue")

      if (context.initialized) {
        context.throttledFlush();
      }
    }

    return descriptor;
  }
}

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
      const methodName = item.consumerMethod;
      delete item.consumerMethod;

      this.runTrackersMethod(methodName, item);

    }
    if (this.options.debug) {
      console.groupEnd();
    }
  }

  private runTrackersMethod(methodName: string, item: any): void {
    this.initializedTrackers().forEach(t => {
      const trackerMethod = (t as any)[methodName];
      const args = Object.values(item);
      trackerMethod.apply(t, args);

      this.logEvent(methodName, args);
      this.count("eventTrackerSent");
    });
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

  @pushEventToQueue()
  public sendPageView(href: string, referrer?: string): EventParameter {
    const pageMeta = this.getPageMeta(href, referrer);

    return [
      pageMeta,
      new Date(),
    ]

  }

  @pushEventToQueue()
  public sendEvent(name: string, data: any = {}): EventParameter {
    return [
      name,
      data,
      new Date(),
    ];
  }

  @pushEventToQueue()
  public sendStartSubscription(): EventParameter {
    return [];
  }

  @pushEventToQueue()
  public sendImpression(): EventParameter {
    return [];
  }

  @pushEventToQueue()
  public sendAddPaymentInfo(): EventParameter {
    return [];
  }

  @pushEventToQueue()
  public sendSignUp(): EventParameter {
    return [];

  }
}


