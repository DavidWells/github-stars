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

async function resetDirectories() {
  await fs.remove(JSON_CACHE_DIRECTORY)
  await fs.remove(STARS_DIRECTORY)
}

async function initDirectories() {
  await fs.ensureDir(JSON_CACHE_DIRECTORY)
  await fs.ensureDir(STARS_DIRECTORY)
}

export {
  getState,
  saveState,
  getCleanedRepoNames,
  getSavedJSONFilePaths,
  getSavedJSONFileData,
  initDirectories,
  resetDirectories,
}
