/** @type {import('next').NextConfig} */
const nextConfig = {

    typescript:{
        ignoreBuildErrors:true,
    },

    cacheComponents:true,
        images: {
            domains: ['res.cloudinary.com'],
        },

    experimental: {
        instrumentationHook: true,
    },
};

module.exports = nextConfig;