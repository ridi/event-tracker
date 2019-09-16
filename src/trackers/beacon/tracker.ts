import URL from "url-parse";
import { PVID, RUID } from "../../uid";
import { UIDFactory } from "../../uid/factory";
import { QueueManager } from "../../utils/queue";
import { BaseTracker, PageMeta } from "../base";
import { BeaconLog } from "./log";

export interface BeaconOptions {
  beaconSrc?: string;
  use?: boolean;
  queueSize?: number;
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
  private queueManager = new QueueManager<BeaconLog>(3, 5000);

  private ruid: RUID;
  private pvid: PVID;
  private lastPageMeta: PageMeta;

  private sendBeacon(eventName: string, pageMeta: PageMeta, data: object = {}) {
    const search = `?${URL.qs.stringify(pageMeta.query_params)}`;
    const log = new BeaconLog(
      {
        event: eventName,
        user_id: this.mainOptions.userId,
        ruid: this.ruid.value,
        pvid: this.pvid.value,
        ...pageMeta,
        path: `${pageMeta.path}${search}`,
        data
      },
      {
        beaconSrc: this.options.beaconSrc
      }
    );

    this.queueManager.enqueue(log);
  }

  public initialize(): void {
    this.ruid = new UIDFactory(RUID).getOrCreate();
  }

  public isInitialized(): boolean {
    return true;
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
