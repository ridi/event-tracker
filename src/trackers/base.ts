import { DeviceType, MainTrackerOptions } from "../index";

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

  public abstract initialize(): void;

  public abstract sendPageView(pageMeta: PageMeta): void;
}
