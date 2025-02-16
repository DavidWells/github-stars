import { markdownMagic, stringUtils } from 'markdown-magic'
import { getSavedJSONFileData } from './fs.js'
import { README_FILE_PATH } from '../_constants.js'

const EMPTY_WHITE_SPACE_CHAR = '‎'

async function generateMarkdownTable(opts) {
  const options = opts || {}
  /* Hey now you're an all star */
  const allStars = await getSavedJSONFileData()
  console.log('getAllStars', allStars.length)
  
  let sortedByStarredDate = allStars
    .sort((a, b) => new Date(b.starred_at) - new Date(a.starred_at))
    .map(({ repo, starred_at }) => {
      const licenseObj = repo.license || {}
      return {
        repo: repo.full_name,
        private: repo.private,
        description: repo.description,
        starredAt: starred_at,
        createdAt: repo.created_at,
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
    }) //.slice(0, 100)

  
  console.log('Stars to process', sortedByStarredDate.length)

  if (options.excludePrivateRepos) {
    let privateRepos = []
    sortedByStarredDate = sortedByStarredDate.filter((repo) => {
      if (repo.private) {
        privateRepos.push(repo)
      }
      return !repo.private
    })
    console.log('Stars to filtered', sortedByStarredDate.length)
    console.log('Stars to process', privateRepos)
  }


  return markdownMagic(README_FILE_PATH, {
    transforms: {
      ALL_STARS() {
        const MAX_WIDTH = 90
        /* Make Markdown Table */
        let md = `| Repo | Starred On |\n`;
        md +=    '|:-------------|:--------------:|\n';
        sortedByStarredDate.forEach((data) => {
          // console.log('item', item)
          const { repo, description, starredAt, createdAt } = data
          const url = `https://github.com/${repo}`
          const desc = (data.description || '').trim().replace(/\.$/, '')
          const formattedDescription = stringUtils.stringBreak(desc, MAX_WIDTH).join('<br/>')
          const _description = (data.description) ? `<br/>${formattedDescription}.` : ''
          const lang = tinyText(`- ${data.language}`)
          const langRender = (lang) ? ` ${lang}` : ''
          const starredText = formatDate(starredAt)
          const starredDate = tinyText(`⭐️ ${starredText}`)
          const createdText = (createdAt) ? formatDate(createdAt) : ''
          const createdRender = (createdText) ? ` ${tinyText(`- 🗓️ ${createdText}`)}` : ''
          // add table rows
          md += `| [${stringUtils.stringBreak(data.repo, MAX_WIDTH).join('<br/>')}](${url})${createdRender}${langRender}${_description} | ${starredText} | \n`;
        })

        return md;
      }
    }
  })
}

function tinyText(text, newLine = false) {
  if (!text) return ''
  const brTag = newLine ? '<br/>' : ''
  return `${brTag}<sup><sub>${text}</sub></sup>`
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
