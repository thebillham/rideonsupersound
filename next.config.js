const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'hmn.exu.mybluehost.me',
      'ross.syd1.cdn.digitaloceanspaces.com',
      'img.discogs.com',
      'i.discogs.com',
      'books.google.com',
    ],
  },
  eslint: {
    dirs: ['components', 'features', 'lib', 'pages', 'views'],
  },
  trailingSlash: false,
})
