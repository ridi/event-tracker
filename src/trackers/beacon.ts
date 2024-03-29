import URL from 'url-parse';

import { PVID, RUID } from '../uid';
import { UIDFactory } from '../uid/factory';
import { BaseTracker, PageMeta } from './base';

export interface BeaconOptions {
  beaconSrc?: string;
  use?: boolean;
}

export class BeaconTracker extends BaseTracker {
  constructor({
    beaconSrc = 'https://s3.ap-northeast-2.amazonaws.com/beacon-select/beacon_select.gif',
    use = true,
  }: BeaconOptions) {
    super();
    this.options = {
      beaconSrc,
      use,
    };
  }

  private options: BeaconOptions;

  private ruid: RUID;

  private pvid: PVID;

  private lastPageMeta: PageMeta;

  private makeBeaconURL(log: BeaconLog): string {
    const { beaconSrc } = this.options;
    const queryString = Object.entries(log)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else {
          value = String(value);
        }
        return [key, value].map(encodeURIComponent).join('=');
      })
      .join('&');

    return `${beaconSrc}?${queryString}`;
  }

  private sendBeacon(
    eventName: string,
    pageMeta: PageMeta,
    data: Record<string, unknown> = {},
    ts?: Date,
  ): void {
    if (ts == null) {
      ts = new Date();
    }
    const search = `?${URL.qs.stringify(pageMeta.query_params)}`;

    const log: BeaconLog = {
      event: eventName,
      user_id: this.mainOptions.userId,
      u_idx: this.mainOptions.uIdx,
      ruid: this.ruid.value,
      pvid: undefined,
      ...pageMeta,
      path: `${pageMeta.path}${search}`,
      data,
      ts: ts.getTime(),
    };

    void fetch(this.makeBeaconURL(log));
  }

  public async initialize(): Promise<void> {
    this.ruid = new UIDFactory(RUID).getOrCreate();
  }

  public isInitialized(): boolean {
    return !!this.ruid;
  }

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    this.pvid = new UIDFactory(PVID).create();
    this.sendBeacon(
      BeaconEventName.PageView,
      pageMeta,
      this.mainOptions.serviceProps,
      ts,
    );
    this.lastPageMeta = pageMeta;
  }

  public sendEvent(
    name: string,
    data: Record<string, unknown> = {},
    ts?: Date,
  ): void {
    if (this.lastPageMeta === undefined && window && document) {
      const url = new URL(window.location.href, window.location, true);

      const path = url.pathname;

      this.lastPageMeta = {
        page: path.split('/')[1] || 'index',
        device: this.mainOptions.deviceType,
        query_params: url.query,
        path,
        href: window.location.href,
        referrer: document.referrer,
      };
    }

    this.sendBeacon(name, this.lastPageMeta, data, ts);
  }

  public sendAddPaymentInfo(args?: Record<string, unknown>, ts?: Date): void {}

  public sendImpression(args?: Record<string, unknown>, ts?: Date): void {}

  public sendSignUp(args?: Record<string, unknown>, ts?: Date): void {}

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {}
}

enum BeaconEventName {
  PageView = 'pageView',
}
/* eslint-disable camelcase */
interface BeaconLog extends PageMeta {
  event: string;
  user_id: string;
  u_idx: number;
  ruid: string;
  pvid: string;
  data: Record<string, unknown>;
  ts: number;
}
/* eslint-enable camelcase */
