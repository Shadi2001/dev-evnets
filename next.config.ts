/** @type {import('next').NextConfig} */
const nextConfig = {

    cacheComponents:true,
        images: {
            domains: ['res.cloudinary.com'],
        },

    experimental: {
        instrumentationHook: true,
    },
};

module.exports = nextConfig;