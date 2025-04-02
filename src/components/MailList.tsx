"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { EmailMessage } from "@/lib/gmail";
import Link from "next/link";
import EmailDetail from "./EmailDetail";

export default function MailList() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      if (status === "loading") return;

      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching emails from API");

        // Check if we have Gmail permission first
        if (session.hasGmailAccess === false) {
          console.log("No Gmail permission in session");
          throw new Error(
            "Gmail access permission required. You need to grant permission to access your Gmail account."
          );
        }

        // Log the current session scope for debugging
        if (session.scope) {
          console.log("Current session scope:", session.scope);
          console.log("Has Gmail access:", session.hasGmailAccess);
        } else {
          console.log("No scope found in session");
        }

        const response = await fetch("/api/mail");

        // Log full response for debugging
        console.log("API response status:", response.status);

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
            console.error("Error response from mail API:", errorData);
          } catch (e) {
            console.error("Failed to parse error response:", e);
            errorData = {
              error: `Server returned ${response.status} ${response.statusText}`,
            };
          }

          if (response.status === 403) {
            if (errorData.action === "gmail-permission") {
              throw new Error(
                "Gmail access permission required. You need to grant permission to access your Gmail account."
              );
            } else if (errorData.action === "reauthenticate") {
              throw new Error(
                "Session expired. You need to sign out and sign in again to refresh your access."
              );
            } else {
              throw new Error(
                errorData.error ||
                  "Failed to fetch emails due to permission issues"
              );
            }
          }

          throw new Error(errorData.error || "Failed to fetch emails");
        }

        const data = await response.json();
        console.log(`Received emails from API:`, data);

        if (data.emails && Array.isArray(data.emails)) {
          setEmails(data.emails);
          console.log(`Processed ${data.emails.length} emails`);
        } else {
          console.error("Unexpected API response format:", data);
          setError("Received unexpected data format from server");
        }
      } catch (error: any) {
        console.error("Error fetching emails:", error);
        setError(error.message || "Failed to fetch emails");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, [session, status]);

  // Format the sender (extract name if available)
  const formatSender = (from: string) => {
    const match = from.match(/([^<]+)/);
    return match ? match[0].trim() : from;
  };

  // Format the date to a user-friendly format
  const formatDate = (date: Date) => {
    const now = new Date();
    const emailDate = new Date(date);

    // Same day, just show time
    if (
      emailDate.getDate() === now.getDate() &&
      emailDate.getMonth() === now.getMonth() &&
      emailDate.getFullYear() === now.getFullYear()
    ) {
      return emailDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Within the last 7 days, show day of week
    const diffTime = Math.abs(now.getTime() - emailDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return emailDate.toLocaleDateString("en-US", { weekday: "short" });
    }

    // Otherwise show date
    return emailDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-serif font-semibold mb-4">
          Sign in to view your emails
        </h2>
        <p className="text-gray-400 mb-8">
          You need to sign in with your Google account to access your emails
        </p>
      </div>
    );
  }

  if (error) {
    const isPermissionIssue =
      error.includes("Gmail access") ||
      error.includes("permission") ||
      error.includes("scope") ||
      error.includes("Forbidden");

    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center max-w-3xl mx-auto my-8">
        <h3 className="text-xl text-red-300 font-medium mb-4">
          Error Loading Emails
        </h3>
        <p className="text-red-200 mb-4">{error}</p>

        <div className="mt-6">
          <p className="text-gray-300 mb-6">
            {isPermissionIssue
              ? "You need to grant permission to access your Gmail account. We've created a special page to help you through this process."
              : "Please try signing out and back in to resolve this issue."}
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            {isPermissionIssue ? (
              <Link
                href="/auth/gmail-permission"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Grant Gmail Access
              </Link>
            ) : (
              <button
                onClick={() =>
                  signOut({ callbackUrl: "/auth/signin?callbackUrl=/mail" })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Sign Out and Reconnect
              </button>
            )}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 px-4 py-2 border border-blue-800 rounded-md flex items-center justify-center"
            >
              Manage Google Permissions
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-400">Loading your emails...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-4">No emails found</h3>
        <p className="text-gray-400">
          Your inbox is empty or we couldn't retrieve your emails.
        </p>
      </div>
    );
  }

  // If an email is selected, show the email detail view
  if (selectedEmail) {
    return (
      <EmailDetail
        email={selectedEmail}
        onBack={() => setSelectedEmail(null)}
      />
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-serif text-lg font-semibold">Latest Emails</h3>
        <span className="text-sm text-gray-400">{emails.length} messages</span>
      </div>

      <div className="divide-y divide-gray-800">
        {emails.map((email) => (
          <div
            key={email.id}
            className="px-4 py-3 hover:bg-gray-800/50 transition-colors cursor-pointer flex flex-col"
            onClick={() => setSelectedEmail(email)}
          >
            <div className="flex justify-between items-baseline mb-1">
              <div className="font-medium">{formatSender(email.from)}</div>
              <div className="text-xs text-gray-400 ml-2">
                {formatDate(email.date)}
              </div>
            </div>

            <div className="font-medium text-gray-200 text-sm mb-1 truncate">
              {email.subject || "(No subject)"}
            </div>

            <div className="text-xs text-gray-400 line-clamp-1">
              {email.snippet}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50">
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center"
        >
          Open in Gmail
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
