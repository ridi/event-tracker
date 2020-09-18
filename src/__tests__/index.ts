import { DeviceType, MainTrackerOptions, Tracker } from '../index';
import {
  BeaconTracker,
  GATracker,
  KakaoTracker,
  PixelTracker,
  TagManagerTracker,
  TwitterTracker,
} from '../trackers';
import { BaseTracker, EventTracker } from '../trackers/base';

const ALL_TRACKERS = [
  BeaconTracker,
  GATracker,
  PixelTracker,
  TagManagerTracker,
  KakaoTracker,
  TwitterTracker,
];

declare global {
  interface Array<T> {
    excludes(...elements: T[]): T[];
  }
}

if (!Array.prototype.excludes) {
  /* eslint-disable */
  Array.prototype.excludes = function<T>(...elements: T[]): T[] {
    return this.filter((e: T) => !elements.includes(e));
  };
  /* eslint-enable */
}

beforeAll(() => {
  ALL_TRACKERS.forEach(t => (t.prototype.isInitialized = () => true));
});

beforeEach(() => {
  document.body.innerHTML = '<script />';
  jest.useFakeTimers();
});

afterEach(() => {
  jest.restoreAllMocks();
});

class TestableTracker extends Tracker {
  constructor(additionalOptions?: Partial<MainTrackerOptions>) {
    super({
      deviceType: DeviceType.Mobile,
      serviceProps: {
        prop1: 'value1',
        prop2: 'value2',
      },
      beaconOptions: {
        use: true,
      },
      gaOptions: {
        trackingId: 'TEST',
      },
      pixelOptions: {
        pixelId: 'TEST',
      },
      tagManagerOptions: {
        trackingId: 'TEST',
      },
      kakaoOptions: {
        trackingId: 'TEST',
      },
      twitterOptions: {
        mainPid: 'TEST',
        impressionPid: 'TEST',
        booksSignUpPid: 'TEST',
        selectStartSubscriptionPid: 'TEST',
      },
      ...additionalOptions,
    });
  }

  private getTrackerInstances(
    ...trackers: Array<new (...args: any[]) => BaseTracker>
  ): BaseTracker[] {
    const isGivenTrackers = (t: BaseTracker) =>
      trackers.some(useTracker => t instanceof useTracker);

    return this.trackers.filter(isGivenTrackers);
  }

  public getTrackerInstance<T extends BaseTracker>(
    trackerType: new (...args: any[]) => T,
  ): T {
    return this.trackers.find(t => t instanceof trackerType) as T;
  }

  public mocking(
    trackers: Array<new (...args: any[]) => BaseTracker>,
    methodName: keyof EventTracker,
    mockImpl: () => void = () => true,
  ) {
    const mockingTargetTrackers = this.getTrackerInstances(...trackers);
    return mockingTargetTrackers.map(t =>
      jest.spyOn(t, methodName).mockImplementation(mockImpl),
    );
  }

  public mockingAll(
    trackers: Array<new (...args: any[]) => BaseTracker>,
    methodNames: Array<keyof EventTracker>,
    mockImpl: () => void = () => true,
  ) {
    return methodNames.map(m => this.mocking(trackers, m, mockImpl));
  }
}

it('BeaconTracker sends PageView event with serviceProps', async () => {
  const dummpyPageMeta = {
    device: 'mobile',
    href: 'https://localhost/home?q=localhost&adult_exclude=true',
    page: 'home',
    path: '/home',
    query_params: { adult_exclude: 'true', q: 'localhost' },
    referrer: 'https://google.com/search?q=localhost',
  };

  const t = new TestableTracker();

  t.mocking(ALL_TRACKERS.excludes(BeaconTracker), 'sendPageView');

  const href = 'https://localhost/home?q=localhost&adult_exclude=true';
  const referrer = 'https://google.com/search?q=localhost';
  await t.initialize();

  const sendBeaconMock = jest.fn();

  // @ts-ignore

  BeaconTracker.prototype.sendBeacon = sendBeaconMock;
  t.sendPageView(href, referrer);

  jest.runOnlyPendingTimers();
  expect(sendBeaconMock).toHaveBeenCalledWith(
    'pageView',
    dummpyPageMeta,
    { prop1: 'value1', prop2: 'value2' },
    expect.any(Date),
  );
});

