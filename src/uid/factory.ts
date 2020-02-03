import Cookies from "js-cookie";
import now from "performance-now";
import { BaseUID } from "./base";


export class UIDFactory {
  constructor(protected UIDClass: typeof BaseUID) {}

  public getOrCreate(expires: number = 20 * 365): BaseUID {
    let uid = this.getFromCookies();
    if (!uid) {
      uid = this.create();
      this.setToCookies(uid.value, expires);
    }

    return uid;
  }

  public create(): BaseUID {
    let d = new Date().getTime() + now();

    const uidString = `xxxxxxxx-${
      this.UIDClass.type
    }-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, c => {
      // tslint:disable-next-line:no-bitwise
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);

      // tslint:disable-next-line:no-bitwise
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });

    return new this.UIDClass(uidString);
  }

  public setToCookies(value: string, expires: number): void {
    Cookies.set(this.UIDClass.type, value, {
      expires,
      path: "/",
      domain: ".ridibooks.com",
      sameSite: 'lax',
    });
  }

  public getFromCookies(): BaseUID | undefined {
    const uidString = Cookies.get(this.UIDClass.type);
    if (!uidString) {
      return undefined;
    }

    return new this.UIDClass(uidString);
  }
}
