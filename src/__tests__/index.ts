import {DeviceType, Tracker} from "../index";
import {
  BeaconTracker,
  GATracker,
  PixelTracker,
  TagManagerTracker
} from "../trackers";


beforeAll(() => {
  document.body.innerHTML = "<script />";
});

const createDummyTracker = (additionalOptions: object = {}) => {
  return new Tracker({
    deviceType: DeviceType.Mobile,
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
