"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import MailList from "@/components/MailList";
import TimeWeatherWidget from "@/components/TimeWeatherWidget";
import { useEffect, useState } from "react";
import { GMAIL_SCOPE } from "@/lib/auth";

export default function MailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasGmailAccess, setHasGmailAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Check if the user has Gmail access through the scope
      const scope = session.scope as string | undefined;
      setHasGmailAccess(scope?.includes(GMAIL_SCOPE) || false);
    } else if (status === "unauthenticated") {
      setHasGmailAccess(false);
    }
  }, [session, status]);

  // Show UI based on authorization state
  const renderContent = () => {
    // Loading state
    if (
      status === "loading" ||
      (status === "authenticated" && hasGmailAccess === null)
    ) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-300">Loading...</p>
        </div>
      );
    }

    // Not signed in
    if (status === "unauthenticated") {
      return (
        <div className="text-center py-12">
          <h2 className="text-3xl font-serif font-semibold mb-4">
            Sign in to view your emails
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Connect your Google account to access your Gmail inbox
          </p>
          <Link
            href="/auth/signin?callbackUrl=/mail"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors font-medium inline-block"
          >
            Sign In
          </Link>
        </div>
      );
    }

    // Signed in but missing Gmail permission
    if (status === "authenticated" && hasGmailAccess === false) {
      return (
        <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
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
          <h2 className="text-2xl font-serif font-semibold mb-4">
            Gmail Access Required
          </h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            To view your emails, you need to grant permission to access your
            Gmail account. This app only requests read-only access.
          </p>
          <Link
            href="/auth/gmail-permission"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors font-medium inline-block"
          >
            Grant Gmail Access
          </Link>
        </div>
      );
    }

    // Fully authenticated with Gmail access
    return (
      <div className="max-w-3xl mx-auto">
        <MailList />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Time and Weather Widget */}
        <div className="mb-4">
          <TimeWeatherWidget />
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-4xl font-serif font-semibold mb-2">Your Mail</h2>
          <p className="text-gray-400">View your latest emails from Gmail</p>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
