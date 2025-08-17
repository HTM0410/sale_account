module.exports = {
  siteUrl: process.env.NEXTAUTH_URL || 'https://premium-account-marketplace.netlify.app',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/dashboard/*', '/api/*'],
  generateIndexSitemap: false,
}