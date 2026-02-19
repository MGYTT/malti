/** @type {import('next').NextConfig} */

const SECURITY_HEADERS = [
  // Blokuje osadzanie w iframe (clickjacking)
  {
    key:   "X-Frame-Options",
    value: "DENY",
  },
  // Blokuje MIME sniffing
  {
    key:   "X-Content-Type-Options",
    value: "nosniff",
  },
  // Wymusza HTTPS przez 2 lata
  {
    key:   "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Kontroluje dane referrer
  {
    key:   "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Blokuje dostęp do kamery, mikrofonu, geolokalizacji
  {
    key:   "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Wyłącza przestarzałą ochronę XSS
  {
    key:   "X-XSS-Protection",
    value: "0",
  },
  // Content Security Policy
  {
    key:   "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,

  // Ukrywa nagłówek "X-Powered-By: Next.js"
  poweredByHeader: false,

  // Blokuje source maps w produkcji
  productionBrowserSourceMaps: false,

  // Optymalizacja zdjęć (avatar.jpg)
  images: {
    unoptimized: false,
  },

  async headers() {
    return [
      {
        source:  "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

module.exports = nextConfig;
