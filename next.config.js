/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  // Add security headers for loading content from Gmail
  async headers() {
    return [
      {
        // Don't apply strict CSP in development mode
        source:
          process.env.NODE_ENV === "development" ? "/_next/static" : "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              process.env.NODE_ENV === "development"
                ? "" // Empty in development mode
                : `
                default-src 'self';
                img-src 'self' data: https://*.googleusercontent.com https://*.google.com https://gmail.com https://*.gmail.com;
                style-src 'self' 'unsafe-inline';
                script-src 'self' 'unsafe-inline' 'unsafe-eval';
                font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com;
                connect-src 'self' https://*.googleapis.com https://oauth2.googleapis.com https://*.google.com;
              `
                    .replace(/\s{2,}/g, " ")
                    .trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
