"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AuthShell,
  buttonClassName,
  inputClassName,
} from "@/app/_components/AuthShell";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 確認メールテンプレート（token_hash）と PKCE flow 用
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setIsEmailSent(true);
  };

  if (isEmailSent) {
    return (
      <AuthShell title="確認メールを送信しました">
        <p className="text-center text-sm leading-relaxed text-gray-600">
          <span className="font-medium text-gray-800">{email}</span>{" "}
          宛に確認メールを送りました。メール内のリンクをクリックして登録を完了してください。
        </p>
        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          ログインページへ
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="新規登録"
      footer={
        <p>
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-medium text-emerald-700 hover:underline">
            ログイン
          </Link>
        </p>
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="6文字以上"
            className={inputClassName}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button type="submit" disabled={isSubmitting} className={buttonClassName}>
          {isSubmitting ? "送信中..." : "登録する"}
        </button>
      </form>
    </AuthShell>
  );
}
