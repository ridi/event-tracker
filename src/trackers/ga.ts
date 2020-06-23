import {loadGA} from "../utils/externalServices";
import {BaseTracker, PageMeta} from "./base";

interface GAFields extends UniversalAnalytics.FieldsObject {
  allowAdFeatures?: boolean;
}

export interface GAOptions {
  trackingId: string;
  pathPrefix?: string;
  fields?: GAFields;
}

export class GATracker extends BaseTracker {
  constructor(private options: GAOptions) {
    super();
  }

  private refinePath(originalPath: string): string {
    const refiners: Array<(path: string) => string> = [
      path => (this.options.pathPrefix ? this.options.pathPrefix + path : path),

      // Pathname in some browsers doesn't start with slash character (/)
      // Ref: https://app.asana.com/0/inbox/463186034180509/765912307342230/766156873493449
      path => (path.startsWith("/") ? path : `/${path}`)
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

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    const refinedPath = this.refinePath(pageMeta.path);
    const queryString = pageMeta.href.split("?")[1] || "";

    const pageName = `${refinedPath}?${queryString}`;

    ga("set", "page", pageName);

    const fields: UniversalAnalytics.FieldsObject = {
      hitType: "pageview",
      dimension1: this.mainOptions.deviceType
    };
    if (ts) {
      fields.queueTime = Math.max(Date.now() - ts.getTime(), 0);
    }
    ga("send", fields);
  }

  public sendEvent(name: string, data: { [k: string]: any }, ts?: Date): void {
    const fields: UniversalAnalytics.FieldsObject = {
      hitType: "event",
      eventCategory: data.category || "All",
      eventAction: data.action || name,
      eventLabel: data.label || "All"
    };
    if (ts) {
      fields.queueTime = Math.max(Date.now() - ts.getTime(), 0);
    }
    ga("send", fields);
  }
}
