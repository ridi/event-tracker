import {DeviceType, MainTrackerOptions} from "../index";

export interface PageMeta {
  page: string;
  device: DeviceType;
  query_params: { [key: string]: string | undefined };
  path: string;
  href: string;
  referrer: string;
}

export interface SendEvent {
  sendPageView(pageMeta: PageMeta, ts?: Date): void;

  sendEvent(name: string, data?: object, ts?: Date): void;

  sendRegistration(args?: object): void;

  sendImpression(args?: object): void;
}

export abstract class BaseTracker implements SendEvent {

  public mainOptions: MainTrackerOptions;

  // tslint:disable:no-empty

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {

  }

  public sendEvent(name: string, data?: object, ts?: Date): void {

  }

  public sendRegistration(args?: object): void {

  }

  public sendImpression(args?: object): void {

  }

  // tslint:enable:no-empty

  public abstract isInitialized(): boolean;

  public async abstract initialize(): Promise<void>;

  public setMainOptions(newOptions: MainTrackerOptions): void {
    this.mainOptions = newOptions;
  }

}
