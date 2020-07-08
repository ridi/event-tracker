import {DeviceType, Tracker} from "../index";
import {BeaconTracker, GATracker, KakaoTracker, PixelTracker, TagManagerTracker, TwitterTracker} from "../trackers";


const ALL_TRACKERS = [BeaconTracker, GATracker, PixelTracker, TagManagerTracker, KakaoTracker, TwitterTracker];
const originalFunctions = ALL_TRACKERS.map((tracker) => tracker.prototype.sendPageView);


beforeAll(() => {
  ALL_TRACKERS.forEach((t) => t.prototype.isInitialized = () => true);
})

beforeEach(() => {
  document.body.innerHTML = "<script />";
  jest.useFakeTimers();
});

afterEach(() => {
  ALL_TRACKERS.forEach((t, i) => {
    t.prototype.sendPageView = originalFunctions[i];
  });
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
    twitterOptions: {
      mainTid: "TEST",
      productTrackingTid: "TEST",
      booksRegisterTid: "TEST",
    },
    ...additionalOptions
  });
};

it("BeaconTracker sends PageView event with serviceProps", async () => {
  const dummpyPageMeta = {
    "device": "mobile",
    "href": "https://localhost/home?q=localhost&adult_exclude=true",
    "page": "home",
    "path": "/home",
    "query_params": {"adult_exclude": "true", "q": "localhost"},
    "referrer": "https://google.com/search?q=localhost"
  };

  [GATracker, PixelTracker, TagManagerTracker, KakaoTracker, TwitterTracker].forEach(
    tracker => {
      const mock = jest.fn();
      tracker.prototype.sendPageView = mock;
      return mock;
    }
  );

  const t = createDummyTracker();

  const href = "https://localhost/home?q=localhost&adult_exclude=true";
  const referrer = "https://google.com/search?q=localhost";
  await t.initialize();

  const sendBeaconMock = jest.fn();
  // @ts-ignore
  BeaconTracker.prototype.sendBeacon = sendBeaconMock;
  t.sendPageView(href, referrer);

  jest.runOnlyPendingTimers();
  expect(sendBeaconMock).toHaveBeenCalledWith("pageView", dummpyPageMeta, {"prop1": "value1", "prop2": "value2"}, expect.any(Date));

});


it("sends PageView event with all tracking providers", async () => {
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

  await t.initialize();
  t.sendPageView(href, referrer);

  jest.runOnlyPendingTimers();
  mocks.forEach(mock => {
    expect(mock).toBeCalledTimes(1);
  });
});

it("sends events both before and after initialize", async () => {
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

  await t.initialize();
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

it("GATracker should send pageview event", async () => {

  [BeaconTracker, PixelTracker, TagManagerTracker, KakaoTracker,TwitterTracker].forEach(
    tracker => {
      const mock = jest.fn();
      tracker.prototype.sendPageView = mock;
      return mock;
    }
  );

  const t = createDummyTracker();

  const href = "https://localhost/home?q=localhost&adult_exclude=true";
  const referrer = "https://google.com/search?q=localhost";

  await t.initialize();

  // @ts-ignore
  window.ga = jest.fn();
  t.sendPageView(href, referrer);

  jest.runOnlyPendingTimers();
  expect(ga).toHaveBeenCalledWith("set", "page", "/home?q=localhost&adult_exclude=true");

});

it("Test twitter trackers", async () => {
  [BeaconTracker, PixelTracker, TagManagerTracker, KakaoTracker, GATracker].forEach(
    tracker => {
      tracker.prototype.sendPageView = jest.fn();
      tracker.prototype.impression = jest.fn();
      tracker.prototype.registration = jest.fn();
    });

  const t = createDummyTracker({
    isSelect: true,
    twitterOptions: {
      mainTid: "mainTid",
      selectRegisterTid: "selectRegisterTid",
      productTrackingTid: "productTrackingTid",
      booksRegisterTid: "booksRegisterTid"
    }
  });


  const trackPidMock = jest.fn();
  const twqMock = jest.fn();

  // @ts-ignore
  TwitterTracker.prototype.twttr = {conversion: {}}, TwitterTracker.prototype.twttr.conversion.trackPid = trackPidMock;

  // @ts-ignore
  TwitterTracker.prototype.twq = twqMock;

  await t.initialize();

  /* Need to disable flush throttling when sending event multiple times in one test cases */
  // @ts-ignore
  t.throttledFlush = t.flush;

  t.sendPageView("href");
  t.sendImpression();
  t.sendRegistration();
  jest.runOnlyPendingTimers();


  expect(twqMock).toHaveBeenCalledWith("track", "pageView");

  expect(trackPidMock).toHaveBeenNthCalledWith(1, "productTrackingTid", {tw_sale_amount: 0, tw_order_quantity: 0});
  expect(trackPidMock).toHaveBeenNthCalledWith(2,"selectRegisterTid", {tw_sale_amount: 0, tw_order_quantity: 0});

  expect(trackPidMock).not.toHaveBeenCalledWith("booksRegisterTid", {tw_sale_amount: 0, tw_order_quantity: 0});


})
