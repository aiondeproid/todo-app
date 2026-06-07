import { createClient } from "@/lib/supabase/server";
import TodoApp from "./TodoApp";

export default async function Home() {
  const supabase = await createClient();

  // サーバー側で Supabase から一覧を取得する（created_at 降順）
  const { data: todos } = await supabase
    .from("todos")
    .select("id, title, completed, created_at")
    .order("created_at", { ascending: false });

  return <TodoApp initialTodos={todos ?? []} />;
}
