"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useEffect, useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const RichTextEditor = ({
  content,
  onChange,
  placeholder = "Start writing...",
  autoFocus = false,
}: RichTextEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);

  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable the default heading to use our custom configuration
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading" && node.attrs.level === 1) {
            return "Untitled";
          }
          return placeholder;
        },
      }),
    ],
    content: content || "<h1>Untitled</h1><p></p>",
    autofocus: autoFocus ? "end" : false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[300px] text-lg",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Handle first line as heading
  useEffect(() => {
    if (editor && !content) {
      // Set the first line as a heading when the editor is initialized with empty content
      editor.commands.setContent("<h1>Untitled</h1><p></p>");
      editor.commands.focus("end");
    }
  }, [editor, content]);

  // Client-side only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync content from props
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Editor menu buttons
  const MenuButton = ({
    isActive = false,
    onClick,
    children,
  }: {
    isActive?: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      className={`p-1 rounded ${
        isActive
          ? "bg-gray-700 text-white"
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-800 rounded-md p-4 min-h-[300px] bg-gray-900">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative border border-gray-800 rounded-md overflow-hidden bg-gray-900">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-800 bg-gray-900">
        <MenuButton
          isActive={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <span className="font-bold">H1</span>
        </MenuButton>
        <MenuButton
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <span className="font-bold">H2</span>
        </MenuButton>
        <MenuButton
          isActive={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <span className="font-bold">H3</span>
        </MenuButton>
        <div className="w-px h-6 bg-gray-800 mx-1"></div>
        <MenuButton
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          </svg>
        </MenuButton>
        <MenuButton
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="4" x2="10" y2="4"></line>
            <line x1="14" y1="20" x2="5" y2="20"></line>
            <line x1="15" y1="4" x2="9" y2="20"></line>
          </svg>
        </MenuButton>
        <MenuButton
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
            <line x1="4" y1="21" x2="20" y2="21"></line>
          </svg>
        </MenuButton>
        <div className="w-px h-6 bg-gray-800 mx-1"></div>
        <MenuButton
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </MenuButton>
        <MenuButton
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </MenuButton>
        <MenuButton
          isActive={editor.isActive("taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="6" height="6" rx="1"></rect>
            <path d="m3 17 2 2 4-4"></path>
            <line x1="12" y1="8" x2="20" y2="8"></line>
            <line x1="12" y1="16" x2="20" y2="16"></line>
          </svg>
        </MenuButton>
        <div className="w-px h-6 bg-gray-800 mx-1"></div>
        <MenuButton
          isActive={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="17" y1="10" x2="3" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="17" y1="18" x2="3" y2="18"></line>
          </svg>
        </MenuButton>
        <MenuButton
          isActive={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="17" y1="10" x2="7" y2="10"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="17" y1="18" x2="7" y2="18"></line>
          </svg>
        </MenuButton>
        <MenuButton
          isActive={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="21" y1="10" x2="7" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="21" y1="18" x2="7" y2="18"></line>
          </svg>
        </MenuButton>
        <div className="w-px h-6 bg-gray-800 mx-1"></div>
        <div className="relative group">
          <MenuButton onClick={() => {}}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v18"></path>
              <rect x="4" y="8" width="16" height="8" rx="1"></rect>
            </svg>
          </MenuButton>
          <div className="absolute hidden group-hover:flex flex-wrap gap-1 p-2 bg-gray-800 rounded-md shadow-lg z-10 top-full left-0 mt-1">
            {[
              "#ff6b6b",
              "#ffa94d",
              "#ffd43b",
              "#a9e34b",
              "#63e6be",
              "#4dabf7",
              "#748ffc",
              "#da77f2",
              "#ffffff",
            ].map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded-full border border-gray-700 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => editor.chain().focus().setColor(color).run()}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bubble menu that appears when text is selected */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-gray-800 rounded-md shadow-lg flex p-1 gap-1"
        >
          <MenuButton
            isActive={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            </svg>
          </MenuButton>
          <MenuButton
            isActive={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="4" x2="10" y2="4"></line>
              <line x1="14" y1="20" x2="5" y2="20"></line>
              <line x1="15" y1="4" x2="9" y2="20"></line>
            </svg>
          </MenuButton>
          <MenuButton
            isActive={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
              <line x1="4" y1="21" x2="20" y2="21"></line>
            </svg>
          </MenuButton>
        </BubbleMenu>
      )}

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
