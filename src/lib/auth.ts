import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

// Scopes needed for the application
export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
export const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
export const BASE_SCOPES = "openid email profile";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: `${BASE_SCOPES} ${CALENDAR_SCOPE} ${GMAIL_SCOPE}`,
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
        console.log("Scope received:", account.scope);

        // Always log the scopes we get to help debug permission issues
        if (account.scope) {
          const hasGmail = account.scope.includes(GMAIL_SCOPE);
          console.log(`Gmail scope granted: ${hasGmail ? "Yes" : "No"}`);
        }

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
        // Clear the invalid token and force re-authentication
        return {
          ...token,
          accessToken: undefined,
          error: "RefreshTokenNotAvailable",
        };
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

        if (!response.ok) {
          console.error("Failed to refresh token:", refreshedTokens);

          // Clear the invalid tokens and force re-authentication
          return {
            ...token,
            accessToken: undefined,
            refreshToken: undefined,
            error: "RefreshAccessTokenError",
          };
        }

        console.log("Token refreshed successfully");

        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
          // Update refresh token if provided, else keep the old one
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
      } catch (error) {
        console.error("Error refreshing token:", error);

        // Clear the invalid tokens and force re-authentication
        return {
          ...token,
          accessToken: undefined,
          refreshToken: undefined,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      console.log("Setting session access token from JWT token");
      session.accessToken = token.accessToken;
      session.scope = token.scope;
      session.error = token.error;

      // Check if we have the Gmail scope
      if (token.scope && typeof token.scope === "string") {
        session.hasGmailAccess = token.scope.includes(GMAIL_SCOPE);
        console.log(
          `Session has Gmail access: ${session.hasGmailAccess ? "Yes" : "No"}`
        );
      } else {
        session.hasGmailAccess = false;
        console.log("No scope found in token, setting hasGmailAccess to false");
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signOut({ token }) {
      // Clear any server-side state when the user signs out
      console.log("User signed out, clearing token state");
    },
  },
};
