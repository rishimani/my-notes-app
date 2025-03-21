"use client";

import { useState, useEffect, useRef } from "react";
import { Note } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [latestNote, setLatestNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the saved position from localStorage
    const savedPosition = localStorage.getItem("noteCardPosition");
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error("Failed to parse saved position", e);
      }
    }

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
        // Sort by updatedAt (most recent first)
        const sortedNotes = [...data].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        setLatestNote(sortedNotes.length > 0 ? sortedNotes[0] : null);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [session, status]);

  // Handle dragging functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Save position to localStorage
      localStorage.setItem("noteCardPosition", JSON.stringify(position));
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Function to truncate content and strip HTML
  const truncateContent = (htmlContent: string, maxLength = 150) => {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    // Extract the text content
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // Truncate if necessary
    if (textContent.length > maxLength) {
      return textContent.substring(0, maxLength) + "...";
    }

    return textContent;
  };

  return (
    <div
      className="min-h-screen bg-gray-950 text-white"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 relative min-h-[80vh]">
        {status === "loading" ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !session ? (
          <div className="text-center py-12">
            <h2 className="text-4xl font-serif font-semibold mb-4">
              Welcome to Notify
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Your personal dashboard for notes and reminders
            </p>
            <button
              onClick={() => router.push("/auth/signin")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-serif font-semibold mb-2">
                Your Dashboard
              </h2>
              <p className="text-gray-400">
                Drag the note card to position it anywhere on your dashboard
              </p>
            </div>

            {/* Draggable Latest Note Card */}
            <div
              ref={cardRef}
              className={`absolute max-w-lg w-full shadow-2xl ${
                isDragging ? "opacity-80" : "opacity-100"
              } transition-opacity`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                zIndex: isDragging ? 10 : 1,
              }}
            >
              <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-xl">
                {/* Card Header - Draggable Area */}
                <div
                  className="bg-gray-800 px-6 py-4 flex justify-between items-center draggable"
                  onMouseDown={handleMouseDown}
                >
                  <h3 className="text-lg font-serif font-semibold text-white">
                    Latest Note
                  </h3>
                  <div className="flex items-center">
                    <span className="mr-2 text-xs text-gray-400">
                      • Drag to move
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 9h14M5 15h14"></path>
                    </svg>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : latestNote ? (
                    <div>
                      <h4 className="text-2xl font-serif font-semibold text-white mb-2">
                        {latestNote.title}
                      </h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Last updated: {formatDate(latestNote.updatedAt)}
                      </p>
                      <div className="border-t border-gray-800 my-4"></div>
                      <p className="text-gray-300 mb-6 line-clamp-4">
                        {truncateContent(latestNote.content, 240)}
                      </p>
                      <div className="flex justify-between">
                        <Link
                          href={`/notes/${latestNote.id}`}
                          className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors flex items-center"
                        >
                          Open note
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                        <Link
                          href="/notes"
                          className="text-sm text-gray-300 hover:text-white flex items-center"
                        >
                          See all notes
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">
                        You don't have any notes yet
                      </p>
                      <Link
                        href="/notes/new"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Create your first note
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
