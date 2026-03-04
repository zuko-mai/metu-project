import { redirect } from "next/navigation";

// Simple redirect from root (/) to the login page.
export default function Home() {
  redirect("/login");
}
