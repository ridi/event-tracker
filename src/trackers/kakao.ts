import {BaseTracker, PageMeta} from "./base";
import {loadKakao} from "../utils/externalServices";

declare var kakaoPixel:any;

export interface KakaoOptions {
  trackingId: string;
}

export class KakaoTracker extends BaseTracker {
  private client:any;

  constructor(private options: KakaoOptions) {
    super();
  }

  initialize(): void {
    loadKakao()
    this.client = kakaoPixel(this.options.trackingId);

  }

  isInitialized(): boolean {
    return !!this.client;
  }

  sendPageView(pageMeta: PageMeta): void {
    this.client.pageView();
  }
}
