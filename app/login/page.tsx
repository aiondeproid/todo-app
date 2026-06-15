import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-gray-100 text-sm text-gray-500">
          読み込み中...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
