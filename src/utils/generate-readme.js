import { markdownMagic, stringUtils } from 'markdown-magic'
import { getSavedJSONFileData } from './fs.js'
import { README_FILEPATH } from '../_constants.js'

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
    console.log('Filtered out private repos', sortedByStarredDate.length)
    // console.log('privateRepos', privateRepos)
  }


  return markdownMagic(README_FILEPATH, {
    // debug: true,
    transforms: {
      STAR_COUNT: async function () {
        return allStars.length
      },
      ALL_STARS_TABLE() {
        const MAX_WIDTH = 80
        /* Make HTML Table */
        let html = `<table>
  <tr>
    <th align="left">Repo</th>
    <th align="center">Starred On</th>
  </tr>`
        
        sortedByStarredDate.forEach((data) => {
          const { repo, description, starredAt, createdAt, topics } = data
          const url = `https://github.com/${repo}`
          const desc = (data.description || '').trim().replace(/\.$/, '')
          const formattedDescription = stringUtils.stringBreak(desc, MAX_WIDTH).join('<br/>') 
          const _description = (data.description) ? `<br/>${formattedDescription}. ` : ''
          const topicsRender = (topics && topics.length > 0) ? `<br/>${stringUtils.stringBreak(tinyText(`Tags: ${topics.map((topic) => `#${topic}`).join(' ')}`), MAX_WIDTH + 60).join('<br/>')}` : ''
          const langText = (data.language) ? ` - ${data.language}` : ''
          const createdText = (createdAt) ? ` - ${formatDate(createdAt)}` : ''
          const inlineMeta = tinyText(`${langText}${createdText}`)
          const starredText = formatDate(starredAt)
          
          html += `
  <tr>
    <td><a href="${url}">${stringUtils.stringBreak(repo, MAX_WIDTH).join('<br/>')}</a>${inlineMeta}${topicsRender}${_description}</td>
    <td>${starredText}</td>
  </tr>`
        })
        
        html += `
</table>`

        return html
      },
      ALL_STARS_MD() {
        const MAX_WIDTH = 90
        /* Make Markdown Table */
        let md = `| Repo | Starred On |\n`;
        md +=    '|:-------------|:--------------:|\n';
        sortedByStarredDate.forEach((data) => {
          // console.log('item', item)
          const { repo, description, starredAt, createdAt, topics } = data
          const url = `https://github.com/${repo}`
          const desc = (data.description || '').trim().replace(/\.$/, '')
          const formattedDescription = stringUtils.stringBreak(desc, MAX_WIDTH).join('<br/>') 
          const _description = (data.description) ? `<br/>${formattedDescription}. ` : ''
          const topicsRender = (topics && topics.length > 0) ? `<br/>${stringUtils.stringBreak(tinyText(`Tags: ${topics.map((topic) => `#${topic}`).join(' ')}`), MAX_WIDTH + 60).join('<br/>')}` : ''
          const langText = (data.language) ? ` - ${data.language}` : ''
          const createdText = (createdAt) ? ` - ${formatDate(createdAt)}` : ''
          const inlineMeta = tinyText(`${langText}${createdText}`)
          const starredText = formatDate(starredAt)
          // add table rows
          md += `| [${stringUtils.stringBreak(data.repo, MAX_WIDTH).join('<br/>')}](${url})${inlineMeta}${topicsRender}${_description} | ${starredText} | \n`;
        })

        return md;
      }
    }
  })
}

function tinyText(text, newLine = false) {
  // return text
  if (!text) return ''
  const brTag = newLine ? '<br/>' : ''
  return `${brTag}<sup><sub>${text}</sub></sup>`
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function trimIsoDate(isoDateString) {
  return tinyText(isoDateString.split('T')[0])
  return EMPTY_WHITE_SPACE_CHAR.repeat(3) + isoDateString.split('T')[0] + EMPTY_WHITE_SPACE_CHAR.repeat(3) 
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
