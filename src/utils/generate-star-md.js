import fs from 'fs-extra'
import { STARS_DIRECTORY } from '../_constants.js'

async function saveReadMe(repo, readme) {
  const repoDetails = repo.repo || repo
  const starredAt = repo.starred_at || repo.repo.updated_at
  const repoPath = repoDetails.full_name
  const fileContent = `---
repo: ${repoDetails.full_name}
name: ${repoDetails.name}
homepage: ${repoDetails.homepage || 'NA'}
url: ${repoDetails.html_url}
stars: ${repoDetails.stargazers_count}
starredAt: ${starredAt}
description: |-
    ${repoDetails.description}
---

${readme}
` 

  await fs.ensureDir(`${STARS_DIRECTORY}/${repoDetails.owner.login}`)

  const readMePath = `${STARS_DIRECTORY}/${repoPath}.md`
  return fs.writeFile(readMePath, fileContent).then(() => {
    return readMePath
  })
}

export { saveReadMe }
