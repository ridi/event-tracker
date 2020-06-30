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

  public async initialize(): Promise<void> {
    await loadKakao();
  }

  public isInitialized(): boolean {
    return typeof kakaoPixel === "function";
  }

  public sendPageView(pageMeta: PageMeta): void {
    kakaoPixel(this.options.trackingId).pageView(pageMeta.page);
  }

}
