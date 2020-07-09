import {DeviceType, MainTrackerOptions} from "../index";

export interface PageMeta {
  page: string;
  device: DeviceType;
  query_params: { [key: string]: string | undefined };
  path: string;
  href: string;
  referrer: string;
}

export abstract class BaseTracker {

  public mainOptions: MainTrackerOptions;

  public abstract isInitialized(): boolean;

  public async abstract initialize(): Promise<void>;

  public setMainOptions(newOptions: MainTrackerOptions): void {
    this.mainOptions = newOptions;
  }

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    // Default behavior
  }

  public sendEvent(name: string, data: object = {}, ts?: Date): void {
    // Default behavior
  }

  public registration(args: object = {}): void {
    // Default behavior
  }

  public impression(args: object = {}): void {
    // Default behavior
  }
}
