import {DeviceType, MainTrackerOptions} from "../index";

export interface PageMeta {
  page: string;
  device: DeviceType;
  query_params: { [key: string]: string | undefined };
  path: string;
  href: string;
  referrer: string;
}

export interface EventTracker {
  sendPageView(pageMeta: PageMeta, ts?: Date): void;

  sendEvent(name: string, data?: object, ts?: Date): void;

  sendSignUp(args?: object, ts?: Date): void;

  sendStartSubscription(args?: object, ts?:Date ): void;

  sendImpression(args?: object, ts?:Date): void;

  sendAddPaymentInfo(args?: object, ts?:Date): void;

}

export abstract class BaseTracker implements EventTracker {

  public mainOptions: MainTrackerOptions;

  // tslint:disable:no-empty

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
  }

  public sendEvent(name: string, data?: object, ts?: Date): void {
  }

  public sendSignUp(args?: object, ts?:Date): void {
  }

  public sendImpression(args?: object, ts?:Date): void {
  }

  public sendStartSubscription(args?: object, ts?:Date): void {
  }

  public sendAddPaymentInfo(args?: object, ts?:Date): void {
  }

  // tslint:enable:no-empty

  public abstract isInitialized(): boolean;

  public async abstract initialize(): Promise<void>;

  public setMainOptions(newOptions: MainTrackerOptions): void {
    this.mainOptions = newOptions;
  }


}
