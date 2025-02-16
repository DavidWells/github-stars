import path from 'path'
import { fileURLToPath } from 'url'

// Add these lines at the top to define __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { GITHUB_TOKEN } = process.env
const SLASH_REPLACEMENT = '___|___'

const JSON_DATA_FOLDER_PATH = path.join(__dirname, '..', 'data')
const STARS_MD_FOLDER_PATH = path.join(__dirname, '..', 'stars')
const README_FILE_PATH = path.join(__dirname, '..', 'README.md')

const GITHUB_USERNAME = 'davidwells'

export {
  fileURLToPath,
  GITHUB_TOKEN,
  GITHUB_USERNAME,
  JSON_DATA_FOLDER_PATH,
  STARS_MD_FOLDER_PATH,
  README_FILE_PATH,
  SLASH_REPLACEMENT,
}
