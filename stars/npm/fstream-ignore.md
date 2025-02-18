---
repo: npm/fstream-ignore
name: fstream-ignore
homepage: NA
url: https://github.com/npm/fstream-ignore
stars: 37
starredAt: 2017-04-03T23:04:15Z
description: |-
    null
---

# fstream-ignore

A fstream DirReader that filters out files that match globs in `.ignore`
files throughout the tree, like how git ignores files based on a
`.gitignore` file.

Here's an example:

```javascript
var Ignore = require("fstream-ignore")
Ignore({ path: __dirname
       , ignoreFiles: [".ignore", ".gitignore"]
       })
  .on("child", function (c) {
    console.error(c.path.substr(c.root.path.length + 1))
  })
  .pipe(tar.Pack())
  .pipe(fs.createWriteStream("foo.tar"))
```

This will tar up the files in __dirname into `foo.tar`, ignoring
anything matched by the globs in any .iginore or .gitignore file.

