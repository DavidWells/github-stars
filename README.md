# GitHub Stars

Get all your starred repositories and save their README files in Markdown format.

## Features

- Automatically obtain all starred repository information
- Convert and save the README file to Markdown format
- Keep the basic information of the repository (project name, number of stars, description, etc.)
- Automatically run backups every week (via GitHub Actions)
- Contains error handling and retry mechanisms

## Usage

1. [Fork](https://github.com/davidwells/github-stars/fork) this repository
2. Create non-expiring Fine-grained personal access tokens, required permissions
   1. User permissions
      - Read access to starring
   2. Repository permissions
      - Read access to metadata
      - Read and Write access to code
3. Configure GitHub Actions keys `GH_TOKEN`
4. Run Actions

Initial seed is delayed for 30 seconds to avoid rate limiting.

```
export GH_TOKEN=your_token
export INITIAL_SEED=TRUE
node index.js
```


## Props

Fork of https://github.com/ccbikai/github-stars/tree/master