import {DeviceType, Tracker} from "../index";
import {BeaconTracker, GATracker, KakaoTracker, PixelTracker, TagManagerTracker} from "../trackers";
import {loadKakao} from "../utils/externalServices";


const ALL_TRACKERS = [BeaconTracker, GATracker, PixelTracker, TagManagerTracker,KakaoTracker]
const originalFunctions = ALL_TRACKERS.map((tracker) =>tracker.prototype.sendPageView);

beforeAll( () => {
  KakaoTracker.prototype.initialize = () => {
    loadKakao();
    // @ts-ignore
    KakaoTracker.tagCalled = true;
  }
})
beforeEach(() => {
  document.body.innerHTML = "<script />";
  jest.useFakeTimers();
});

afterEach(() => {
    ALL_TRACKERS.map(
      (tracker, index) => {
        tracker.prototype.sendPageView = originalFunctions[index]
      }
    )
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
    kakaoOptions: {
      trackingId: "TEST"
    },
    ...additionalOptions
  });
};

it("BeaconTracker sends PageView event with serviceProps", () => {
  const dummpyPageMeta = {
    "device": "mobile",
    "href": "https://localhost/home?q=localhost&adult_exclude=true",
    "page": "home",
    "path": "/home",
    "query_params": {"adult_exclude": "true", "q": "localhost"},
    "referrer": "https://google.com/search?q=localhost"
  };

  [GATracker, PixelTracker, TagManagerTracker,KakaoTracker].map(
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
  const sendBeaconMock = jest.fn();
  // @ts-ignore
  BeaconTracker.prototype.sendBeacon = sendBeaconMock;
  t.sendPageView(href, referrer);

  jest.runOnlyPendingTimers();
  expect(sendBeaconMock).toHaveBeenCalledWith("pageView", dummpyPageMeta, {"prop1": "value1", "prop2": "value2"}, expect.any(Date));

});



it("sends PageView event with all tracking providers", () => {
  const mocks = ALL_TRACKERS.map(
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

  jest.runOnlyPendingTimers();
  mocks.forEach(mock => {
    expect(mock).toBeCalledTimes(1);
  });
});

it("sends events both before and after initialize", () => {
  const mocks = ALL_TRACKERS.map(
    tracker => {
      const mock = jest.fn();
      tracker.prototype.sendPageView = mock;
      return mock;
    }
  );
  const t = createDummyTracker();

  const href = "https://localhost/home";
  const referrer = "https://google.com/search?q=localhost";

  const href2 = "https://localhost/search?q=abc";
  const referrer2 = href;

  t.sendPageView(href, referrer);
  mocks.forEach(mock => {
    expect(mock).not.toBeCalled();
  });

  t.initialize();
  jest.runOnlyPendingTimers();
  t.sendPageView(href2, referrer2);
  jest.runOnlyPendingTimers();


  mocks.forEach(mock => {
    expect(mock).toHaveBeenNthCalledWith(1, {
      "device": "mobile",
      "href": "https://localhost/home",
      "page": "home",
      "path": "/home",
      "query_params": {},
      "referrer": "https://google.com/search?q=localhost"
    }, expect.any(Date))
    expect(mock).toHaveBeenNthCalledWith(2, {
      "device": "mobile",
      "href": "https://localhost/search?q=abc",
      "page": "search",
      "path": "/search",
      "query_params": {"q": "abc"},
      "referrer": "https://localhost/home"
    }, expect.any(Date))
  });
});

it("GATracker should send pageview event", () => {

  [BeaconTracker, PixelTracker, TagManagerTracker,KakaoTracker].map(
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

  jest.runOnlyPendingTimers();
  expect(ga).toHaveBeenCalledWith("set", "page", "/home?q=localhost&adult_exclude=true");

});

