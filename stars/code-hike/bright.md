---
repo: code-hike/bright
name: bright
homepage: https://bright.codehike.org
url: https://github.com/code-hike/bright
stars: 1514
starredAt: 2023-01-22T21:17:57Z
description: |-
    React Server Component for syntax highlighting 
---

> the future is bright

## Usage

```bash
npm install bright
```

Use it from a **server component**, for example in Next.js `app/page.js`:

```js
import { Code } from "bright"

export default function Page() {
  return <Code lang="py">print("hello brightness")</Code>
}
```

Docs: https://bright.codehike.org

## Credits

- Thanks [LEI Zongmin](https://github.com/leizongmin) for providing the bright npm package name

## License

MIT

