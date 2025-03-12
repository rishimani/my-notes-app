"use client";

import { useState, useEffect } from "react";
import { Note } from "@/types";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [calendarStatus, setCalendarStatus] = useState<{
    noteId: string;
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ noteId: "", status: "idle" });

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("/api/notes");
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Submitting form:", {
        editingNoteId,
        title,
        content,
        reminderDate,
        reminderTime,
      });

      if (editingNoteId) {
        // Update existing note
        console.log(`Updating note with ID: ${editingNoteId}`);
        const response = await fetch(`/api/notes/${editingNoteId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
            reminderDate: reminderDate || null,
            reminderTime: reminderTime || null,
          }),
        });

        console.log("Update response status:", response.status);

        // Try to parse the response as JSON
        let responseData;
        try {
          responseData = await response.json();
          console.log("Update response data:", responseData);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          throw new Error("Failed to parse server response");
        }

        if (!response.ok) {
          throw new Error(responseData.error || "Failed to update note");
        }

        setNotes(
          notes.map((note) => (note.id === editingNoteId ? responseData : note))
        );
        setEditingNoteId(null);
      } else {
        // Create new note
        console.log("Creating new note");
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
            reminderDate: reminderDate || null,
            reminderTime: reminderTime || null,
            userId: "anonymous", // In a real app, use authenticated user ID
          }),
        });

        console.log("Create response status:", response.status);

        // Try to parse the response as JSON
        let responseData;
        try {
          responseData = await response.json();
          console.log("Create response data:", responseData);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          throw new Error("Failed to parse server response");
        }

        if (!response.ok) {
          throw new Error(responseData.error || "Failed to create note");
        }

        setNotes((prevNotes) => [...prevNotes, responseData]);
      }

      // Reset form
      setTitle("");
      setContent("");
      setReminderDate("");
      setReminderTime("");
    } catch (error: any) {
      console.error("Error saving note:", error);
      alert(`Error: ${error.message || "Failed to save note"}`);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      console.log(`Deleting note with ID: ${id}`);
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      console.log("Delete response status:", response.status);

      // Try to parse the response as JSON
      let responseData;
      try {
        responseData = await response.json();
        console.log("Delete response data:", responseData);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Failed to parse server response");
      }

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to delete note");
      }

      setNotes(notes.filter((note) => note.id !== id));
    } catch (error: any) {
      console.error("Error deleting note:", error);
      alert(`Error: ${error.message || "Failed to delete note"}`);
    }
  };

  const editNote = (note: Note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setReminderDate(note.reminderDate || "");
    setReminderTime(note.reminderTime || "");
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setTitle("");
    setContent("");
    setReminderDate("");
    setReminderTime("");
  };

  const addToCalendar = async (noteId: string) => {
    if (!session) {
      signIn("google");
      return;
    }

    console.log(
      "Session before calendar API call:",
      session ? "Session exists" : "No session"
    );
    console.log("Access token exists:", session?.accessToken ? "Yes" : "No");
    console.log("User email:", session?.user?.email);

    setCalendarStatus({ noteId, status: "loading" });

    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ noteId }),
        credentials: "include",
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Error parsing response:", e);
        throw new Error("Failed to parse server response");
      }

      console.log("Calendar API response:", {
        status: response.status,
        ok: response.ok,
        data,
      });

      if (response.ok) {
        setCalendarStatus({
          noteId,
          status: "success",
          message: "Added to calendar!",
        });

        // Open the Google Calendar event in a new tab if there's a link
        if (data.eventLink) {
          window.open(data.eventLink, "_blank");
        }
      } else {
        // If we get a 401, try to sign in again
        if (response.status === 401) {
          console.log("Authentication error, trying to sign in again");
          signIn("google");
        }

        // Get a more detailed error message
        let errorMessage = data.error || "Failed to add to calendar";
        if (data.details) {
          errorMessage += `: ${data.details}`;
        }

        console.error("Calendar API error details:", data);

        setCalendarStatus({
          noteId,
          status: "error",
          message: errorMessage,
        });
      }
    } catch (error: any) {
      console.error("Error in addToCalendar:", error);
      setCalendarStatus({
        noteId,
        status: "error",
        message: error.message || "An error occurred",
      });
    }

    // Reset status after 3 seconds
    setTimeout(() => {
      setCalendarStatus({ noteId: "", status: "idle" });
    }, 3000);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notify</h1>
        <div>
          {session ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Signed in as {session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700"
      >
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-200 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-200 mb-1"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md h-32 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="reminderDate"
              className="block text-sm font-medium text-gray-200 mb-1"
            >
              Reminder Date
            </label>
            <input
              type="date"
              id="reminderDate"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="reminderTime"
              className="block text-sm font-medium text-gray-200 mb-1"
            >
              Reminder Time
            </label>
            <input
              type="time"
              id="reminderTime"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {editingNoteId ? "Update Note" : "Save Note"}
          </button>
          {editingNoteId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Notes</h2>

        {isLoading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Create your first note above!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="border border-gray-700 bg-gray-800 rounded-lg p-4 shadow-md"
              >
                <h3 className="text-lg font-medium mb-2 text-white">
                  {note.title}
                </h3>
                <p className="text-gray-300 mb-2">{note.content}</p>
                {(note.reminderDate || note.reminderTime) && (
                  <p className="text-gray-400 mb-2">
                    Reminder: {note.reminderDate} {note.reminderTime}
                  </p>
                )}
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editNote(note)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {note.reminderDate && note.reminderTime && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <button
                      onClick={() => addToCalendar(note.id)}
                      disabled={
                        calendarStatus.noteId === note.id &&
                        calendarStatus.status === "loading"
                      }
                      className={`w-full text-center py-1 rounded-md ${
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
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
