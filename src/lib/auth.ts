import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // Error code passed in query string as ?error=
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        console.log("Initial sign in, setting token with account data");
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at ? account.expires_at * 1000 : 0,
          scope: account.scope,
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < token.expiresAt) {
        console.log("Token still valid, returning existing token");
        return token;
      }

      // Access token has expired, try to refresh it
      console.log("Token has expired, attempting to refresh");

      if (!token.refreshToken) {
        console.log("No refresh token available, cannot refresh");
        return token;
      }

      try {
        // Attempt to refresh the token
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
          }),
        });

        const refreshedTokens = await response.json();
        console.log("Token refreshed successfully");

        if (!response.ok) {
          console.error("Failed to refresh token:", refreshedTokens);
          return token;
        }

        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
        };
      } catch (error) {
        console.error("Error refreshing token:", error);
        return token;
      }
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      console.log("Setting session access token from JWT token");
      session.accessToken = token.accessToken;
      session.scope = token.scope;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
