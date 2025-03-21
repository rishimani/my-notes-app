"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Note } from "@/types";
import Header from "@/components/Header";
import NoteEditor from "@/components/NoteEditor";

export default function NewNotePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateNote = async (noteData: Partial<Note>) => {
    if (!session) {
      // Redirect to sign in if not authenticated
      router.push("/auth/signin");
      return Promise.reject(new Error("Please sign in to create notes"));
    }

    setIsSubmitting(true);

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

      // Navigate to the note list
      router.push("/notes");

      return Promise.resolve();
    } catch (error: any) {
      console.error("Error creating note:", error);
      return Promise.reject(error);
    } finally {
      setIsSubmitting(false);
    }
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
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-400 mb-8">Please sign in to create notes</p>
            <button
              onClick={() => router.push("/auth/signin")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create New Note</h2>
              <button
                onClick={() => router.back()}
                className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>
            </div>

            <NoteEditor onSave={handleCreateNote} isNew={true} />
          </div>
        )}
      </main>
    </div>
  );
}
