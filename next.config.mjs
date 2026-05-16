/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1', port: '54321', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'static.wixstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'masterspc.com.co', pathname: '/**' },
    ],
  },
}

export default nextConfig
