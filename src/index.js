import fs from 'fs-extra'
import safe from 'safe-await'
import pLimit from 'p-limit'
import { delay } from './utils/delay.js'
import { generateMarkdownTable } from './utils/generate-readme.js'
import { saveReadMe } from './utils/generate-star-md.js'
import { getStarredRepos, getReadMe, getRawReadMe, getRepoHash } from './utils/github-api.js'
import { saveToJSONFile } from './utils/generate-json.js'
import { getCleanedRepoNames, getSavedJSONFileData,initDirectories, resetDirectories, saveState } from './utils/fs.js'
import {
  GITHUB_TOKEN,
  GITHUB_USERNAME,
} from './_constants.js'

if (!GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is not set')
}

const { INITIAL_SEED } = process.env

const DELAY_PER_PAGE = 2000

async function getAllStars({
  username,
  pageStart = 1,
  // If not provided, will go until rate limit is reached
  maxPages = Infinity,
  delayPerPage = DELAY_PER_PAGE,
  dataFiles = [],
  refreshAll = false
}) {
  const perPage = 100
  const allReposFound = []
  const newReposFound = []

  let rateLimitState = {}
  let noNewStarsFound = false
  let someNewStarsFound = false
  let page = pageStart

  /* Recursively get all stars */
  while (true) {
    console.log(`Getting page ${page}...`)
    if (INITIAL_SEED === 'true' && page > 2) {
      await delay(delayPerPage)
    }
    const { repos, pagination, rateLimit } = await getStarredRepos(username, page)    
    console.log(`Remaining calls: ${rateLimit.remaining} til ${rateLimit.resetTime}`)

    /* Save all repos found */
    console.log(`Fetch retrieved ${repos.length} repos`)
    allReposFound.push(...repos)
    console.log(`Current stars collection: ${newReposFound.length}`)

    /* Save rate limit state */
    rateLimitState = rateLimit

    /* Check if data folder exists and already has any of these repos */
    const newRepos = repos.filter(({ repo }) => {
      // console.log('New repo found:', repo.full_name)
      // console.log(`${repo.full_name} Already processed?`, dataFiles.includes(repo.full_name))
      return !dataFiles.includes(repo.full_name)
    })

    if (newRepos.length > 0) {
      someNewStarsFound = true
    }
    /* Save new repos found */
    console.log(`Inside we found ${newRepos.length} new stars`)
    newReposFound.push(...newRepos)
    console.log(`Current NEW stars collection: ${newReposFound.length}`)

    /* Stop if no new repos found and not refreshing all */
    if (!newRepos.length && !refreshAll) {
      console.log('[Nothing new detected] No new repos found since last check, stopping loop here')
      noNewStarsFound = true
      break
    }

    /* Stop if no new repos found and not refreshing all */
    if (newRepos.length < perPage && !refreshAll) {
      console.log(`[New stars detected] ${newRepos.length} new repos found, stopping loop here`)
      break
    }

    /* Stop if rate limit is 0 or less than 0 */
    if (rateLimit.remaining <= 0) {
      console.log('Rate limit reached, Stopped at page', page)
      console.log('Resume this process later')
      break
    }

    /* Stop if last page reached */
    if (repos.length < perPage || (typeof maxPages !== 'undefined' && page >= maxPages)) {
      console.log('Last page reached, stopping loop here')
      break
    }

    page++
  }

  if (noNewStarsFound && !refreshAll) {
    const persistedStars = await getSavedJSONFileData()
    return {
      repos: persistedStars,
      newRepos: newReposFound,
      initialPage: pageStart,
      lastPage: page,
      rateLimitState,
      via: 'File system'
    }
  }

  if (someNewStarsFound && !refreshAll) {
    // Combine persisted stars with new stars and make sure no duplicates
    const persistedStars = await getSavedJSONFileData()
    const combinedStars = [...persistedStars, ...newReposFound]
    const uniqueStars = combinedStars.filter((star, index, self) => {
      const existingIndex = self.findIndex((t) => t.repo.full_name === star.repo.full_name)
      return existingIndex === index
    })

    console.log('persistedStars', persistedStars.length)
    console.log('newReposFound', newReposFound.length)
    console.log('combinedStars', combinedStars.length)
    console.log('uniqueStars', uniqueStars.length)

    return {
      repos: uniqueStars,
      newRepos: newReposFound,
      initialPage: pageStart,
      lastPage: page,
      rateLimitState,
      via: 'GitHub API and File system'
    }
  }

  return {
    repos: refreshAll ? allReposFound : newReposFound,
    newRepos: newReposFound,
    initialPage: pageStart,
    lastPage: page,
    rateLimitState,
    via: 'GitHub API'
  }
}

