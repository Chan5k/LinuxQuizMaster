"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-xl border border-slate-600 text-slate-400 hover:border-red-500 hover:text-red-400 transition-colors"
    >
      Log out
    </button>
  );
}
