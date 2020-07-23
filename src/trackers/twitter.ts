import {loadTwitterTag, loadTwitterUniversal} from "../utils/externalServices";
import {BaseTracker, PageMeta} from "./base";

declare var twq: any;
declare var twttr: any;


export interface TwitterOptions {
  mainPid: string;
  booksSignUpPid?: string;
  selectStartSubscriptionPid?: string;
  impressionPid: string;
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
    this.twq("init", this.options.mainPid);
  }

  public isInitialized(): boolean {
    return typeof this.twq === "function" && typeof this.twttr === "object";
  }

  public sendPageView(pageMeta: PageMeta, ts?: Date): void {
    this.twq("track", "pageView");
  }

  public sendSignUp(args: object = {}, ts?: Date): void {
    this.twttr.conversion.trackPid(this.options.booksSignUpPid, {tw_sale_amount: 0, tw_order_quantity: 0});
  }

  public sendStartSubscription(args?: object, ts?: Date): void {
    this.twttr.conversion.trackPid(this.options.selectStartSubscriptionPid, {tw_sale_amount: 0, tw_order_quantity: 0});
  }

  public sendImpression(args: object = {}, ts?: Date): void {
    this.twttr.conversion.trackPid(this.options.impressionPid, {tw_sale_amount: 0, tw_order_quantity: 0})
  }

  public abcd(args?:unknown): void {
    this.sendImpression(new Date())
  }
}

