"use client";

import { useState, useEffect } from "react";
import { Note } from "@/types";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          userId: "anonymous", // In a real app, use authenticated user ID
        }),
      });

      const newNote = await response.json();
      setNotes((prevNotes) => [...prevNotes, newNote]);
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notify</h1>

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

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Save Note
        </button>
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
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
