import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // 90 is used for the service photos (sharper at card size); 75 stays the default.
    qualities: [75, 90],
  },
};

export default nextConfig;
