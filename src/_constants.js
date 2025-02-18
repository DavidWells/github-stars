import path from 'path'
import { fileURLToPath } from 'url'

// Add these lines at the top to define __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { GITHUB_TOKEN } = process.env
const GITHUB_USERNAME = 'davidwells'
const SLASH_REPLACEMENT = '___|___'

const ROOT_DIRECTORY = path.join(__dirname, '..')
const README_FILEPATH = path.join(ROOT_DIRECTORY, 'README.md')
const STARS_DIRECTORY = path.join(ROOT_DIRECTORY, 'stars')
const CACHE_DIRECTORY = path.join(ROOT_DIRECTORY, 'cache')
const JSON_CACHE_DIRECTORY = path.join(CACHE_DIRECTORY, 'data')
const STATE_CACHE_FILEPATH = path.join(CACHE_DIRECTORY, 'state.json')

export {
  fileURLToPath,
  GITHUB_TOKEN,
  GITHUB_USERNAME,
  CACHE_DIRECTORY,
  JSON_CACHE_DIRECTORY,
  STARS_DIRECTORY,
  README_FILEPATH,
  STATE_CACHE_FILEPATH,
  SLASH_REPLACEMENT,
}
