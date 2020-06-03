import {DeviceType, Tracker} from "../index";
import {BeaconTracker, GATracker, PixelTracker, TagManagerTracker} from "../trackers";

beforeAll(() => {
  document.body.innerHTML = "<script />";
});


const createDummyTracker = (additionalOptions: object = {}) => {
  return new Tracker({
    deviceType: DeviceType.Mobile,
    serviceProps: {
      "prop1": "value1",
      "prop2": "value2"
    },
    beaconOptions: {
      use: true
    },
    gaOptions: {
      trackingId: "TEST"
    },
    pixelOptions: {
      pixelId: "TEST"
    },
    tagManagerOptions: {
      trackingId: "TEST"
    },
    ...additionalOptions
  });
};

// TODO: fix this test works.
//  For now, we need to
//    1) make BeaconTacker.sendBeacon as public method
//    2) comment out "GATracker should send pageview event" Test
//  temporarily to pass this test.
// it("BeaconTracker sends PageView event with serviceProps", () => {
//   const dummpyPageMeta = {
//     "device": "mobile",
//     "href": "https://localhost/home?q=localhost&adult_exclude=true",
//     "page": "home",
//     "path": "/home",
//     "query_params": {"adult_exclude": "true", "q": "localhost"},
//     "referrer": "https://google.com/search?q=localhost"
//   };
//
//   [GATracker, PixelTracker, TagManagerTracker].map(
//     tracker => {
//       const mock = jest.fn();
//       tracker.prototype.sendPageView = mock;
//       return mock;
//     }
//   );
//
//   const t = createDummyTracker();
//
//   const href = "https://localhost/home?q=localhost&adult_exclude=true";
//   const referrer = "https://google.com/search?q=localhost";
//
//   t.initialize();
//   const sendBeaconMock = jest.fn();
//   BeaconTracker.prototype.sendBeacon = sendBeaconMock;
//   t.sendPageView(href, referrer);
//
//   expect(sendBeaconMock).toHaveBeenCalledWith("pageView", dummpyPageMeta, {"prop1": "value1", "prop2": "value2"});
// });

it("GATracker should send pageview event", () => {

  [BeaconTracker, PixelTracker, TagManagerTracker].map(
    tracker => {
      const mock = jest.fn();
      tracker.prototype.sendPageView = mock;
      return mock;
    }
  );

  const t = createDummyTracker();

  const href = "https://localhost/home?q=localhost&adult_exclude=true";
  const referrer = "https://google.com/search?q=localhost";

  t.initialize();
  ga = jest.fn() as unknown as UniversalAnalytics.ga;
  t.sendPageView(href, referrer);

  expect(ga).toHaveBeenCalledWith("set", "page", "/home?q=localhost&adult_exclude=true");

});

it("sends PageView event with all tracking providers", () => {
  const mocks = [BeaconTracker, GATracker, PixelTracker, TagManagerTracker].map(
    tracker => {
      const mock = jest.fn();
      tracker.prototype.sendPageView = mock;
      return mock;
    }
  );
  const t = createDummyTracker();

  const href = "https://localhost/home";
  const referrer = "https://google.com/search?q=localhost";

  t.initialize();
  t.sendPageView(href, referrer);

  mocks.forEach(mock => {
    expect(mock).toBeCalledTimes(1);
  });
});


it("throws if initialize have not been called before sending any events ", () => {
  const t = createDummyTracker();

  expect(() => {
    t.sendPageView("href");
  }).toThrowError("this.initialize must be called first");
});
