"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GmailPermissionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Checking your Gmail permissions...");

  // If already logged in, check if we need to request additional scopes
  useEffect(() => {
    const checkPermissions = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        setLoading(false);
        setMessage("Please sign in to continue");
        return;
      }

      if (status === "authenticated") {
        setLoading(false);

        if (session && session.hasGmailAccess) {
          setMessage(
            "You already have Gmail access. Redirecting to Mail page..."
          );
          setTimeout(() => router.push("/mail"), 2000);
        } else {
          setMessage("Gmail permission is required to view your emails");
        }
      }
    };

    checkPermissions();
  }, [session, status, router]);

  const handleGrantAccess = () => {
    setLoading(true);
    setMessage("Redirecting to Google for permissions...");

    // Force a new auth session that will request Gmail permission
    signIn("google", {
      callbackUrl: "/mail",
      prompt: "consent", // Force Google to ask for consent again
      scope: "https://www.googleapis.com/auth/gmail.readonly", // Explicitly request Gmail scope
    });
  };

  const handleSignOut = () => {
    setLoading(true);
    setMessage("Signing you out...");
    signOut({ callbackUrl: "/auth/signin?callbackUrl=/auth/gmail-permission" });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-4">
            Gmail Access Required
          </h1>
          <div className="flex justify-center mb-6">
            <svg
              className="w-16 h-16 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300">{message}</p>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-4">
                To view your emails, this app needs permission to access your
                Gmail account.
              </p>
              <p className="text-gray-400 text-sm mb-8">
                You'll be redirected to Google's authorization page to grant
                this permission. We only request read-only access to your
                emails.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleGrantAccess}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors flex items-center justify-center"
                >
                  Grant Gmail Access
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md transition-colors"
                >
                  Sign Out and Try Another Account
                </button>

                <Link
                  href="/dashboard"
                  className="block w-full text-center py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel and return to Dashboard
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Why do we need this permission?
          </h3>
          <p className="text-xs text-gray-400">
            This app uses the Gmail API to display your latest emails directly
            in your dashboard. We only request read-only access, which means we
            can't send emails on your behalf or modify your inbox. Your data is
            only used to display information within this app.
          </p>
        </div>
      </div>
    </div>
  );
}
