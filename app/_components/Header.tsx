import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold text-emerald-800 hover:text-emerald-900"
        >
          ToDo リスト
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-sm text-gray-600">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="ログアウト"
              className="shrink-0 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