it('sends PageView event with all tracking providers', async () => {
  const t = new TestableTracker();
  const mocks = t.mocking(ALL_TRACKERS, 'sendPageView');

  const href = 'https://localhost/home';
  const referrer = 'https://google.com/search?q=localhost';

  await t.initialize();
  t.sendPageView(href, referrer);

  jest.runOnlyPendingTimers();
  mocks.forEach(mock => {
    expect(mock).toBeCalledTimes(1);
  });
});

it('sends events both before and after initialize', async () => {
  const t = new TestableTracker();
  const mocks = t.mocking(ALL_TRACKERS, 'sendPageView');

  const href = 'https://localhost/home';
  const referrer = 'https://google.com/search?q=localhost';

  const href2 = 'https://localhost/search?q=abc';
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
    expect(mock).toHaveBeenNthCalledWith(
      1,
      {
        device: 'mobile',
        href: 'https://localhost/home',
        page: 'home',
        path: '/home',
        query_params: {},
        referrer: 'https://google.com/search?q=localhost',
      },
      expect.any(Date),
    );
    expect(mock).toHaveBeenNthCalledWith(
      2,
      {
        device: 'mobile',
        href: 'https://localhost/search?q=abc',
        page: 'search',
        path: '/search',
        query_params: { q: 'abc' },
        referrer: 'https://localhost/home',
      },
      expect.any(Date),
    );
  });
});

it('GATracker should send pageview event', async () => {
  const t = new TestableTracker();
  t.mocking(ALL_TRACKERS.excludes(GATracker), 'sendPageView');

  const href = 'https://localhost/home?q=localhost&adult_exclude=true';
  const referrer = 'https://google.com/search?q=localhost';

  await t.initialize();

  // @ts-ignore

  window.ga = jest.fn();
  t.sendPageView(href, referrer);

  jest.runOnlyPendingTimers();
  expect(ga).toHaveBeenCalledWith(
    'set',
    'page',
    '/home?q=localhost&adult_exclude=true',
  );
});

it('Test TwitterTracker', async () => {
  const t = new TestableTracker({
    twitterOptions: {
      mainPid: 'mainPid',
      booksSignUpPid: 'booksSignUpPid',
      selectStartSubscriptionPid: 'selectStartSubscriptionPid',
      impressionPid: 'impressionPid',
    },
  });

  t.mockingAll(ALL_TRACKERS.excludes(TwitterTracker), [
    'sendPageView',
    'sendImpression',
    'sendSignUp',
    'sendStartSubscription',
  ]);

  const trackPidMock = jest.fn();
  const twqMock = jest.fn();

  const twitterTracker = t.getTrackerInstance(TwitterTracker);

  // @ts-ignore

  twitterTracker.twttr = { conversion: {} };

  // @ts-ignore

  twitterTracker.twttr.conversion.trackPid = trackPidMock;

  // @ts-ignore

  twitterTracker.twq = twqMock;

  await t.initialize();

  /* Need to disable flush throttling when sending event multiple times in one test cases */
  // @ts-ignore

  t.throttledFlush = t.flush.bind(t);

  t.sendPageView('href');
  t.sendImpression();
  t.sendSignUp();
  t.sendStartSubscription();

  jest.runOnlyPendingTimers();

  expect(twqMock).toHaveBeenCalledWith('track', 'pageView');

  expect(trackPidMock).toHaveBeenNthCalledWith(1, 'impressionPid', {
    tw_sale_amount: 0,
    tw_order_quantity: 0,
  });
  expect(trackPidMock).toHaveBeenNthCalledWith(2, 'booksSignUpPid', {
    tw_sale_amount: 0,
    tw_order_quantity: 0,
  });
  expect(trackPidMock).toHaveBeenNthCalledWith(
    3,
    'selectStartSubscriptionPid',
    { tw_sale_amount: 0, tw_order_quantity: 0 },
  );
});
