"use client";

import { Note } from "@/types";
import { useEffect, useState } from "react";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onAddToCalendar: (id: string) => void;
  calendarStatus: {
    noteId: string;
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  };
}

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  onAddToCalendar,
  calendarStatus,
}: NoteCardProps) {
  const [plainTextContent, setPlainTextContent] = useState("");

  // Extract plain text from HTML content
  useEffect(() => {
    if (note.content) {
      // Create a temporary DOM element to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = note.content;

      // Get the text content
      const text = tempDiv.textContent || tempDiv.innerText || "";
      setPlainTextContent(text);
    }
  }, [note.content]);

  // Truncate content for preview
  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="note-card group flex flex-col h-full cursor-pointer"
      onClick={() => onEdit(note)}
    >
      <div className="p-5 flex-grow">
        {/* Title with Notion-like styling */}
        <h3 className="note-title mb-3 group-hover:text-white transition-colors">
          {note.title}
        </h3>

        {/* Content preview with Notion-like styling */}
        <p className="text-gray-400 mb-4 text-sm line-clamp-3 font-light">
          {truncateContent(plainTextContent)}
        </p>

        {/* Bottom metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {/* Date */}
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(note.createdAt)}</span>
          </div>

          {/* Reminder if exists */}
          {(note.reminderDate || note.reminderTime) && (
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {note.reminderDate}{" "}
                {note.reminderTime && `at ${note.reminderTime}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons - only shown on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-t border-gray-800 p-3 bg-gray-900 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>

        {note.reminderDate && note.reminderTime && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCalendar(note.id);
            }}
            disabled={
              calendarStatus.noteId === note.id &&
              calendarStatus.status === "loading"
            }
            className={`text-xs px-2 py-1 rounded ${
              calendarStatus.noteId === note.id
                ? calendarStatus.status === "loading"
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : calendarStatus.status === "success"
                  ? "bg-green-600 text-white"
                  : calendarStatus.status === "error"
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } transition-colors`}
          >
            {calendarStatus.noteId === note.id
              ? calendarStatus.status === "loading"
                ? "Adding..."
                : calendarStatus.message
              : "Add to Calendar"}
          </button>
        )}
      </div>
    </div>
  );
}
