import { RUID } from "../uid";
import { UIDFactory } from "../uid/factory";
import { BaseTracker, PageMeta } from "./base";

export interface BeaconOptions {
  beaconSrc?: string;
}

export class BeaconTracker extends BaseTracker {
  constructor(
    private options: BeaconOptions = {
      beaconSrc:
        "https://s3.ap-northeast-2.amazonaws.com/beacon-select/beacon_select.gif"
    }
  ) {
    super();
  }

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

  private sendEvent(eventName: BeaconEventName, pageMeta: PageMeta) {
    const ruid = new UIDFactory(RUID).getOrCreate();

    const log: BeaconLog = {
      event: eventName,
      user_id: this.mainOptions.userId,
      ruid: ruid.value,
      ...pageMeta
    };

    fetch(this.makeBeaconURL(log));
  }

  public initialize(): void {
    // Make some noise
  }

  public isInitialized(): boolean {
    return true;
  }

  public sendPageView(pageMeta: PageMeta): void {
    this.sendEvent(BeaconEventName.PageView, pageMeta);
  }
}

enum BeaconEventName {
  PageView = "pageView"
}

interface BeaconLog extends PageMeta {
  event: BeaconEventName;
  user_id: string;
  ruid: string;
}
