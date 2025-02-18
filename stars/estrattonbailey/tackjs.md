---
repo: estrattonbailey/tackjs
name: tackjs
homepage: https://tackjs.now.sh/
url: https://github.com/estrattonbailey/tackjs
stars: 15
starredAt: 2023-11-25T20:20:45Z
description: |-
    📌 Tiny utility to position an element absolutely in relation to another element.
---

# tackjs
Tiny utility to position an element absolutely in relation to another element. **500b gzipped.**

> What's this for? Think popovers, modals, tooltips, scroll-jacking, etc.

## Install
```bash
npm i tackjs --save
```

## Usage
Usage is very straightfoward. Think, "pin *element* to *target* at the *top*":
```javascript
import tack from 'tackjs'

const element = document.querySelector('...')
const target = document.querySelector('...')

const pin = tack(element, target, 'top')
```

To update the position – say after the window resizes – use `update`:
```javascript
pin.update()
```

If you need to un-pin and remove all styles:
```javascript
pin.destroy()
```

But don't worry! It can be re-pinned as well:
```javascript
pin.update()
```

**N.B.** `tackjs` also adds an `.is-tacked` class to all pinned elements.

### Alignment
Tack supports the following coordinates relative to the passed `target` element:
- `top`
- `bottom`
- `left`
- `right`
- `topLeft`
- `topRight`
- `bottomLeft`
- `bottomRight`

## License
MIT License © [Eric Bailey](https://estrattonbailey.com)

