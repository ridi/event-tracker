import { Log } from "../../utils/log";
import { PageMeta } from "../base";

export interface BeaconLogRaw extends PageMeta {
  event: string;
  user_id: string;
  ruid: string;
  pvid: string;
  data: object;
}

export class BeaconLog implements Log {
  constructor(
    private log: BeaconLogRaw,
    private options: {
      beaconSrc: string;
    }
  ) {}

  private asURL(): string {
    const beaconSrc = this.options.beaconSrc;
    const queryString = Object.entries(this.log)
      .map(([key, value]) => {
        if (typeof value === "object") {
          value = JSON.stringify(value);
        } else {
          value = value.toString();
        }
        return [key, value].map(encodeURIComponent).join("=");
      })
      .join("&");

    return `${beaconSrc}?${queryString}`;
  }

  public send() {
    fetch(this.asURL());
  }
}
