import { loadGA } from "../utils/loadGA";
import { BaseTracker, PageMeta } from "./base";

export interface GAOptions {
  trackingId: string;
  fields?: UniversalAnalytics.FieldsObject;
}

export class GATracker extends BaseTracker {
  constructor(private options: GAOptions) {
    super();
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
    ga("send", "pageview", pageMeta.path, {
      dimension1: this.mainOptions.deviceType
    });
  }
}
