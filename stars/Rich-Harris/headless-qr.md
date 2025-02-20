---
repo: Rich-Harris/headless-qr
name: headless-qr
homepage: https://svelte.dev/playground/0b671b7c191340079b8abe3883cbedd5?version=5.2.9
url: https://github.com/Rich-Harris/headless-qr
stars: 459
starredAt: 2025-01-14T06:55:03Z
description: |-
    A simple, modern QR code library
---

# headless-qr

A simple, modern QR code generator. Adapted from https://github.com/kazuhikoarase/qrcode-generator but without all the junk that was necessary 10 years ago.

## Usage

```js
import { qr } from 'headless-qr';

// generate an n x n array of booleans,
// where `true` is a dark pixel
const modules = qr('https://example.com');

// specify version and error correction
const modules = qr('https://example.com', {
	version: 40, // 1 - 40, will select the best version if unspecified
	correction: 'Q' // L, M, Q or H
});
```

