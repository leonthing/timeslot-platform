'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function EditProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    title: '',
    bio: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);

  const categories = ['개발', '디자인', '마케팅', '비즈니스', '교육', '헬스', '상담', '요리', '음악', '기타'];
  const avatars = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '🧑‍🎨', '👨‍🏫', '👩‍🏫', '🧘‍♂️', '🧘‍♀️'];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setCurrentUser(user);

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData({
          name: profile.name || '',
          avatar: profile.avatar || '👤',
          title: profile.title || '',
          bio: profile.bio || '',
          category: profile.category || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          avatar: formData.avatar,
          title: formData.title,
          bio: formData.bio,
          category: formData.category
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      alert('프로필이 업데이트되었습니다!');
      window.location.href = '/';
    } catch (error: any) {
      alert(`업데이트 실패: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    alert('로그아웃되었습니다.');
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏰</div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-purple-600">
              ⏰ TimeSlot
            </Link>
            
            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex gap-4 items-center">
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
                  <span className="text-gray-700 text-sm">{currentUser.email}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden">
              <button 
                onClick={handleLogout}
                className="text-gray-600 text-sm"
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* 모바일 메뉴 */}
          <div className="md:hidden mt-3 flex gap-2 overflow-x-auto pb-2">
            <Link href="/explore" className="text-gray-600 text-sm whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-lg">
              탐색
            </Link>
            <Link href="/feed" className="text-gray-600 text-sm whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-lg">
              피드
            </Link>
            <Link href="/bookings" className="text-gray-600 text-sm whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-lg">
              예약
            </Link>
            <Link href="/" className="text-gray-600 text-sm whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-lg">
              프로필
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          ← 내 프로필로 돌아가기
        </Link>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">프로필 수정</h1>
          <p className="text-sm sm:text-base text-gray-600">당신의 정보를 업데이트하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 space-y-4 sm:space-y-6">
          {/* 아바타 선택 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              아바타 선택
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 sm:gap-3">
              {avatars.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: emoji })}
                  className={`w-full aspect-square text-2xl sm:text-3xl rounded-full transition ${
                    formData.avatar === emoji
                      ? 'bg-purple-600 scale-110 shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 이름 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              이름 *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="홍길동"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm sm:text-base"
            />
          </div>

          {/* 직함 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              직함/전문 분야 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="시니어 개발자 | 스타트업 멘토"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm sm:text-base"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              카테고리 *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm sm:text-base"
            >
              <option value="">선택하세요</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 소개 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              소개 *
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="자신을 소개하는 내용을 작성해주세요"
              required
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none text-sm sm:text-base"
            />
          </div>

          {/* 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
            <Link 
              href="/"
              className="flex-1 text-center px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-sm sm:text-base"
            >
              취소
            </Link>
            <button
              type="submit"
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm sm:text-base"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}