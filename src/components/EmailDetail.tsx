"use client";

import { useState } from "react";
import { EmailMessage } from "@/lib/gmail";

interface EmailDetailProps {
  email: EmailMessage;
  onBack: () => void;
}

export default function EmailDetail({ email, onBack }: EmailDetailProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  // Format the date with full details
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to sanitize and render HTML content safely
  const renderHtmlContent = () => {
    // If it's HTML content, create a container with controlled rendering
    if (
      email.payload.mimeType?.includes("html") ||
      email.body.includes("<html") ||
      email.body.includes("<div")
    ) {
      const sanitizedHtml = email.body
        // Remove potentially harmful tags and attributes
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/on\w+="[^"]*"/g, "")
        .replace(/on\w+='[^']*'/g, "");

      return (
        <div
          className="mt-4 p-4 bg-gray-950 rounded border border-gray-800 overflow-auto"
          style={{ maxHeight: "60vh" }}
        >
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        </div>
      );
    }

    // Otherwise render as plain text with line breaks
    return (
      <div className="mt-4 whitespace-pre-wrap text-gray-300 font-light">
        {email.body}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Header with back button */}
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-gray-300 hover:text-white flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to inbox
        </button>
      </div>

      {/* Email content */}
      <div className="p-6">
        <h2 className="text-2xl font-serif font-semibold mb-4">
          {email.subject || "(No subject)"}
        </h2>

        <div className="flex justify-between items-baseline mb-4">
          <div>
            <div className="text-gray-300 mb-1">
              <span className="text-gray-500">From:</span> {email.from}
            </div>
            <div className="text-gray-300 mb-1">
              <span className="text-gray-500">To:</span> {email.to}
            </div>
          </div>
          <div className="text-sm text-gray-400">{formatDate(email.date)}</div>
        </div>

        <div className="border-t border-gray-800 pt-4 mt-4">
          {showFullContent ? (
            renderHtmlContent()
          ) : (
            <>
              <div className="text-gray-300 mb-4 line-clamp-5">
                {email.body ? email.body.substring(0, 300) : email.snippet}...
              </div>
              <button
                onClick={() => setShowFullContent(true)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Show full message
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50">
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="text-sm text-gray-300 hover:text-white flex items-center"
          >
            Back to inbox
          </button>

          <a
            href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
          >
            View in Gmail
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
