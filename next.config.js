module.exports = {
    experimental: {
      missingSuspenseWithCSRBailout: false,
    },
  }
  const nextConfig = {
    env: {
      KINDE_SITE_URL: process.env.KINDE_SITE_URL ?? `https://${process.env.VERCEL_URL}`,
      KINDE_POST_LOGOUT_REDIRECT_URL:
        process.env.KINDE_POST_LOGOUT_REDIRECT_URL ?? `https://${process.env.VERCEL_URL}`,
      KINDE_POST_LOGIN_REDIRECT_URL:
        process.env.KINDE_POST_LOGIN_REDIRECT_URL ?? `https://${process.env.VERCEL_URL}/dashboard`
    }
  };
  
  module.exports = nextConfig;