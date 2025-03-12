"use client";

import { useState } from "react";
import { Note } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface NotePageProps {
  note: Note;
  onUpdate: (note: Partial<Note>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddToCalendar: (id: string) => void;
  calendarStatus: {
    noteId: string;
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  };
}

export default function NotePage({
  note,
  onUpdate,
  onDelete,
  onAddToCalendar,
  calendarStatus,
}: NotePageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [reminderDate, setReminderDate] = useState(note.reminderDate || "");
  const [reminderTime, setReminderTime] = useState(note.reminderTime || "");
  const [showReminderPanel, setShowReminderPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        id: note.id,
        title,
        content,
        reminderDate,
        reminderTime,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await onDelete(note.id);
        router.push("/");
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
        <button
          onClick={() => router.push("/")}
          className="text-gray-400 hover:text-white transition-colors flex items-center"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Notes</span>
        </button>

        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow p-6">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-4 text-gray-100"
              required
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[400px] text-lg bg-transparent border-none outline-none resize-none text-gray-300"
              required
            />
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-100">{note.title}</h1>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span>Created: {formatDate(note.createdAt)}</span>
              {note.updatedAt !== note.createdAt && (
                <span>Updated: {formatDate(note.updatedAt)}</span>
              )}
            </div>
            <div className="text-lg text-gray-300 whitespace-pre-wrap">
              {note.content}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar/Reminder panel */}
      <div className="fixed top-20 right-4 z-20">
        <div className="flex flex-col items-end">
          <button
            onClick={() => setShowReminderPanel(!showReminderPanel)}
            className={`flex items-center space-x-2 mb-2 px-3 py-2 rounded-md ${
              showReminderPanel
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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

          {showReminderPanel && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 w-64">
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Set Reminder
              </h3>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="reminderDate"
                    className="block text-xs font-medium text-gray-400 mb-1"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    id="reminderDate"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-white"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label
                    htmlFor="reminderTime"
                    className="block text-xs font-medium text-gray-400 mb-1"
                  >
                    Time
                  </label>
                  <input
                    type="time"
                    id="reminderTime"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-white"
                    disabled={!isEditing}
                  />
                </div>

                {!isEditing && reminderDate && reminderTime && (
                  <div className="pt-2">
                    <button
                      onClick={() => onAddToCalendar(note.id)}
                      disabled={
                        calendarStatus.noteId === note.id &&
                        calendarStatus.status === "loading"
                      }
                      className={`w-full text-sm py-1 rounded-md ${
                        calendarStatus.noteId === note.id
                          ? calendarStatus.status === "loading"
                            ? "bg-gray-600 cursor-not-allowed"
                            : calendarStatus.status === "success"
                            ? "bg-green-600"
                            : calendarStatus.status === "error"
                            ? "bg-red-600"
                            : "bg-blue-600 hover:bg-blue-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {calendarStatus.noteId === note.id
                        ? calendarStatus.status === "loading"
                          ? "Adding..."
                          : calendarStatus.message
                        : "Add to Google Calendar"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
