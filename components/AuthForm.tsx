'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserRole } from "@/types";

interface AuthFormProps {
  mode: "login" | "register";
}

// Reusable form for login and registration.
export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("developer");

  const isLogin = mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email,
          role,
          createdAt: serverTimestamp(),
        });
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-lg bg-white p-6 shadow-md border border-gray-200"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        {isLogin ? "Login" : "Register"}
      </h2>

      {error && (
        <div className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-gray-700">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="mb-4 block text-sm">
        <span className="mb-1 block text-gray-700">Password</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      {!isLogin && (
        <div className="mb-4 text-sm text-black">
          <span className="mb-1 block text-gray-700">Role</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-black">
              <input
                type="radio"
                value="developer"
                checked={role === "developer"}
                onChange={() => setRole("developer")}
              />
              <span>Developer</span>
            </label>
            <label className="flex items-center gap-2 text-black">
              <input
                type="radio"
                value="tester"
                checked={role === "tester"}
                onChange={() => setRole("tester")}
              />
              <span>Tester</span>
            </label>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
      </button>
    </form>
  );
}

