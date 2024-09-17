import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export const GET = handleAuth({
    postLoginRedirectURL: "/api/auth/kinde-callback",
  });