async function setup(username) {
  /* Initialize directories, if they don't exist */
  await initDirectories()

  const alreadyProcessedRepoNames = await getCleanedRepoNames()

  const githubStarData = await getAllStars({
    username,
    pageStart: 1,
    maxPages: 30,
    dataFiles: alreadyProcessedRepoNames,
    refreshAll: true,
  })

  console.log('All stars found', githubStarData.repos.length)
  console.log('New stars found', githubStarData.newRepos.length)
  console.log('initialPage', githubStarData.initialPage)
  console.log('lastPage', githubStarData.lastPage)
  console.log('rateLimitState', githubStarData.rateLimitState)
  console.log('via', githubStarData.via)

  const state = {
    lastRun: new Date().toISOString(),
    run: {
      startPage: githubStarData.initialPage,
      endPage: githubStarData.lastPage,
      count: githubStarData.repos.length,
      via: githubStarData.via,
    },
    totalRepos: githubStarData.repos.length,
    newRepos: githubStarData.newRepos.length,
    rateLimitState: githubStarData.rateLimitState,
  }

  console.log('state', state)

  // Save lastPage and initialPage to file state.json file
  await saveState(state)

  /* Process all repos found and save to JSON */
  const processFilesPromise = githubStarData.newRepos.map(async (repo) => {
    return saveToJSONFile(repo)
  })

  const filePaths = await Promise.all(processFilesPromise)
  console.log('finished saving', filePaths.length)
  console.log('filePaths', filePaths)

  await generateMarkdownTable({
    excludePrivateRepos: true
  })

  /* Half the rate limit per hour. to avoid rate limit */
  const GITHUB_API_LIMIT = 2500
  const limit = pLimit(3)
  /* Resolve un-fetched readmes */
  const readMes = (await readMesToFetch(githubStarData.newRepos)).slice(0, GITHUB_API_LIMIT)
  console.log('Repos that need a README saved', readMes.length)

  const readMePaths = await Promise.all(
    readMes.map(repo => {
      limit(async () => {
        const [readmeError, readme] = await safe(getReadMe(repo))
        return readme ? saveReadMe(repo, readme) : Promise.resolve()
      })
    })
  )

  console.log(`Wrote ${readMePaths.length} README files`)

  if (githubStarData.rateLimitState.remaining <= 0) {
    console.log('Rate limit reached, stopping here')
    process.exit(1)
  }
}

async function saveStars(username) {
  /* // Clear everything
  await resetJSONData()
  await resetMarkdownData()
  process.exit(1)
  /** */

  /* Initialize directories */
  await initDirectories()

  const alreadyProcessedRepoNames = await getCleanedRepoNames()
  // console.log(alreadyProcessedRepoNames)
  // process.exit(1)

  let newReposFound = []
  try {
    newReposFound = await getAllStars({
      username,
      pageStart: 1,
      maxPages: 2,
      dataFiles: alreadyProcessedRepoNames,
    })

    if (newReposFound.length === 0) {
      console.log('No new stars found, stopping here')
      // return
    }

    const processFilesPromise = newReposFound.map(async (repo) => {
      const [readmeError, readme] = await safe(getReadMe(repo))
      if (readmeError) {
        console.error(`Error getting README for ${repo.full_name}: ${readmeError}`)
      }

      const saveReadMePromise = readme ? saveReadMe(repo, readme) : Promise.resolve()

      return Promise.all([
        saveReadMePromise,
        saveToJSONFile(repo)
      ])
    })

    await Promise.all(processFilesPromise)
    // fs.writeFileSync('table.md', JSON.stringify(tableRows, null, 2))

    await generateMarkdownTable(sortedByStarredDate)
    
  } catch (e) {
    console.error(`saveStars Error: ${e}`)
    process.exit(1)
  }

  return newReposFound
}

// if (INITIAL_SEED === 'true') {
//   setup(GITHUB_USERNAME).then(() => {
//     console.log('script done')
//   })
// } else {
//   saveStars(GITHUB_USERNAME).then(() => {
//     console.log('script done')
//   })
// }

setup(GITHUB_USERNAME).then(() => {
  console.log('script done')
})

// getSavedJSONFileData().then((data) => {
//   console.log('data', data.length)
// })
// getRepoHash('addyosmani/firew0rks').then((hash) => {
//   console.log('hash', hash)
// })

// getGitHashFromDate('jason-m-hicks/github-stars', '2024-01-01').then((hash) => {
//   console.log('hash', hash)
// })

// getRawReadMe({
//   full_name: 'addyosmani/firew0rks',
//   default_branch: 'main',
// }).then((data) => {
//   console.log('data', data)
// })

// setup(GITHUB_USERNAME).then(() => {
//   console.log('script done')
// })