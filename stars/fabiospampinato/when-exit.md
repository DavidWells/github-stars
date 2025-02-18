---
repo: fabiospampinato/when-exit
name: when-exit
homepage: NA
url: https://github.com/fabiospampinato/when-exit
stars: 13
starredAt: 2023-12-29T19:32:14Z
description: |-
    Execute a function right before the process is about to exit.
---

# WhenExit

Execute a function right before the process, or the browser's tab, is about to exit.

## Install

```sh
npm install when-exit
```

## Usage

```ts
import whenExit from 'when-exit';

// Registering multiple callbacks

onExit ( () => {
  console.log ( 'Callback 1' );
});

onExit ( () => {
  console.log ( 'Callback 2' );
});

// Registering and disposing a callback

const disposer = onExit ( () => {
  console.log ( 'Callback 3' );
});

disposer ();

// Triggering the process to exit

process.exit (); // Callback 1 and 2 are called before exiting
```

## License

MIT © Fabio Spampinato

