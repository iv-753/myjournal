"use client";
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== "undefined"
          ? `${window.location.origin}/`
          : undefined,
      },
    });
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: typeof window !== "undefined"
          ? `${window.location.origin}/`
          : undefined,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg flex flex-col items-center w-80">
        <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gray-200 rounded-full text-2xl font-bold text-blue-500">
          MM
        </div>
        <h1 className="text-2xl font-bold mb-6">登录到你的账号</h1>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow mb-4 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.3-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.2 0-13 5.8-13 13 0 2.1.5 4.1 1.3 5.7z"/><path fill="#FBBC05" d="M24 44c5.6 0 10.5-1.9 14.3-5.1l-6.6-5.4C29.8 35.7 27 37 24 37c-6.1 0-10.7-3.1-11.7-7.5l-7 5.4C7.5 41.1 15.1 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.2 5.5-7.7 5.5-4.7 0-8.5-3.8-8.5-8.5s3.8-8.5 8.5-8.5c2.1 0 4 .7 5.5 2.1l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.2 0-13 5.8-13 13s5.8 13 13 13c6.1 0 10.7-3.1 11.7-7.5l7-5.4C46.5 22.1 45.5 21.1 44.5 20z"/></g></svg>
          使用 Google 登录
        </button>
        
        <button
          onClick={handleGitHubLogin}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl shadow transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          使用 GitHub 登录
        </button>
      </div>
    </div>
  );
} 