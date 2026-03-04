'use client';

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Top navigation bar with project title and logout button.
export function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <h1 className="text-lg font-semibold text-gray-900">
        System for Optimization of Team Software Development
      </h1>
      <button
        onClick={handleLogout}
        className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
}

