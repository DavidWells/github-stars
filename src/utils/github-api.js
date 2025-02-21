import fs from 'fs-extra'
import safe from 'safe-await'
import { $fetch } from 'ofetch'
import { delay } from './delay.js'
import { STARS_DIRECTORY } from '../_constants.js'

async function getSelfStaredRepos(delayPerPage) {
  const perPage = 100
  const repos = []
  let page = 1
  let loop = 0
  while (true) {
    console.log(`Getting page ${page}. Loop ${loop}`)
    if (loop > 1 && delayPerPage) {
      await delay(delayPerPage)
      loop++
    }
    const pageRepos = await $fetch(`https://api.github.com/user/starred`, {
      query: {
        page: page,
        per_page: perPage,
      },
      headers: {
        authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
        'user-agent': 'github-stars',
      },
      retry: 3,
      retryDelay: 100,
    })
    console.log(`Got ${pageRepos.length} repos`)
    console.log(pageRepos)
    repos.push(...pageRepos)
    console.log(`Current repos: ${repos.length}`)
    if (pageRepos.length < perPage) {
      break
    }
    page++
  }
  return repos
}

function extractRateLimit(headers) {
  if (!headers) return null
  const reset = parseInt(headers.get('x-ratelimit-reset'))
  return {
    limit: parseInt(headers.get('x-ratelimit-limit')),
    remaining: parseInt(headers.get('x-ratelimit-remaining')),
    reset: reset,
    resetTime: new Date(reset * 1000).toISOString(),
    used: parseInt(headers.get('x-ratelimit-used')),
  }
}

async function getReadMe(repo = {}) {
  const repoDetails = repo.repo || repo
  const repoPath = repoDetails.full_name
  const filePath = `${STARS_DIRECTORY}/${repoPath}.md`
  
  // Check if file already exists
  try {
    const exists = await fs.pathExists(filePath)
    if (exists) {
      console.log(`Readme already exists for ${repoPath} at ${filePath}, skipping...`)
      return
    }
  } catch (err) {
    console.error(`Error checking file existence: ${err}`)
  }

  // from a commit https://raw.githubusercontent.com/org/name/dc3e42769b08fb091b3258c0e7c0dfbe19b11782/README.md

  console.log(`Getting readme for ${repoPath}`)
  const [apiError, response] = await safe(
    $fetch.raw(`https://api.github.com/repos/${repoPath}/readme`, {
      headers: {
        authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
        accept: 'application/vnd.github.raw+json',
        'user-agent': 'github-stars',
      },
      retry: 3,
      retryDelay: 100,
    })
  )

  let mdFromApi = null
  let rateLimit = null

  if (response) {
    const { headers, _data } = response
    mdFromApi = _data
    rateLimit = extractRateLimit(headers)
    // console.log('Remaing API calls:', rateLimit.remaining)
    console.log(`Remaining calls: ${rateLimit.remaining} til ${rateLimit.resetTime}`)
  }

  if (apiError) {
    console.error(`Error getting readme from github API: ${apiError}`)
  }

  /* Try raw request if error for README.md */
  if (apiError || !mdFromApi) {
    console.log(`Attempting HTTP GET for ${repoPath}/README.md`)
    // Make HTTP GET request to the raw readme file
    // const rawREADME_md = await getRawReadMe(repoDetails, 'README.md')
    // if (rawREADME_md) {
    //   return rawREADME_md
    // }
    const rawREADME = await getRawReadMe(repoDetails, 'README')
    if (rawREADME) {
      return { content: rawREADME, rateLimit }
    }
    const raw_readme = await getRawReadMe(repoDetails, 'readme')
    if (raw_readme) {
      return { content: raw_readme, rateLimit }
    }
  }
  
  return { content: mdFromApi, rateLimit }
}


async function getRawReadMe(repo, readmeFileName = 'README.md') {
  const repoPath = repo.full_name
  const branch = repo.default_branch || 'main'

  if (!repoPath) {
    console.error(`Repo path is not set for ${repo}`)
    return
  }

  if(!branch) {
    console.error(`Branch is not set for ${repo}`)
    return
  }
  const [err, rawMdData] = await safe($fetch(`https://raw.githubusercontent.com/${repoPath}/${branch}/${readmeFileName}`, {
    headers: {
      'user-agent': 'github-stars',
    },
  }))

  if (err) {
    console.error(`Error getting raw readme from github: ${err}`)
    return
  }

  return rawMdData
}

async function getRepoHash(repo, mainBranch = 'main') {
  const [err, data] = await safe($fetch(`https://api.github.com/repos/${repo}/commits/${mainBranch}`, {
    headers: {
      authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
      'user-agent': 'github-stars',
    },
    retry: 3,
    retryDelay: 100,
  }))

  if (err) {
    console.error(`Error getting repo hash: ${err}`)
    return 'NA'
  }

  return data.sha
}

async function getGitHashFromDate(repo, date) {
  try {
    const commits = await $fetch(`https://api.github.com/repos/${repo}/commits`, {
      query: {
        until: date,
        per_page: 1
      },
      headers: {
        'authorization': 'Bearer ' + process.env.GITHUB_TOKEN,
        'user-agent': 'github-stars',
      },
      retry: 3,
      retryDelay: 100,
    })

    if (!commits || !commits[0] || !commits[0].sha) {
      console.log(`No commits found for ${repo} before ${date}`)
      return null
    }

    return commits[0].sha
  } catch (error) {
    console.error(`Error fetching git hash for ${repo}: ${error.message}`)
    return null
  }
}

async function getStarredRepos(username, page = 1) {
  const res = await $fetch.raw(`https://api.github.com/users/${username}/starred`, {
    query: {
      page: page,
      per_page: 100,
    },
    headers: {
      authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
      Accept: 'application/vnd.github.v3.star+json',
      'user-agent': 'github-stars',
    },
    retry: 3,
    retryDelay: 100,
    responseType: 'json',
  })
  // console.log(res)

  const { headers, _data } = res
  
  const linkHeader = headers.get('link')
  const links = linkHeader ? parseLinkHeader(linkHeader) : {}
  
  // Extract rate limit info from headers
  const rateLimit = extractRateLimit(headers)
  
  return {
    repos: _data,
    pagination: links,
    rateLimit,
  }
}

function parseLinkHeader(header) {
  const links = {}
  const parts = header.split(',')
  
  parts.forEach(part => {
    const section = part.split(';')
    const url = section[0].replace(/<(.*)>/, '$1').trim()
    const name = section[1].replace(/rel="(.*)"/, '$1').trim()
    links[name] = url
  })
  
  return links
}

export {
  getStarredRepos,
  getSelfStaredRepos,
  getReadMe,
  getRawReadMe,
  getRepoHash,
  getGitHashFromDate,
  extractRateLimit,
}
