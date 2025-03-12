"use client";

import { Note } from "@/types";
import NoteCard from "./NoteCard";

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onAddToCalendar: (id: string) => void;
  calendarStatus: {
    noteId: string;
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  };
  isLoading: boolean;
}

export default function NotesList({
  notes,
  onEdit,
  onDelete,
  onAddToCalendar,
  calendarStatus,
  isLoading,
}: NotesListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-pulse flex space-x-2">
          <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
          <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
          <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="text-gray-400 text-lg">No notes yet</p>
        <p className="text-gray-500 mt-1">
          Create your first note to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddToCalendar={onAddToCalendar}
          calendarStatus={calendarStatus}
        />
      ))}
    </div>
  );
}
