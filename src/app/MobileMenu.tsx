"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import Image from "next/image";
import { User } from "@supabase/supabase-js";

export default function MobileMenu() {
  const supabase = getSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [imgError, setImgError] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: { user: User | null } | null) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
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

  return (
    <>
      {/* 汉堡按钮 */}
      <button
        className="w-10 h-10 flex flex-col justify-center items-center rounded bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow"
        onClick={() => setOpen(true)}
        aria-label="打开菜单"
      >
        <span className="block w-6 h-0.5 bg-gray-800 dark:bg-white mb-1"></span>
        <span className="block w-6 h-0.5 bg-gray-800 dark:bg-white mb-1"></span>
        <span className="block w-6 h-0.5 bg-gray-800 dark:bg-white"></span>
      </button>
      {/* 抽屉菜单 */}
      <div
        className={`fixed inset-0 z-50 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: open ? "rgba(0,0,0,0.3)" : "transparent" }}
        onClick={() => setOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-900 shadow-lg p-6 flex flex-col gap-6 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            {user && user.user_metadata?.avatar_url && !imgError ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt="avatar"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full border object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="w-9 h-9 rounded-full border bg-gray-100 flex items-center justify-center overflow-hidden">
                {DefaultAvatar}
              </span>
            )}
            <span className="text-gray-800 dark:text-white font-medium max-w-[120px] truncate text-base">
              {user ? (user.user_metadata?.name || user.email) : "未登录"}
            </span>
          </div>
          <nav className="flex flex-col gap-4">
            <Link href="/history" className="text-gray-800 dark:text-white font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpen(false)}>
              查看历史
            </Link>
            <Link href="/stats" className="text-gray-800 dark:text-white font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpen(false)}>
              时长统计
            </Link>
            <Link href="/log" className="text-gray-800 dark:text-white font-medium py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpen(false)}>
              写新日志
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-500 font-medium py-2 px-3 rounded hover:bg-red-50 dark:hover:bg-red-900"
              >
                退出登录
              </button>
            ) : (
              pathname !== "/login" && (
                <Link href="/login" className="text-blue-600 font-medium py-2 px-3 rounded hover:bg-blue-50 dark:hover:bg-blue-900" onClick={() => setOpen(false)}>
                  登录
                </Link>
              )
            )}
          </nav>
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl"
            onClick={() => setOpen(false)}
            aria-label="关闭菜单"
          >
            ×
          </button>
        </div>
      </div>
    </>
  );
} 