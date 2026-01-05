'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FollowButton from '../components/FollowButton';
import { supabase } from '@/lib/supabase';

export default function ExplorePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', '개발', '디자인', '마케팅', '비즈니스', '교육', '헬스', '상담', '요리', '음악', '기타'];

  useEffect(() => {
    checkUser();
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedCategory, users]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (currentUser) {
      filtered = filtered.filter(user => user.id !== currentUser.id);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(user => user.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    alert('로그아웃되었습니다.');
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
              <Link href="/explore" className="text-purple-600 font-semibold">
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
              
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 text-sm">{currentUser.email}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link href="/auth">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                    로그인
                  </button>
                </Link>
              )}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden flex items-center gap-2">
              {currentUser ? (
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 text-sm"
                >
                  로그아웃
                </button>
              ) : (
                <Link href="/auth">
                  <button className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm">
                    로그인
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* 모바일 메뉴 */}
          <div className="md:hidden mt-3 flex gap-2 overflow-x-auto pb-2">
            <Link href="/explore" className="text-purple-600 text-sm whitespace-nowrap px-3 py-1.5 bg-purple-100 rounded-lg">
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

      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">탐색</h1>
          <p className="text-sm sm:text-base text-gray-600">새로운 전문가를 발견하세요</p>
        </div>

        {/* 검색 */}
        <div className="mb-4 sm:mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 직함, 소개로 검색..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm sm:text-base"
          />
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap text-sm sm:text-base ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category === 'all' ? '전체' : category}
              </button>
            ))}
          </div>
        </div>

        {/* 사용자 목록 */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <p className="text-gray-500 text-base sm:text-lg">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition">
                <Link href={`/user/${user.id}`}>
                  <div className="flex flex-col items-center text-center mb-4 cursor-pointer">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl mb-3 sm:mb-4">
                      {user.avatar || '👤'}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 hover:text-purple-600">
                      {user.name}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-3">{user.title}</p>
                    {user.category && (
                      <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                        {user.category}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                  <span>⭐ {user.rating || 0}</span>
                  <span>👥 {user.followers_count || 0}</span>
                </div>

                <p className="text-gray-700 text-xs sm:text-sm text-center mb-3 sm:mb-4 line-clamp-2">
                  {user.bio || '소개가 없습니다.'}
                </p>

                <div className="flex gap-2 sm:gap-3">
                  <Link href={`/user/${user.id}`} className="flex-1">
                    <button className="w-full px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-xs sm:text-sm">
                      프로필 보기
                    </button>
                  </Link>
                  <div className="flex-shrink-0">
                    <FollowButton userId={user.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}