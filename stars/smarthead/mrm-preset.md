---
repo: smarthead/mrm-preset
name: mrm-preset
homepage: https://npm.im/@smarthead/mrm-preset
url: https://github.com/smarthead/mrm-preset
stars: 6
starredAt: 2021-01-01T06:20:02Z
description: |-
    Mrm Preset ✨ from SmartHead
---

# Mrm Preset

[Mrm](https://mrm.js.org) Preset ✨ from SmartHead

This preset includes the following Mrm tasks

```
package
gitignore
editorconfig
gitattributes
browserslist
stylelint
typescript
lint-staged
```

## Usage

You should initialize Git in your project before run mrm

```
git init
```

Running mrm with this mrm preset

```
npx -p mrm -p @smarthead/mrm-preset@latest mrm --preset @smarthead/mrm-preset default -i
```

