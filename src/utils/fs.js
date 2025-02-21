import fs from 'fs-extra'
import path from 'path'
import { 
  JSON_CACHE_DIRECTORY, 
  STARS_DIRECTORY, 
  STATE_CACHE_FILEPATH,
  SLASH_REPLACEMENT 
} from '../_constants.js'

function formatRepoName(fileName) {
  return fileName.replace('.json', '').replace(SLASH_REPLACEMENT, '/')
}

async function saveState(state) {
  await fs.writeFile(STATE_CACHE_FILEPATH, JSON.stringify(state, null, 2))
}

async function getState() {
  const state = await fs.readFile(STATE_CACHE_FILEPATH, 'utf8')
  return JSON.parse(state)
}

async function getCleanedRepoNames() {
  const repoFilePaths = await getSavedJSONFilePaths()
  const alreadyProcessedRepoNames = repoFilePaths.map(formatRepoName)
  return alreadyProcessedRepoNames
}

async function getSavedJSONFilePaths() {
  let dataFiles = []
  try {
    // filter out any non .json files
    dataFiles = await fs.readdir(JSON_CACHE_DIRECTORY)
    dataFiles = dataFiles.filter((file) => file.endsWith('.json'))
  } catch (e) {
    console.error(`Error reading data folder: ${e}`)
  }
  return dataFiles
}

async function getSavedMdFilePaths() {
  try {
    // Get all .md files recursively
    const files = await fs.readdir(STARS_DIRECTORY, { recursive: true })
    
    // Filter for .md files and format paths
    const mdFiles = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        // Remove .md extension
        const withoutExt = file.slice(0, -3)
        // Split into org/repo format
        const [org, repo] = withoutExt.split('/')
        return {
          path: file,
          fullPath: `${STARS_DIRECTORY}/${file}`,
          org,
          repo,
          fullName: withoutExt
        }
      })

    return mdFiles
  } catch (error) {
    console.error('Error reading saved markdown files:', error)
    return []
  }
}

async function getSavedJSONFileData() {
  const repoFilePaths = await getSavedJSONFilePaths()
  const repoFileData = await Promise.all(repoFilePaths.map(async (filePath) => {
    const data = await fs.readFile(path.join(JSON_CACHE_DIRECTORY, filePath), 'utf8')
    try {
      const json = JSON.parse(data)
      return json
    } catch (e) {
      console.error(`Error parsing JSON file: ${filePath}`)
      throw e
    }
  }))
  return repoFileData
}

async function readMesToFetch(githubStarData) {
  const results = await Promise.all(
    githubStarData.map(async (item) => {
      const repo = item.repo
      const readmePath = `${STARS_DIRECTORY}/${repo.full_name}.md`
      try {
        const itExists = await fs.pathExists(readmePath)
        if (itExists) {
          return null
        }
      } catch(e) {
        return item // README doesn't exist
      }
      return item
    })
  )

  const reposNeedingReadme = results.filter((item) => item !== null)
  return reposNeedingReadme
}

/*  
const githubStarData = await getSavedJSONFileData()
readMesToFetch(githubStarData).then((repos) => {
  console.log('repos', repos)
})
/** */

async function fileDoesNotExist(filePath) {
  try {
    const exists = await fs.pathExists(filePath)
    return !exists
  } catch (e) {
    // console.error(`Error checking file existence: ${e}`)
  }
  return false
}
async function resetDirectories() {
  await fs.remove(JSON_CACHE_DIRECTORY)
  await fs.remove(STARS_DIRECTORY)
}

async function initDirectories() {
  await fs.ensureDir(JSON_CACHE_DIRECTORY)
  await fs.ensureDir(STARS_DIRECTORY)
}

export {
  fileDoesNotExist,
  readMesToFetch,
  getState,
  saveState,
  getCleanedRepoNames,
  getSavedJSONFilePaths,
  getSavedJSONFileData,
  initDirectories,
  resetDirectories,
  getSavedMdFilePaths,
}
