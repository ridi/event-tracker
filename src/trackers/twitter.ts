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
    this.validateOptions();
  }

  private twttr: any;

  private twq: (...command: any[]) => {};

  private registerTid: string;

  private validateOptions() {
    const booksId = this.options.booksRegisterTid;
    const selectId = this.options.selectRegisterTid;

    this.registerTid = this.options.booksRegisterTid || this.options.selectRegisterTid;

    const idEntered = !!(this.registerTid);
    const bothIdEntered = (booksId && selectId);

    if ( !idEntered || bothIdEntered) {
      throw new Error(`
      [@ridi/event-tracker] TwitterOption not provided properly.
      ${this.options}
      `);
    }


  }

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
    this.twttr.conversion.trackPid(this.registerTid, {tw_sale_amount: 0, tw_order_quantity: 0});
  }

  public sendImpression(args: object = {}): void {
    this.twttr.conversion.trackPid(this.options.productTrackingTid, {tw_sale_amount: 0, tw_order_quantity: 0})
  }
}

