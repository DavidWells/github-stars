import { $fetch } from 'ofetch'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import safe from 'safe-await'

// Add these lines at the top to define __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { INITIAL_SEED, GITHUB_TOKEN } = process.env
const DELAY_PER_PAGE = 2000
const SLASH_REPLACEMENT = '___|___'

const RAW_DATA_FOLDER = path.join(__dirname, 'data')
const STARS_MD_FOLDER = path.join(__dirname, 'stars')
const README_FILE = path.join(__dirname, 'README.md')
if (!GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is not set')
}

if (INITIAL_SEED === 'true') {
  console.log('Running initial seed')
}

async function getReadMe(repo = {}) {
  const repoDetails = repo.repo || repo
  const repoPath = repoDetails.full_name
  const filePath = `stars/${repoPath}.md`
  
  // Check if file already exists
  try {
    const exists = await fs.pathExists(filePath)
    if (exists) {
      console.log(`Readme already exists for ${repoPath}, skipping...`)
      return
    }
  } catch (err) {
    console.error(`Error checking file existence: ${err}`)
  }

  console.log(`Getting readme for ${repoPath}`)
  return $fetch(`https://api.github.com/repos/${repoPath}/readme`, {
    headers: {
      authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
      accept: 'application/vnd.github.raw+json',
      'user-agent': 'github-stars',
    },
    retry: 3,
    retryDelay: 100,
  })
}

