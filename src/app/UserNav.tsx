"use client";
import { useEffect, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [imgError, setImgError] = useState(false);
  const pathname = usePathname(); // 获取当前路径

  useEffect(() => {
    // 获取当前用户
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // 监听登录状态变化
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // 可选：刷新页面
    window.location.reload();
  };

  // 默认头像 SVG
  const DefaultAvatar = (
    <svg viewBox="0 0 40 40" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#e5e7eb" />
      <circle cx="20" cy="16" r="7" fill="#9ca3af" />
      <ellipse cx="20" cy="30" rx="10" ry="6" fill="#d1d5db" />
    </svg>
  );

  // 已登录：只显示头像、用户名、退出按钮
  if (user) {
    return (
      <div className="flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 px-4 py-1 rounded-full shadow border border-gray-200 dark:border-gray-700">
        {/* 头像优化：加载失败或无头像时显示默认SVG */}
        {user.user_metadata?.avatar_url && !imgError ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="avatar"
            className="w-9 h-9 rounded-full border object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="w-9 h-9 rounded-full border bg-gray-100 flex items-center justify-center overflow-hidden">
            {DefaultAvatar}
          </span>
        )}
        <span className="text-gray-800 dark:text-white font-medium max-w-[120px] truncate text-base">
          {user.user_metadata?.name || user.email}
        </span>
        <button
          onClick={handleLogout}
          className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 rounded transition text-base font-medium"
        >
          退出
        </button>
      </div>
    );
  }

  // 未登录：在登录页面不显示登录按钮，其他页面显示
  if (pathname === '/login') {
    return null;
  }

  return (
    <Link href="/login">
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow font-semibold transition">
        登录
      </button>
    </Link>
  );
} 