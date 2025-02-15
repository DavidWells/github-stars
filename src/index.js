import fs from 'fs-extra'
import safe from 'safe-await'
import { delay } from './utils/delay.js'
import { generateMarkdownTable } from './utils/generate-readme.js'
import { saveReadMe } from './utils/generate-star-md.js'
import { getStarredRepos, getReadMe, getRepoHash } from './utils/github-api.js'
import { saveToJSONFile } from './utils/generate-json.js'
import { getCleanedRepoNames, initDirectories, resetDirectories } from './utils/fs.js'
import {
  INITIAL_SEED,
  GITHUB_TOKEN,
  DELAY_PER_PAGE,
  SLASH_REPLACEMENT,
  RAW_DATA_FOLDER,
  STARS_MD_FOLDER,
  README_FILE,
  GITHUB_USERNAME,
} from './_constants.js'

if (!GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is not set')
}

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
  let rateLimitState = {}
  const allStarsFound = []
  const newStarsFound = []
  let page = pageStart
  while (true) {
    console.log(`Getting page ${page}`)
    if (INITIAL_SEED === 'true' && page > 2) {
      await delay(delayPerPage)
    }
    const { repos, pagination, rateLimit } = await getStarredRepos(username, page)    
    console.log(`Remaining calls: ${rateLimit.remaining} til ${rateLimit.resetTime}`)

    /* Save all repos found */
    console.log(`Fetch retrieved ${repos.length} repos`)
    allStarsFound.push(...repos)
    console.log(`Current stars collection: ${newStarsFound.length}`)

    /* Save rate limit state */
    rateLimitState = rateLimit

    /* Check if data folder exists and already has any of these repos */
    const newRepos = repos.filter(({ repo }) => {
      // console.log(`${repo.full_name} Already processed?`, dataFiles.includes(repo.full_name))
      return !dataFiles.includes(repo.full_name)
    })

    /* Save new repos found */
    console.log(`Inside we found ${newRepos.length} new stars`)
    newStarsFound.push(...newRepos)
    console.log(`Current NEW stars collection: ${newStarsFound.length}`)

    /* Stop if no new repos found and not refreshing all */
    if (!newRepos.length && !refreshAll) {
      console.log('No new repos found since last check, stopping here')
      break
    }

    /* Stop if no new repos found and not refreshing all */
    if (newRepos.length < perPage && !refreshAll) {
      console.log(`Only ${newRepos.length} new repos found, stopping getStarredRepos here`)
      break
    }

    /* Stop if rate limit is 0 or less than 0 */
    if (rateLimit.remaining <= 0) {
      console.log('Rate limit reached, Stopped at page', page)
      break
    }

    /* Stop if last page reached */
    if (repos.length < perPage || (typeof maxPages !== 'undefined' && page >= maxPages)) {
      console.log('Last page reached, stopping')
      break
    }

    page++
  }
  return {
    repos: refreshAll ? allStarsFound : newStarsFound,
    initialPage: pageStart,
    lastPage: page,
    rateLimitState
  }
}

async function setup(username) {
  const alreadyProcessedRepoNames = await getCleanedRepoNames()
  // console.log(alreadyProcessedRepoNames)
  // process.exit(1)
  const githubStarData = await getAllStars({
    username,
    pageStart: 1,
    maxPages: 4,
    dataFiles: alreadyProcessedRepoNames,
    refreshAll: true,
  })

  console.log('starsFound', githubStarData.repos.length)
  console.log('initialPage', githubStarData.initialPage)
  console.log('lastPage', githubStarData.lastPage)
  console.log('rateLimitState', githubStarData.rateLimitState)
  // console.log('githubStarData', githubStarData)
  // process.exit(1)

  /* Initialize directories */
  await initDirectories()

  /* Process all repos found and save to JSON */
  const processFilesPromise = githubStarData.repos.map(async (repo) => {
    return saveToJSONFile(repo)
  })

  const filePaths = await Promise.all(processFilesPromise)

  console.log('finished saving', filePaths.length)
  console.log('filePaths', filePaths)
}

async function saveStars(username) {
  /* // Clear everything
  await resetJSONData()
  await resetMarkdownData()
  process.exit(1)
  /** */

  await fs.ensureDir(RAW_DATA_FOLDER)
  await fs.ensureDir(STARS_MD_FOLDER)


  const alreadyProcessedRepoNames = await getCleanedRepoNames()
  // console.log(alreadyProcessedRepoNames)
  // process.exit(1)

  let newStarsFound = []
  try {
    newStarsFound = await getAllStars({
      username,
      pageStart: 1,
      maxPages: 2,
      dataFiles: alreadyProcessedRepoNames,
    })

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

  return newStarsFound
}

// if (INITIAL_SEED === 'true') {

// } else {
//   saveStars(GITHUB_USERNAME).then(() => {
//     console.log('script done')
//   })
// }
console.log('Starting script')

// getRepoHash('addyosmani/firew0rks').then((hash) => {
//   console.log('hash', hash)
// })


generateMarkdownTable().then(() => {
  console.log('script done')
})

// setup(GITHUB_USERNAME).then(() => {
//   console.log('script done')
// })