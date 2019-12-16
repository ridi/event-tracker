import URL from "url-parse";

import { PVID, RUID } from "../uid";
import { UIDFactory } from "../uid/factory";
import { BaseTracker, PageMeta } from "./base";

export interface BeaconOptions {
  beaconSrc?: string;
  use?: boolean;
}

export class BeaconTracker extends BaseTracker {
  constructor({
    beaconSrc = "https://s3.ap-northeast-2.amazonaws.com/beacon-select/beacon_select.gif",
    use = true
  }: BeaconOptions) {
    super();
    this.options = {
      beaconSrc,
      use
    };
  }
  private options: BeaconOptions;

  private ruid: RUID;
  private pvid: PVID;
  private lastPageMeta: PageMeta;

  private makeBeaconURL(log: BeaconLog): string {
    const beaconSrc = this.options.beaconSrc;
    const queryString = Object.entries(log)
      .map(([key, value]) => {
        if (typeof value === "object") {
          value = JSON.stringify(value);
        } else {
          value = value.toString();
        }
        return [key, value].map(encodeURIComponent).join("=");
      })
      .join("&");

    return `${beaconSrc}?${queryString}`;
  }

  private sendBeacon(eventName: string, pageMeta: PageMeta, data: object = {}) {
    const search = `?${URL.qs.stringify(pageMeta.query_params)}`;

    const log: BeaconLog = {
      event: eventName,
      user_id: this.mainOptions.userId,
      u_id: this.mainOptions.userId,
      ruid: this.ruid.value,
      pvid: this.pvid.value,
      ...pageMeta,
      path: `${pageMeta.path}${search}`,
      data
    };

    fetch(this.makeBeaconURL(log));
  }

  public initialize(): void {
    this.ruid = new UIDFactory(RUID).getOrCreate();
  }

  public isInitialized(): boolean {
    return !!this.ruid;
  }

  public sendPageView(pageMeta: PageMeta): void {
    this.pvid = new UIDFactory(PVID).create();
    this.sendBeacon(BeaconEventName.PageView, pageMeta);
    this.lastPageMeta = pageMeta;
  }

  public sendEvent(name: string, data: object = {}): void {
    if (this.lastPageMeta === undefined) {
      throw Error(
        "[@ridi/event-tracker] Please call sendPageView method first."
      );
    }

    this.sendBeacon(name, this.lastPageMeta, data);
  }
}

enum BeaconEventName {
  PageView = "pageView"
}

interface BeaconLog extends PageMeta {
  event: string;
  user_id: string;
  u_id: string;
  ruid: string;
  pvid: string;
  data: object;
}
