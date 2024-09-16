// lib/auth.ts
import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";
import { prisma } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export const auth = lucia({
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: nextjs_future(),
  adapter: prisma(client),
  
  getUserAttributes: (data) => {
    return {
      name: data.name,
      email: data.email,
    };
  },
});

export type Auth = typeof auth;