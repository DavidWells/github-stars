import ghpages from 'gh-pages'
import { generateStaticSite } from '../utils/generate-site.js'
import { SITE_DIRECTORY } from '../_constants.js'

async function buildAndDeploy() {
  /* Generate the static site */
  await generateStaticSite()

  /* Deploy the static site */
  try {
    await ghpages.publish(SITE_DIRECTORY)
    console.log('Successfully deployed to gh-pages')
  } catch (err) {
    console.error('Failed to deploy:', err)
  }
}

buildAndDeploy()
