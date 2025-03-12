"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignIn = () => {
    // Navigate to the custom sign-in page
    router.push("/auth/signin");
  };

  return (
    <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">Notify</h1>
        </div>

        <div>
          {session ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {session.user?.name?.charAt(0) ||
                    session.user?.email?.charAt(0) ||
                    "U"}
                </div>
                <span className="text-sm text-gray-300">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
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
          )}
        </div>
      </div>
    </header>
  );
}
