"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  useEffect(() => {
    // Auto-trigger Google sign-in when the page loads
    signIn("google", { callbackUrl });
  }, [callbackUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Sign In
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-800 rounded-md text-red-200">
            {error === "OAuthSignin" && "Error starting the sign in process."}
            {error === "OAuthCallback" && "Error during the sign in process."}
            {error === "OAuthCreateAccount" && "Error creating your account."}
            {error === "EmailCreateAccount" && "Error creating your account."}
            {error === "Callback" && "Error during the sign in callback."}
            {error === "OAuthAccountNotLinked" &&
              "This email is already associated with another account."}
            {error === "EmailSignin" && "Error sending the sign in email."}
            {error === "CredentialsSignin" && "Invalid credentials."}
            {error === "SessionRequired" &&
              "Please sign in to access this page."}
            {error === "Default" && "Unable to sign in."}
          </div>
        )}

        <div className="text-center text-gray-400 mb-4">
          Redirecting to Google sign-in...
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl })}
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
  );
}
