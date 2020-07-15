import {loadKakao} from "../utils/externalServices";
import {BaseTracker, PageMeta} from "./base";

declare var kakaoPixel: any;

export interface KakaoOptions {
  trackingId: string;
}

export class KakaoTracker extends BaseTracker {

  constructor(private options: KakaoOptions) {
    super();
  }

  private tracker: any;

  public async initialize(): Promise<void> {
    await loadKakao();
    this.tracker = kakaoPixel(this.options.trackingId)
  }

  public isInitialized(): boolean {
    return typeof this.tracker === "object";
  }

  public sendPageView(pageMeta: PageMeta): void {
    this.tracker.pageView();
  }

  public sendSignUp(args: object = {}): void {
    this.tracker.completeRegistration();
  }

  public sendStartSubscription(args?: object): void {
    this.tracker.signUp();
  }

  public sendImpression(args: object = {}): void {
    this.tracker.viewContent();
  }


}
