---
repo: KyleAMathews/browser-tab-id
name: browser-tab-id
homepage: NA
url: https://github.com/KyleAMathews/browser-tab-id
stars: 14
starredAt: 2024-01-08T19:42:03Z
description: |-
    Library to get a unique integer id. Defaults to getting lowest positive integer
---

# browser-tab-id
Library to get a unique integer id for each tab running the same app. Defaults to getting lowest positive integer.

Handles multiple tabs opening concurrently.

## Usage

```ts
import { TabIdCoordinator } from "browser-tab-id"

// Access the assigned tab ID.
tabIdCoordinator.tabId
```


