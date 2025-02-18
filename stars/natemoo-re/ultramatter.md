---
repo: natemoo-re/ultramatter
name: ultramatter
homepage: NA
url: https://github.com/natemoo-re/ultramatter
stars: 123
starredAt: 2023-02-05T22:26:11Z
description: |-
    <1kB frontmatter parser that supports a reasonable subset of YAML
---

# `ultramatter`

A <1kB library for parsing frontmatter. `ultramatter` has zero dependencies and is compatible with any JavaScript runtime.

### Features

- It's very small.
- It's very fast.
- It supports a small, relaxed subset of YAML
  - Maps (`key: value`)
  - Sequences (`- list`)
  - Inline Arrays (`[0, 1, 2]`)
  - Literal Blocks (`|`)
  - Comments (`# comment`)
  - Quoted values (`'single'`, `"double"`)
  - Boolean values (`true` and `false` ONLY)
  - Tabs are valid

