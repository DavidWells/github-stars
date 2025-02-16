import fs from 'fs-extra'
import { STARS_MD_FOLDER_PATH } from '../_constants.js'

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

  await fs.ensureDir(`${STARS_MD_FOLDER_PATH}/${repoDetails.owner.login}`)

  const readMePath = `${STARS_MD_FOLDER_PATH}/${repoPath}.md`
  return fs.writeFile(readMePath, fileContent).then(() => {
    return readMePath
  })
}

export { saveReadMe }
