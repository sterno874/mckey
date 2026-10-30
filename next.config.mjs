/** @type {import('next').NextConfig} */
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig = {
  ...(staticExport
    ? {
        output: "export",
        images: { unoptimized: true },
      }
    : {}),
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
};

export default nextConfig;
