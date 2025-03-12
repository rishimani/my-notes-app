"use client";

import { useState, useEffect } from "react";
import { Note } from "@/types";
import { useSession } from "next-auth/react";
import RichTextEditor from "./RichTextEditor";

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Partial<Note>) => Promise<void>;
  onCancel?: () => void;
  isNew?: boolean;
}

export default function NoteEditor({
  note,
  onSave,
  onCancel,
  isNew = true,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [reminderDate, setReminderDate] = useState(note?.reminderDate || "");
  const [reminderTime, setReminderTime] = useState(note?.reminderTime || "");
  const [showReminder, setShowReminder] = useState(
    !!note?.reminderDate || !!note?.reminderTime
  );
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = useSession();

  // Extract title from rich text content
  const extractTitleFromContent = (htmlContent: string) => {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    // Find the first h1 element
    const h1 = tempDiv.querySelector("h1");

    if (h1) {
      return h1.textContent || "";
    }

    return "";
  };

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setReminderDate(note.reminderDate || "");
      setReminderTime(note.reminderTime || "");
      setShowReminder(!!note.reminderDate || !!note.reminderTime);
    }
  }, [note]);

  const handleContentChange = (htmlContent: string) => {
    setContent(htmlContent);

    // Extract title from the first H1 in the content
    const extractedTitle = extractTitleFromContent(htmlContent);
    if (extractedTitle) {
      setTitle(extractedTitle);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave({
        title,
        content,
        reminderDate: showReminder ? reminderDate : null,
        reminderTime: showReminder ? reminderTime : null,
      });

      if (isNew) {
        // Reset form if it's a new note
        setTitle("");
        setContent("");
        setReminderDate("");
        setReminderTime("");
        setShowReminder(false);
      }
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="note-card max-w-4xl mx-auto shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-grow">
          {/* Rich Text Editor */}
          <RichTextEditor
            content={content}
            onChange={handleContentChange}
            autoFocus={isNew}
          />
        </div>

        <div className="border-t border-gray-800 p-4 bg-gray-900 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? "Saving..." : isNew ? "Save Note" : "Update Note"}
            </button>

            {!isNew && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setShowReminder(!showReminder)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
                showReminder
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
              <span>Reminder</span>
            </button>
          </div>
        </div>

        {showReminder && (
          <div className="border-t border-gray-800 p-4 bg-gray-900 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reminderDate"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Date
              </label>
              <input
                type="date"
                id="reminderDate"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label
                htmlFor="reminderTime"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Time
              </label>
              <input
                type="time"
                id="reminderTime"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="input"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
