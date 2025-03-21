"use client";

import { useState, useEffect } from "react";
import { Note } from "@/types";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import NoteEditor from "@/components/NoteEditor";
import NotesList from "@/components/NotesList";
import Modal from "@/components/Modal";

export default function NotesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState("");
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState<{
    noteId: string;
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ noteId: "", status: "idle" });

  // Handle token errors
  useEffect(() => {
    if (session?.error) {
      console.log("Session error detected:", session.error);
      // If there's a token error, show the reauth modal
      if (
        session.error === "RefreshAccessTokenError" ||
        session.error === "RefreshTokenNotAvailable"
      ) {
        setShowReauthModal(true);
      }
    }
  }, [session]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (status === "loading") return;

      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/notes");

        if (!response.ok) {
          console.error("Error response:", response.status);
          return;
        }

        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [session, status]);

  const handleCreateNote = async (noteData: Partial<Note>) => {
    if (!session) {
      // Redirect to sign in if not authenticated
      router.push("/auth/signin");
      return Promise.reject(new Error("Please sign in to create notes"));
    }

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create note");
      }

      const newNote = await response.json();
      setNotes((prevNotes) => [...prevNotes, newNote]);

      // Navigate to the new note
      router.push(`/notes/${newNote.id}`);

      return Promise.resolve();
    } catch (error: any) {
      console.error("Error creating note:", error);
      return Promise.reject(error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete note");
      }

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      return Promise.resolve();
    } catch (error: any) {
      console.error("Error deleting note:", error);
      return Promise.reject(error);
    }
  };

  const handleReauthenticate = () => {
    // Sign out and then sign in again to get fresh permissions
    signIn("google", {
      callbackUrl: window.location.origin,
      prompt: "consent",
    });
    setShowReauthModal(false);
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
        // Check if we need to re-authenticate
        if (data.needsReauth) {
          setShowReauthModal(true);
          setCalendarStatus({
            noteId,
            status: "error",
            message: "Need permission",
          });
          return;
        }

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

  const handleEditNote = (note: Note) => {
    router.push(`/notes/${note.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {status === "loading" ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !session ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-serif font-semibold mb-4">
              Welcome to Notify
            </h2>
            <p className="text-gray-400 mb-8">
              Please sign in to create and manage your notes
            </p>
            <button
              onClick={() => router.push("/auth/signin")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-semibold mb-4">
                Create a New Note
              </h2>
              <NoteEditor onSave={handleCreateNote} />
            </div>

            <div>
              <h2 className="text-2xl font-serif font-semibold mb-4">
                Your Notes
              </h2>
              <NotesList
                notes={notes}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onAddToCalendar={handleAddToCalendar}
                calendarStatus={calendarStatus}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </main>

      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Google Calendar Event"
        url={calendarUrl}
      />

      {/* Re-authentication Modal */}
      {showReauthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex justify-between items-center border-b border-gray-800 p-4">
              <h3 className="text-lg font-medium text-gray-200">
                Google Authentication Required
              </h3>
              <button
                onClick={() => setShowReauthModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Your Google authentication has expired or been revoked. Please
                sign in again to continue using all features of the app.
              </p>
              <button
                onClick={handleReauthenticate}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
