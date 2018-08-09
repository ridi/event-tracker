# @ridi/event-tracker

[![npm](https://img.shields.io/npm/v/@ridi/event-tracker.svg)](https://www.npmjs.com/package/@ridi/event-tracker)
[![Build Status](https://travis-ci.org/ridi/event-tracker.svg?branch=master)](https://travis-ci.org/ridi/event-tracker)
[![Greenkeeper badge](https://badges.greenkeeper.io/ridi/event-tracker.svg)](https://greenkeeper.io/)

Provides tracking API that helps to send events to various logging services like Google Analytics, RIDI beacon system

## Install

### NPM
```bash
$ npm install @ridi/event-tracker
```

### Browser
```html
<script src="./node_modules/@ridi/event-tracker/dist/umd/bundle.min.js"></script>
```

## Usage

```javascript
import { Tracker, DeviceType } from '@ridi/event-tracker';

const tracker = new Tracker({
  deviceType: DeviceType.PC,
  userId: 'ridi',
  gaOptions: {
    trackingId: 'UA-XXXXXXXX-X',
    pathPrefix: '/PAPERSHOP',
    fields: {
      contentGroup5: 'PAPERSHOP'
    }
  },
  pixelOptions: {
    pixelId: '1000000000'
  }
});

tracker.initialize();

tracker.sendPageView(location.href);
```

## API

### `new Tracker(MainTrackerOptions)`

#### MainTrackerOptions

| Key                       | Required | Type            | Description                                                  |
| ------------------------- | -------- | --------------- | ------------------------------------------------------------ |
| `debug`                   | false    | `boolean`       | Defaults to `false`  If set to `true`, All fired events are logged to browser via `console.log` |
| `userId`                  | false    | `string`        | Logged user's identifier.                                    |
| `deviceType`              | true     | `DeviceType`    | Type of connected user's device. Please refer `DeviceType` type |
| `gaOptions`               | true     | `GAOptions`     | Options related with Google Analytics tracking module        |
| `gaOptions.trackingId`    | true     | `string`        | GA Tracking ID like `UA-000000-01`.                          |
| `gaOptions.pathPrefix`    | flase    | `string`        | Pathname prefix for manual content grouping.                          |
| `gaOptions.fields`        | false    | `string`        | [GA configurable create only fields.](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference) |
| `beaconOptions`           | false    | `BeaconOptions` | Options related with Beacon tracking module                  |
| `beaconOptions.beaconSrc` | false    | `string`        | Source of the image to be used as a beacon                   |
| `pixelOptions`            | true     | `PixelOptions`  | Options related with Pixel tracking module                   |
| `pixelOptions.trackingId` | true     | `string`        | Facebook Pixel Tracking ID like `1000000000`.                |

### `Tracker.initialize()`

`@ridi/event-tracker` must be initialized by using this method before any of the other tracking functions will record any data. 

### `Tracker.sendPageView(href, referrer)`

| Key        | Required | Type   | Description                                   |
| ---------- | -------- | ------ | --------------------------------------------- |
| `href`     | true     | string | e.g `https://example.com/path?key=value#hash` |
| `referrer` | false    | string | e.g `https://google.com/search?q=example`     |

### `Tracker.set(ChangeableTrackerOptions)`

Allow to set (change) `MainTrackerOptions `'s attributes

#### ChangeableTrackerOptions

| Key          | Required | Type         | Description |
| ------------ | -------- | ------------ | ----------- |
| `userId`     | false    | `string`     |             |
| `deviceType` | false    | `DeviceType` |             |



## Development

```bash
$ git clone https://github.com/ridi/event-tracker && cd tracking
$ npm install
$ npm run watch
```

## Test

```bash
$ npm run test // TBD
```

## LICENSE

MIT
