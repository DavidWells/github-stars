import path from 'path'
import { fileURLToPath } from 'url'

// Add these lines at the top to define __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { INITIAL_SEED, GITHUB_TOKEN } = process.env
const DELAY_PER_PAGE = 2000
const SLASH_REPLACEMENT = '___|___'

const RAW_DATA_FOLDER = path.join(__dirname, '..', 'data')
const STARS_MD_FOLDER = path.join(__dirname, '..', 'stars')
const README_FILE = path.join(__dirname, '..', 'README.md')

const GITHUB_USERNAME = 'davidwells'

export {
  fileURLToPath,
  INITIAL_SEED,
  GITHUB_TOKEN,
  DELAY_PER_PAGE,
  SLASH_REPLACEMENT,
  RAW_DATA_FOLDER,
  STARS_MD_FOLDER,
  README_FILE,
  GITHUB_USERNAME,
}