function delayForInitialLoad(delay = 2000) {
  console.log('Delaying for initial seed', delay)
  return new Promise((resolve) => setTimeout(resolve, delay))
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

async function getSelfStaredRepos() {
  const perPage = 100
  const repos = []
  let page = 1
  let loop = 0
  while (true) {
    console.log(`Getting page ${page}. Loop ${loop}`)
    if (INITIAL_SEED === 'true' && loop > 1) {
      await delayForInitialLoad(DELAY_PER_PAGE)
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

async function saveReadMe(repo, readme) {
  const repoDetails = repo.repo || repo
  const starredAt = repo.starred_at || repo.repo.updated_at
  const repoPath = repoDetails.full_name
  const fileContent = `---
project: ${repoDetails.name}
stars: ${repoDetails.stargazers_count}
starredAt: ${starredAt}
description: |-
    ${repoDetails.description}
url: ${repoDetails.html_url}
---

${readme}
` 

  await fs.ensureDir(`stars/${repoDetails.owner.login}`)

  return fs.writeFile(`stars/${repoPath}.md`, fileContent)
}


function cleanGithubRepo(data) {
 const repoUrlsToRemove = [
   'forks_url', 'keys_url', 'collaborators_url', 'teams_url', 'hooks_url',
   'issue_events_url', 'events_url', 'assignees_url', 'branches_url',
   'tags_url', 'blobs_url', 'git_tags_url', 'git_refs_url', 'trees_url', 
   'statuses_url', 'languages_url', 'stargazers_url', 'contributors_url',
   'subscribers_url', 'subscription_url', 'commits_url', 'git_commits_url',
   'comments_url', 'issue_comment_url', 'contents_url', 'compare_url',
   'merges_url', 'archive_url', 'downloads_url', 'issues_url', 'pulls_url',
   'milestones_url', 'notifications_url', 'labels_url', 'releases_url',
   'deployments_url', 'node_id', 'git_url', 'ssh_url', 'clone_url', 'svn_url', 
   'web_commit_signoff_required', 'permissions'
 ]

 const ownerUrlsToRemove = [
   'followers_url', 'following_url', 'gists_url', 'starred_url',
   'subscriptions_url', 'organizations_url', 'repos_url', 'events_url',
   'received_events_url', 'gravatar_id'
 ]

 const cleanOwner = Object.fromEntries(
   Object.entries(data.repo.owner).filter(([key]) => !ownerUrlsToRemove.includes(key))
 )

 const cleanRepo = Object.fromEntries(
   Object.entries(data.repo).filter(([key]) => !repoUrlsToRemove.includes(key))
 )

 return Object.assign({}, data, { 
   repo: Object.assign({}, cleanRepo, { owner: cleanOwner }) 
 })
}

async function saveRepoData(repo) {
  const cleanedRepo = cleanGithubRepo(repo)
  const repoDetails = cleanedRepo.repo || cleanedRepo
  // await fs.ensureDir(`data/${repoDetails.owner.login}`)
  const data = JSON.stringify(cleanedRepo, null, 2)
  return fs.writeFile(`data/${repoDetails.full_name.replace('/', SLASH_REPLACEMENT)}.json`, data)
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

async function getAllStars(username, startPage = 1, maxPages = 2, dataFiles = []) {
  const perPage = 100
  const newStarsFound = []
  let page = startPage
  while (true) {
    console.log(`Getting page ${page}`)
    if (INITIAL_SEED === 'true' && page > 2) {
      await delayForInitialLoad(DELAY_PER_PAGE)
    }
    const { repos, pagination, rateLimit } = await getStarredRepos(username, page)    
    console.log(`Remaining calls: ${rateLimit.remaining} til ${rateLimit.resetTime}`)

    // Check if data folder exists and already has any of these repos 
    const newRepos = repos.filter(({ repo }) => {
      // console.log(`${repo.full_name} Already processed?`, dataFiles.includes(repo.full_name))
      return !dataFiles.includes(repo.full_name)
    })

    console.log(`Fetch retrieved ${repos.length} repos`)
    console.log(`Inside we found ${newRepos.length} new stars`)
    newStarsFound.push(...newRepos)
    console.log(`Current collection size: ${newStarsFound.length}`)
    // console.log(newRepos)
    // process.exit(1)

    if (!newRepos.length) {
      console.log('No new repos found since last check, stopping here')
      break
    }

    if (newRepos.length < perPage) {
      console.log(`Only ${newRepos.length} new repos found, stopping getStarredRepos here`)
      break
    }

    // If rate limit 0 or less than 0, wait for reset
    if (rateLimit.remaining <= 0) {
      console.log('Rate limit reached, Stopped at page', page)
      break
    }

    if (repos.length < perPage || (typeof maxPages !== 'undefined' && page >= maxPages)) {
      console.log('Last page reached, stopping')
      break
    }

    page++
  }
  return newStarsFound
}

async function getSavedRepoFilePaths() {
  let dataFiles = []
  try {
    dataFiles = await fs.readdir(RAW_DATA_FOLDER)
  } catch (e) {
    console.error(`Error reading data folder: ${e}`)
  }
  return dataFiles
}

async function getAllSavedRepoFileData() {
  const repoFilePaths = await getSavedRepoFilePaths()
  const repoFileData = await Promise.all(repoFilePaths.map(async (filePath) => {
    const data = await fs.readFile(path.join(RAW_DATA_FOLDER, filePath), 'utf8')
    return JSON.parse(data)
  }))
  return repoFileData
}

function formatRepoName(fileName) {
  return fileName.replace('.json', '').replace(SLASH_REPLACEMENT, '/')
}

async function resetData() {
  await fs.remove(RAW_DATA_FOLDER)
}

async function saveStars(username) {
  /*
  await resetData()
  //process.exit(1)
  /** */

  await fs.ensureDir(RAW_DATA_FOLDER)
  await fs.ensureDir(STARS_MD_FOLDER)


  const repoFilePaths = await getSavedRepoFilePaths()
  const alreadyProcessedRepoNames = repoFilePaths.map(formatRepoName)
  // console.log(alreadyProcessedRepoNames)
  // process.exit(1)

  let newStarsFound = []
  try {
    newStarsFound = await getAllStars(username, 1, 2, alreadyProcessedRepoNames)

    if (newStarsFound.length === 0) {
      console.log('No new stars found, stopping here')
      // return
    }

    const processFilesPromise = newStarsFound.map(async (repo) => {
      const [readmeError, readme] = await safe(getReadMe(repo))
      if (readmeError) {
        console.error(`Error getting README for ${repo.full_name}: ${readmeError}`)
      }

      const saveReadMePromise = readme ? saveReadMe(repo, readme) : Promise.resolve()

      return Promise.all([
        saveReadMePromise,
        saveRepoData(repo)
      ])
    })

    await Promise.all(processFilesPromise)

    /* Hey now you're an all star */
    const allStars = await getAllSavedRepoFileData()
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
        `[${repo}](https://github.com/${repo})`,
        numberWithCommas(rest.stars),
        rest.starredAt,
      ]
    })

    console.log(tableRows)

    generateMarkdownTable(tableRows, sortedByStarredDate.length)
    
  } catch (e) {
    console.error(`saveStars Error: ${e}`)
    process.exit(1)
  }

  return newStarsFound
}


function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function generateMarkdownTable(tableRows, sum) {
  const config = {
    transforms: {
      ALL_STARS() {
        return table([
          ['Name', 'Stars', 'Starred At'],
          ...tableRows,
        ])
      }
    }
  }

  markdownMagic(README_FILE, config, d => {
    console.log(`Updated total downloads ${sum}`)
  })
}

saveStars('davidwells').then(() => {
  console.log('done')
})
