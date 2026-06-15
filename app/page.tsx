import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TodoApp from "./TodoApp";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RLS がログインユーザーの行だけ返す（user_id 条件は書かない）
  const { data: todos } = await supabase
    .from("todos")
    .select("id, title, completed, created_at")
    .order("created_at", { ascending: false });

  return <TodoApp initialTodos={todos ?? []} />;
}
