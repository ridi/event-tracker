import {loadKakao} from "../utils/externalServices";
import {BaseTracker, PageMeta} from "./base";

declare var kakaoPixel:any;

export interface KakaoOptions {
  trackingId: string;
}

export class KakaoTracker extends BaseTracker {

  constructor(private options: KakaoOptions) {
    super();
  }
  private tagCalled:boolean = false;

  public initialize(): void {
    loadKakao()
    this.tagCalled = true

  }

  public isInitialized(): boolean {
    return this.tagCalled;
  }

  public sendPageView(pageMeta: PageMeta): void {
    kakaoPixel(this.options.trackingId).pageView();
  }

}
