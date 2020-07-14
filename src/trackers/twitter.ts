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

  private twttr: any;

  private twq: (...command: any[]) => {};

  public async initialize(): Promise<void> {
    await Promise.all([loadTwitterUniversal(), loadTwitterTag()]);
    this.twq = twq
    this.twttr = twttr;
    this.twq("init", this.options.mainTid);

  }

  public isInitialized(): boolean {
    return typeof this.twq === "function" && typeof this.twttr === "object";
  }

  public sendPageView(pageMeta: PageMeta): void {
    this.twq("track", "pageView");
  }

  public sendRegistration(args: object = {}): void {
    const id = (this.mainOptions.isSelect) ? this.options.selectRegisterTid : this.options.booksRegisterTid;
    this.twttr.conversion.trackPid(id, {tw_sale_amount: 0, tw_order_quantity: 0});
  }

  public sendImpression(args: object = {}): void {
    this.twttr.conversion.trackPid(this.options.productTrackingTid, {tw_sale_amount: 0, tw_order_quantity: 0})
  }
}

