import URL from 'url-parse';

import { PVID, RUID } from '../uid';
import { UIDFactory } from '../uid/factory';
import { BaseTracker, PageMeta } from './base';
import { PurchaseInfo } from '../ecommerce/models/transaction';
import { Item, Promotion } from '../ecommerce/models';
import { convertKeyToSnakeCase } from '../utils/util';

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
    this.options = { beaconSrc, use };
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

    data = convertKeyToSnakeCase(data);

    const search = `?${URL.qs.stringify(pageMeta.query_params)}`;

    const log: BeaconLog = {
      event: eventName,
      uid: this.mainOptions.uId,
      ruid: this.ruid.value,
      view_id: this.pvid.value,
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
    this.sendBeacon('PageView', pageMeta, this.mainOptions.serviceProps, ts);
    this.lastPageMeta = pageMeta;
  }

  public sendEvent(
    name: string,
    data: Record<string, any> = {},
    ts?: Date,
  ): void {
    if (this.lastPageMeta === undefined) {
      throw Error(
        '[@ridi/event-tracker] Please call sendPageView method first.',
      );
    }

    this.sendBeacon(name, this.lastPageMeta, data, ts);
  }

  public sendLogin(method: string, ts?: Date): void {
    this.sendEvent('Login', ts);
  }

  public sendImpression(items: Item[], ts?: Date): void {}

  public sendSignUp(method: string, ts?: Date): void {
    this.sendEvent('SignUp', { method }, ts);
  }

  public sendScreenView(
    screenName: string,
    previousScreenName: string,
    referrer?: string,
    ts?: Date,
  ): void {
    this.sendEvent(
      'ScreenView',
      { screenName, previousScreenName, referrer },
      ts,
    );
  }

  public sendAddPaymentInfo(
    paymentType: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void {
    this.sendEvent('AddPaymentInfo', { paymentType, ...purchaseInfo }, ts);
  }

  public sendBeginCheckout(purchaseInfo: PurchaseInfo, ts?: Date): void {
    this.sendEvent('BeginCheckout', { ...purchaseInfo }, ts);
  }

  public sendAddToPreference(items: Item[], ts?: Date): void {
    this.sendEvent('AddToPreference', { items }, ts);
  }

  public sendViewItem(items: Item[], ts?: Date): void {
    this.sendEvent('ViewItem', { items }, ts);
  }

  public sendViewContent(item: Item, ts?: Date): void {
    this.sendEvent('ViewContent', { item }, ts);
  }

  public sendAddToNewBookNotification(items: Item[], ts?: Date): void {
    this.sendEvent('AddToNewBookNotification', { items }, ts);
  }

  public sendPurchase(
    transactionId: string,
    purchaseInfo: PurchaseInfo,
    ts?: Date,
  ): void {
    this.sendEvent('Purchase', { transactionId, ...purchaseInfo }, ts);
  }

  public sendStartSubscription(
    args?: Record<string, unknown>,
    ts?: Date,
  ): void {}
}

/* eslint-disable camelcase */
interface BeaconLog extends PageMeta {
  readonly event: string;
  readonly uid: number;
  readonly ruid?: string;
  readonly view_id: string;
  readonly data: Record<string, any>;
  readonly ts: number;
}
/* eslint-enable camelcase */
