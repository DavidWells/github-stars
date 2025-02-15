import fs from 'fs-extra'
import path from 'path'
import { 
  RAW_DATA_FOLDER, 
  STARS_MD_FOLDER, 
  SLASH_REPLACEMENT 
} from '../_constants.js'

function formatRepoName(fileName) {
  return fileName.replace('.json', '').replace(SLASH_REPLACEMENT, '/')
}

async function getCleanedRepoNames() {
  const repoFilePaths = await getSavedJSONFilePaths()
  const alreadyProcessedRepoNames = repoFilePaths.map(formatRepoName)
  return alreadyProcessedRepoNames
}

async function getSavedJSONFilePaths() {
  let dataFiles = []
  try {
    dataFiles = await fs.readdir(RAW_DATA_FOLDER)
  } catch (e) {
    console.error(`Error reading data folder: ${e}`)
  }
  return dataFiles
}

async function getSavedJSONFileData() {
  const repoFilePaths = await getSavedJSONFilePaths()
  const repoFileData = await Promise.all(repoFilePaths.map(async (filePath) => {
    const data = await fs.readFile(path.join(RAW_DATA_FOLDER, filePath), 'utf8')
    return JSON.parse(data)
  }))
  return repoFileData
}

async function resetDirectories() {
  await fs.remove(RAW_DATA_FOLDER)
  await fs.remove(STARS_MD_FOLDER)
}

async function initDirectories() {
  await fs.ensureDir(RAW_DATA_FOLDER)
  await fs.ensureDir(STARS_MD_FOLDER)
}

export {
  getCleanedRepoNames,
  getSavedJSONFilePaths,
  getSavedJSONFileData,
  initDirectories,
  resetDirectories,
}
