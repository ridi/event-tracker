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

  private tagCalled: boolean = false;

  public initialize(): void {
    const init = new Promise((resolve, reject) => {
      loadKakao();
      setTimeout(() => {
        resolve();
      }, 100);
    });
    init.then(() => {
      this.tagCalled = true;
    });

  }

  public isInitialized(): boolean {
    return this.tagCalled;
  }

  public sendPageView(pageMeta: PageMeta): void {
    kakaoPixel(this.options.trackingId).pageView();
  }

}
