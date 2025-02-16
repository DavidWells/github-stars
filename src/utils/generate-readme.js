import { markdownMagic } from 'markdown-magic'
import { markdownTable } from 'markdown-table'
import { getSavedJSONFileData } from './fs.js'
import { README_FILE_PATH } from '../_constants.js'

async function generateMarkdownTable() {
  /* Hey now you're an all star */
  const allStars = await getSavedJSONFileData()
  console.log('getAllStars', allStars.length)
  
  const sortedByStarredDate = allStars
    .sort((a, b) => new Date(b.starred_at) - new Date(a.starred_at))
    .map(({ repo, starred_at }) => {
      const licenseObj = repo.license || {}
      return {
        repo: repo.full_name,
        description: repo.description,
        starredAt: starred_at,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        branch: repo.default_branch,
        license: licenseObj.spdx_id,
        visibility: repo.visibility,
        isFork: repo.fork,
        isPrivate: repo.private,
        isArchived: repo.archived,
        isTemplate: repo.is_template,
        isDisabled: repo.disabled,
        topics: repo.topics,
      }
    })

  const tableRows = sortedByStarredDate.map(({ repo, ...rest }) => {
    return [
      `[${repo}](https://github.com/${repo})<br/>${rest.description}`,
      formatDate(rest.starredAt),
      // numberWithCommas(rest.stars),
    ]
  })

  return markdownMagic(README_FILE_PATH, {
    transforms: {
      ALL_STARS() {
        return markdownTable([
          ['Repo', 'Starred On'],
          ...tableRows,
        ])
      }
    }
  })
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Add this helper function for date formatting
function formatDate(isoDate) {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  })
}

export { 
  generateMarkdownTable,
}
