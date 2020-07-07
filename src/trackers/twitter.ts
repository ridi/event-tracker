import {loadTwitterTag, loadTwitterUniversal} from "../utils/externalServices";
import {BaseTracker, PageMeta} from "./base";

declare var twq: any;
declare var twttr: any;


export interface TwitterOptions {
  mainTid: string;
  booksRegisterTid?: string;
  selectRegisterTid?: string;
  productTrackingTid: string;
}

export class TwitterTracker extends BaseTracker {

  constructor(private options: TwitterOptions) {
    super();
  }

  public async initialize(): Promise<void> {
    await Promise.all([loadTwitterUniversal(), loadTwitterTag()]);
    twq("init", this.options.mainTid);
  }

  public isInitialized(): boolean {
    return typeof twq === "function" && typeof twttr === "function";
  }

  public sendPageView(pageMeta: PageMeta): void {
    twq("track", "pageView");
  }

  public registration(args: object = {}): void {
    const id = (this.mainOptions.isSelect) ? this.options.selectRegisterTid : this.options.booksRegisterTid;
    twttr.conversion.trackPid(id, {tw_sale_amount: 0, tw_order_quantity: 0});
  }

  public impression(args: object = {}): void {
    twttr.conversion.trackPid(this.options.productTrackingTid, {tw_sale_amount: 0, tw_order_quantity: 0})
  }
}

