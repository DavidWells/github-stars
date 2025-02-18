---
repo: barelyhuman/timestamps
name: timestamps
homepage: NA
url: https://github.com/barelyhuman/timestamps
stars: 1
starredAt: 2023-12-29T02:07:53Z
description: |-
    A tiny timestamp parsing and formatting library (Node, Deno, ESM) 
---

# @barelyhuman/timestamps

> A tiny timestamp parsing and formatting library

This is just an internal utility used by TillWhen for parsing and formatting
timestamps.

## Installation

```sh
npm i @barelyhuman/timestamps
# or
yarn add @barelyhuman/timestamps
```

## Usage

```js
import {
  fromSeconds,
  fromMilliseconds,
  formatSeconds,
  formatMilliseconds,
  parse,
} from '@barelyhuman/timestamps'

fromSeconds(3600) // {hours:1, minutes:0, seconds:0}
fromMilliseconds(3600 * 1000) // {hours:1, minutes:0, seconds:0}
formatSeconds(3600, '{hh}:{mm}:{ss}') // 01:00:00
formatMilliseconds(3600 * 1000, '{hh}:{mm}:{ss}') // 01:00:00
parse('01:00:00', '{hh}:{mm}:{ss}') // {hours:1, minutes:0, seconds:0}
```

## License

[LICENSE](/LICENSE)

