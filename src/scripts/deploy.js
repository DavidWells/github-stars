import ghpages from 'gh-pages'
import { SITE_DIRECTORY } from '../_constants.js'

async function setupGhPages() {
  try {
    await ghpages.publish(SITE_DIRECTORY)
    console.log('Successfully deployed to gh-pages')
  } catch (err) {
    console.error('Failed to deploy:', err)
  }
}

setupGhPages()
