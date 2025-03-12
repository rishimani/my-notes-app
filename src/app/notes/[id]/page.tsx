"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Note } from "@/types";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import NotePage from "@/components/NotePage";
import Modal from "@/components/Modal";

export default function NoteSinglePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState("");
  const [calendarStatus, setCalendarStatus] = useState<{
    noteId: string;
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ noteId: "", status: "idle" });

  useEffect(() => {
    // Redirect to home if not authenticated
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    const fetchNote = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/notes/${params.id}`);

        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized - redirect to sign in
            router.push("/auth/signin");
            return;
          } else if (response.status === 404) {
            setError("Note not found");
          } else {
            setError("Failed to load note");
          }
          return;
        }

        const data = await response.json();
        setNote(data);
      } catch (error) {
        console.error("Error fetching note:", error);
        setError("An error occurred while loading the note");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [params.id, session, status, router]);

  const handleUpdateNote = async (noteData: Partial<Note>) => {
    if (!session) {
      router.push("/auth/signin");
      return Promise.reject(new Error("Please sign in to update notes"));
    }

    if (!noteData.id) return Promise.reject(new Error("Note ID is required"));

    try {
      const response = await fetch(`/api/notes/${noteData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update note");
      }

      const updatedNote = await response.json();
      setNote(updatedNote);
      return Promise.resolve();
    } catch (error: any) {
      console.error("Error updating note:", error);
      return Promise.reject(error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!session) {
      router.push("/auth/signin");
      return Promise.reject(new Error("Please sign in to delete notes"));
    }

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete note");
      }

      router.push("/");
      return Promise.resolve();
    } catch (error: any) {
      console.error("Error deleting note:", error);
      return Promise.reject(error);
    }
  };

  const handleAddToCalendar = async (noteId: string) => {
    if (!session) {
      // This will be handled by the Header component's sign-in button
      return;
    }

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

      const data = await response.json();

      if (response.ok) {
        setCalendarStatus({
          noteId,
          status: "success",
          message: "Added to calendar!",
        });

        // If there's an event link, open it in the modal
        if (data.eventLink) {
          setCalendarUrl(data.eventLink);
          setShowCalendarModal(true);
        }
      } else {
        // Get a more detailed error message
        let errorMessage = data.error || "Failed to add to calendar";
        if (data.details) {
          errorMessage += `: ${data.details}`;
        }

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
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-gray-400 text-lg">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Back to Notes
            </button>
          </div>
        ) : note ? (
          <NotePage
            note={note}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
            onAddToCalendar={handleAddToCalendar}
            calendarStatus={calendarStatus}
          />
        ) : null}
      </main>

      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Google Calendar Event"
        url={calendarUrl}
      />
    </div>
  );
}
