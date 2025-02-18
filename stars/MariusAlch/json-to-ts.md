---
repo: MariusAlch/json-to-ts
name: json-to-ts
homepage: NA
url: https://github.com/MariusAlch/json-to-ts
stars: 421
starredAt: 2024-09-01T01:07:45Z
description: |-
    Convert jsons to typescript interfaces
---

![JSON TO TS](https://image.ibb.co/fTb60k/icon.png)

# Json to TS

### Convert json object to typescript interfaces

# Example

### Code

```javascript
const JsonToTS = require('json-to-ts')

const json = {
  cats: [
    {name: 'Kittin'},
    {name: 'Mittin'}
  ],
  favoriteNumber: 42,
  favoriteWord: 'Hello'
}

JsonToTS(json).forEach( typeInterface => {
  console.log(typeInterface)
})
```

### Output:

```typescript
interface RootObject {
  cats: Cat[];
  favoriteNumber: number;
  favoriteWord: string;
}
interface Cat {
  name: string;
}
```

## Converter
- Array type merging (**Big deal**)
- Union types
- Duplicate type prevention
- Optional types
- Array types

# Setup

```sh
$ npm install --save json-to-ts
```

