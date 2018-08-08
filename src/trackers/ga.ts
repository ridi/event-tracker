import { loadGA } from "../utils/loadGA";
import { BaseTracker, PageMeta } from "./base";

export interface GAOptions {
  trackingId: string;
  pathPrefix?: string;
  fields?: UniversalAnalytics.FieldsObject;
}

export class GATracker extends BaseTracker {
  constructor(private options: GAOptions) {
    super();
  }

  private refinePath(originalPath: string): string {
    const refiners: Array<(path: string) => string> = [
      path => (this.options.pathPrefix ? this.options.pathPrefix + path : path)
    ];

    return refiners.reduce((value, refiner) => {
      return refiner(value);
    }, originalPath);
  }

  public initialize(): void {
    loadGA();
    if (this.options.fields) {
      ga("create", this.options.trackingId, this.options.fields);
    } else {
      ga("create", this.options.trackingId, "auto");
    }
  }

  public isInitialized(): boolean {
    return typeof ga === "function";
  }

  public sendPageView(pageMeta: PageMeta): void {
    const refinedPath = this.refinePath(pageMeta.path);

    ga("send", "pageview", refinedPath, {
      dimension1: this.mainOptions.deviceType
    });
  }
}
