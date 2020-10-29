import throttle from 'lodash/throttle';
import URL from 'url-parse';

import {
  BeaconOptions,
  BeaconTracker,
  EcommerceTracker,
  GAOptions,
  GATracker,
  GTagOptions,
  GTagTracker,
  Item,
  KakaoOptions,
  KakaoTracker,
  PixelOptions,
  PixelTracker,
  TagManagerOptions,
  TagManagerTracker,
  TwitterOptions,
  TwitterTracker,
} from './trackers';
import { BaseTracker, EventTracker, PageMeta } from './trackers/base';
import { PurchaseInfo } from './ecommerce/models/transaction';

export enum DeviceType {
  PC = 'pc',
  Mobile = 'mobile',
  Paper = 'paper',
}

export type ServiceProp = Record<string, string>;

export interface MainTrackerOptions {
  debug?: boolean;
  development?: boolean;
  uId?: number;
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

type ChangeableTrackerOptions = Pick<
  MainTrackerOptions,
  'uId' | 'deviceType' | 'serviceProps'
>;

type EventParameters =
  | Parameters<EventTracker[keyof EventTracker]>
  | Parameters<EcommerceTracker[keyof EcommerceTracker]>;

export type EventTrackerMethodNames =
  | keyof EventTracker
  | keyof EcommerceTracker;

interface QueueItem {
  consumerMethodName: EventTrackerMethodNames;
  eventParams: EventParameters;
  ts: Date;
}

function pushEventToQueue<T extends EventTrackerMethodNames>(
  consumerMethodName?: T,
) {
  return (target: any, propertyKey: T, descriptor: PropertyDescriptor) => {
    consumerMethodName = consumerMethodName || propertyKey;

    const originalMethod = descriptor.value;

    const newMethod = function() {
      const eventParams: EventParameters = originalMethod.apply(
        this,
        arguments,
      );
      const eventRecord: QueueItem = {
        eventParams,
        consumerMethodName,
        ts: new Date(),
      };

      this.eventQueue.push(eventRecord);
      this.count('eventTrackerQueue');

      if (this.initialized) {
        this.throttledFlush();
      }
    };
    descriptor.value = newMethod;

    return descriptor;
  };
}

export class Tracker {
  protected trackers: BaseTracker[] = [];

  private eventQueue: QueueItem[] = [];

  private initialized = false;

  private readonly throttledFlush: () => void;

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

    this.trackers.forEach(t => {
      t.setMainOptions(options);
    });

    this.throttledFlush = throttle(
      () => this.flush(),
      options.throttleWait || 1000,
    );
  }

  public set(options: ChangeableTrackerOptions): void {
    this.options = {
      ...this.options,
      ...options,
    };

    this.trackers.forEach(t => t.setMainOptions(this.options));
  }

  public async initialize(): Promise<void> {
    this.log('Initialize');

    await Promise.all(
      this.trackers
        .filter(t => !t.isInitialized())
        .map(t => t.initialize())
        .map(p => p.catch(error => null)),
    );

    if (!this.initialized) {
      this.flush();
      window.addEventListener('unload', event => {
        this.flush();
      });
      this.initialized = true;
    }
  }

  @pushEventToQueue()
  public sendEvent(name: string, data: any = {}): EventParameters {
    return [name, data];
  }

  @pushEventToQueue()
  public sendPageView(href: string, referrer?: string): EventParameters {
    return [this.getPageMeta(href, referrer)];
  }

  @pushEventToQueue()
  public sendScreenView(
    screenName: string,
    previousScreenName: string,
    referrer?: string,
  ): EventParameters {
    return [screenName, previousScreenName, referrer];
  }

  @pushEventToQueue()
  public sendSignUp(method: string): EventParameters {
    return [method];
  }

  @pushEventToQueue()
  public sendLogin(method: string): EventParameters {
    return [method];
  }

  @pushEventToQueue()
  public sendBeginCheckout(purchaseInfo: PurchaseInfo): EventParameters {
    return [purchaseInfo];
  }

  @pushEventToQueue()
  public sendAddPaymentInfo(
    paymentType: string,
    purchaseInfo: PurchaseInfo,
  ): EventParameters {
    return [paymentType, purchaseInfo];
  }

  @pushEventToQueue()
  public sendPurchase(
    transactionId: string,
    purchaseInfo: PurchaseInfo,
  ): EventParameters {
    return [transactionId, purchaseInfo];
  }

  @pushEventToQueue()
  public sendViewItem(items: Item[], ts?: Date): EventParameters {
    return [items];
  }

  @pushEventToQueue()
  public sendViewContent(item: Item, ts?: Date): EventParameters {
    return [item];
  }

  @pushEventToQueue()
  public sendStartSubscription(): EventParameters {
    return [];
  }

  @pushEventToQueue()
  public sendImpression(items: Item[]): EventParameters {
    return [items];
  }

  private initializedTrackers(): BaseTracker[] {
    return this.trackers.filter(t => t.isInitialized());
  }

  private getPageMeta(href: string, referrer = ''): PageMeta {
    const url = new URL(href, {}, true);

    const path = url.pathname;

    return {
      page: url.pathname.split('/')[1] || 'index',
      device: this.options.deviceType,
      query_params: url.query,
      path,
      href,
      referrer,
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
      Object.entries(meta).forEach(([key, value]) => {
        console.log(`${key}\t ${JSON.stringify(value)}`);
      });
      console.groupEnd();
    }
  }

  private count(key: string): void {
    if (this.options.debug) {
      document.body.dataset[key] = String(
        Number(document.body.dataset[key] || 0) + 1,
      );
    }
  }

  private flush(): void {
    const queue = this.eventQueue;
    if (this.options.debug) {
      console.group('[@ridi/event-tracker] Flushing events...');
    }
    while (queue.length) {
      const item = queue.shift();

      this.runTrackersMethod(item);
    }
    if (this.options.debug) {
      console.groupEnd();
    }
  }

  private runTrackersMethod(item: QueueItem): void {
    item.eventParams.push(item.ts);

    this.initializedTrackers().forEach(t => {
      const trackerMethod = t[item.consumerMethodName];
      const args = Object.values(item.eventParams);

      trackerMethod.apply(t, args);

      this.logEvent(item.consumerMethodName, args);
      this.count('eventTrackerSent');
    });
  }
}
