/** @type {import('next').NextConfig} */

// https://github.com/vercel/next.js/issues/48135
// https://github.com/konvajs/konva/issues/1458#issuecomment-1356122802
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    esmExternals: 'loose', // required to make react-pdf work
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }] // required to make react-pdf work
    return config
  },
}
module.exports = nextConfig
