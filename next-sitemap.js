/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.saukimart.online',
  generateRobotsTxt: false,
  sitemapSize: 50000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/admin', '/api/*', '/404', '/500'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api', '/admin'],
      },
    ],
    additionalSitemaps: ['https://www.saukimart.online/sitemap.xml'],
  },
};

module.exports = config;
