import {DeviceType, Tracker} from "../index";
import {BeaconTracker, GATracker, PixelTracker, TagManagerTracker} from "../trackers";
import {BaseTracker} from "../trackers/base";

let originalFunctions: Array<typeof BaseTracker.prototype.sendPageView>

beforeAll(() => {
  document.body.innerHTML = "<script />";
  originalFunctions = [BeaconTracker, GATracker, PixelTracker, TagManagerTracker].map(
    tracker => {
      return tracker.prototype.sendPageView
    }
  )
});

afterEach(() => {
    [BeaconTracker, GATracker, PixelTracker, TagManagerTracker].map(
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

  [GATracker, PixelTracker, TagManagerTracker].map(
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

  setTimeout(() => {
    expect(sendBeaconMock).toHaveBeenCalledWith("pageView", dummpyPageMeta, {"prop1": "value1", "prop2": "value2"}, undefined);
  }, 1000)
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

  setTimeout(() => {
    mocks.forEach(mock => {
      expect(mock).toBeCalledTimes(1);
    });  
  })
});

it("eventually sends events even if called before initialize", () => {
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

  t.sendPageView(href, referrer);
  mocks.forEach(mock => {
    expect(mock).not.toBeCalled();
  });

  t.initialize();
  setTimeout(() => {
    mocks.forEach(mock => {
      expect(mock).toBeCalledTimes(1);
    });  
  }, 1000)
});

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

  setTimeout(() => {
    expect(ga).toHaveBeenCalledWith("set", "page", "/home?q=localhost&adult_exclude=true");
  }, 1000);

});

