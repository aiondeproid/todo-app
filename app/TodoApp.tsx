"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Todo } from "@/lib/types";

const TOAST_DURATION_MS = 3000;

type TodoAppProps = {
  initialTodos: Todo[];
};

export default function TodoApp({ initialTodos }: TodoAppProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState(false);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  // 編集中の ToDo の id（null = 編集していない）
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  // 0 = 非表示、1 以上 = 表示中（連続追加時にタイマーをリセットするため数値で管理）
  const [toastTick, setToastTick] = useState(0);
  const showAddToast = toastTick > 0;

  // 編集モードに入ったとき入力欄に自動フォーカス
  useEffect(() => {
    if (editingId !== null) {
      editInputRef.current?.focus();
    }
  }, [editingId]);

  // 追加成功トーストを 3 秒後に自動で消す
  useEffect(() => {
    if (toastTick === 0) return;
    const id = setTimeout(() => setToastTick(0), TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [toastTick]);

  // Supabase から最新の一覧を取得して画面を再描画する（RLS が user_id を自動フィルタ）
  const refreshTodos = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("todos")
      .select("id, title, completed, created_at")
      .order("created_at", { ascending: false });

    if (error || !data) return;
    setTodos(data);
  };

  const handleAdd = async () => {
    const trimmed = input.trim();
    if (trimmed === "") {
      // 空入力時はリストに追加せず、入力欄直下にエラーを表示する
      setInputError(true);
      return;
    }
    setInputError(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("todos")
      .insert({ title: trimmed, user_id: user.id })
      .select("id, title, completed, created_at")
      .single();

    if (error || !data) return;

    // created_at 降順なので先頭に追加する
    setTodos((prev) => [data, ...prev]);
    setInput("");
    // 追加成功時のみトーストを表示する（連続追加時はタイマーがリセットされる）
    setToastTick((tick) => tick + 1);
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditValue(todo.title);
  };

  const commitEdit = async () => {
    const trimmed = editValue.trim();
    if (trimmed === "" || editingId === null) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("todos")
      .update({ title: trimmed })
      .eq("id", editingId);

    if (error) return;

    setEditingId(null);
    await refreshTodos();
  };

  const handleToggleCompleted = async (todo: Todo) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", todo.id);

    if (error) return;
    await refreshTodos();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = async (todo: Todo) => {
    // OK のときだけ削除（キャンセル時は何もしない）
    if (!window.confirm(`『${todo.title}』を削除しますか？`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("todos").delete().eq("id", todo.id);

    if (error) return;

    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    // 念のため: 削除した ToDo が編集中だったら編集状態を解除する
    if (editingId === todo.id) setEditingId(null);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col items-center bg-gray-100 px-4 py-14 font-sans sm:px-6 sm:py-20">
      <main className="flex w-full max-w-lg flex-col gap-12">
        <h1 className="text-center text-4xl font-bold tracking-tight text-emerald-800 sm:text-5xl">
          🚀 ToDo リスト
        </h1>

        {/* 入力欄と追加ボタン */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // 入力があればエラーを自動で消す
                if (inputError) setInputError(false);
              }}
              onKeyDown={(e) => {
                // Enter キーでも追加できるようにする
                if (e.key === "Enter") void handleAdd();
              }}
              placeholder="やることを入力"
              aria-invalid={inputError}
              className={`min-w-0 rounded-lg border bg-white px-5 py-3.5 text-base text-gray-800 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                inputError
                  ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                  : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              }`}
            />
            {inputError && (
              <p role="alert" className="text-sm text-red-600">
                タイトルを入力してください
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void handleAdd()}
            className="shrink-0 rounded-lg bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800"
          >
            追加
          </button>
        </div>

        {/* ToDo 一覧 */}
        <section className="flex flex-col gap-5">
          <h2 className="text-center text-sm font-medium text-emerald-700">
            一覧（{todos.length} 件）
          </h2>

          {todos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-emerald-200 bg-white px-6 py-12 text-center text-gray-400 shadow-sm">
              まだ ToDo がありません
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="rounded-lg bg-white px-5 py-4 shadow-sm"
                >
                  {editingId === todo.id ? (
                    // 編集モード: 入力欄 + 保存・キャンセルボタン
                    <div className="flex items-center gap-2">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void commitEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="min-w-0 flex-1 rounded-md border border-emerald-300 bg-white px-3 py-2 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => void commitEdit()}
                        // 空文字では保存できないようにする
                        disabled={editValue.trim() === ""}
                        className="shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="shrink-0 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    // 表示モード: チェックボックス + テキスト + 編集・削除ボタン
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => void handleToggleCompleted(todo)}
                        disabled={editingId !== null}
                        aria-label={
                          todo.completed ? "未完了に戻す" : "完了にする"
                        }
                        className="h-4 w-4 shrink-0 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-30"
                      />
                      <span
                        className={`flex-1 break-words ${
                          todo.completed
                            ? "text-gray-400 line-through"
                            : "text-gray-800"
                        }`}
                      >
                        {todo.title}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        {/* 他の ToDo 編集中は鉛筆ボタンを無効化する */}
                        <button
                          type="button"
                          onClick={() => startEdit(todo)}
                          disabled={editingId !== null}
                          aria-label="編集"
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                          </svg>
                        </button>
                        {/* 赤系の色で誤操作しにくくする */}
                        <button
                          type="button"
                          onClick={() => void handleDelete(todo)}
                          disabled={editingId !== null}
                          aria-label="削除"
                          className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 00-.584.804 7.07 7.07 0 004.47 4.92A8.007 8.007 0 004 15.5v.75a.75.75 0 00.75.75h10.5a.75.75 0 00.75-.75v-.75a8.007 8.007 0 00-3.276-5.078 7.07 7.07 0 004.47-4.92.75.75 0 00-.584-.804A41.102 41.102 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* 追加成功時のトースト（3 秒で自動消去） */}
      {showAddToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-800 shadow-md"
        >
          ToDoを追加しました
        </div>
      )}
    </div>
  );
}
