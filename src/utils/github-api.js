import fs from 'fs-extra'
import safe from 'safe-await'
import { $fetch } from 'ofetch'
import { delay } from './delay.js'
import { STARS_MD_FOLDER_PATH } from '../_constants.js'

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

async function getReadMe(repo = {}) {
  const repoDetails = repo.repo || repo
  const repoPath = repoDetails.full_name
  const filePath = `${STARS_MD_FOLDER_PATH}/${repoPath}.md`
  
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

  console.log(`Getting readme for ${repoPath}`)
  const [err, data] = await safe($fetch(`https://api.github.com/repos/${repoPath}/readme`, {
    headers: {
      authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
      accept: 'application/vnd.github.raw+json',
      'user-agent': 'github-stars',
    },
    retry: 3,
    retryDelay: 100,
  }))

  if (err) {
    console.error(`Error getting readme from github: ${err}`)
    return
  }
  
  return data
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
  const reset = parseInt(headers.get('x-ratelimit-reset'))
  const rateLimit = {
    limit: parseInt(headers.get('x-ratelimit-limit')),
    remaining: parseInt(headers.get('x-ratelimit-remaining')),
    reset: reset,
    resetTime: new Date(reset * 1000).toISOString(),
    used: parseInt(headers.get('x-ratelimit-used')),
  }
  
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
  getRepoHash,
}
