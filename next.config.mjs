// Configure for static export (GitHub Pages)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export',
	trailingSlash: true,
	basePath,
	assetPrefix: basePath,
	images: {
		// Required for next export when using next/image
		unoptimized: true,
	},
	eslint: {
		// Allow export even if lint errors exist; safe for static deploy
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
