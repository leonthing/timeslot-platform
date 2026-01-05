'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CreatePostPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setCurrentUser(user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !content.trim()) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: currentUser.id,
            content: content.trim()
          }
        ]);

      if (error) throw error;

      alert('게시물이 작성되었습니다!');
      router.push('/feed');
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(`게시물 작성 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    alert('로그아웃되었습니다.');
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              ⏰ TimeSlot
            </Link>
            <div className="flex gap-4 items-center">
              <Link href="/explore" className="text-gray-600 hover:text-gray-800 font-semibold">
                탐색
              </Link>
              <Link href="/feed" className="text-gray-600 hover:text-gray-800 font-semibold">
                피드
              </Link>
              <Link href="/bookings" className="text-gray-600 hover:text-gray-800 font-semibold">
                예약 내역
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-800">
                내 프로필
              </Link>
              
              {currentUser && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">{currentUser.email}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-8">
        <Link 
          href="/feed" 
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          ← 피드로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">새 게시물 작성</h1>
          <p className="text-gray-600">무슨 일이 일어나고 있나요?</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="당신의 생각을 공유해보세요..."
              required
              rows={6}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none text-lg"
            />
            <p className="text-sm text-gray-500 mt-2 text-right">
              {content.length}/500
            </p>
          </div>

          <div className="flex gap-4">
            <Link 
              href="/feed"
              className="flex-1 text-center px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition ${
                loading || !content.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {loading ? '게시 중...' : '게시하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}