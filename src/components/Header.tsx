"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Check for session errors
  useEffect(() => {
    if (session?.error) {
      console.log("Session error in header:", session.error);
    }
  }, [session]);

  const handleSignIn = () => {
    // Navigate to the custom sign-in page
    router.push("/auth/signin");
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <h1 className="text-2xl font-serif font-medium tracking-tight text-white">
            <Link href="/">Notify</Link>
          </h1>

          {session && (
            <nav className="hidden sm:flex">
              <ul className="flex space-x-8">
                <li>
                  <Link
                    href="/"
                    className={`text-sm font-medium transition-colors ${
                      pathname === "/"
                        ? "text-blue-400"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/notes"
                    className={`text-sm font-medium transition-colors ${
                      pathname === "/notes" || pathname.startsWith("/notes/")
                        ? "text-blue-400"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Notes
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>

        <div>
          {session ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-600/80 flex items-center justify-center text-white font-medium">
                  {session.user?.name?.charAt(0) ||
                    session.user?.email?.charAt(0) ||
                    "U"}
                </div>
                <span className="text-sm text-gray-300">
                  {session.user?.name || session.user?.email}
                </span>
                {session.error && (
                  <span className="text-xs px-2 py-1 bg-red-900/50 text-red-300 rounded-full">
                    Auth issue
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center space-x-2 bg-blue-600/90 hover:bg-blue-700 text-white px-3.5 py-2 rounded-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
