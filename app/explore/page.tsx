'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ExplorePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const categories = ["전체", "비즈니스", "건강/운동", "디자인", "라이프스타일", "교육", "취미"];

  // 현재 로그인한 사용자 확인
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  // Supabase에서 사용자 데이터 불러오기
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    alert('로그아웃되었습니다.');
  };

  // 카테고리 필터링
  let filteredUsers = selectedCategory === "전체" 
    ? users 
    : users.filter(user => user.category === selectedCategory);

  // 검색 필터링
  if (searchQuery.trim() !== "") {
    filteredUsers = filteredUsers.filter(user => {
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.title.toLowerCase().includes(query) ||
        user.bio.toLowerCase().includes(query)
      );
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏰</div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              ⏰ TimeSlot
            </Link>
            <div className="flex gap-4 items-center">
              <Link href="/explore" className="text-purple-600 font-semibold">
                탐색
              </Link>
              <Link href="/bookings" className="text-gray-600 hover:text-gray-800 font-semibold">
                예약 내역
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-800">
                내 프로필
              </Link>
              
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">{currentUser.email}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
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
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">전문가 탐색</h1>
          <p className="text-gray-600">당신에게 필요한 시간을 찾아보세요</p>
        </div>

        <div className="mb-8 relative">
          <input
            type="text"
            placeholder="이름, 전문 분야, 키워드로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full border-2 transition whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white border-gray-200 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mb-4 text-gray-600">
          {filteredUsers.length}명의 전문가
          {selectedCategory !== "전체" && ` · ${selectedCategory}`}
          {searchQuery && ` · "${searchQuery}" 검색 결과`}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden cursor-pointer"
            >
              <div className="p-6 bg-gradient-to-br from-purple-100 to-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-3xl">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{user.title}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-500 text-lg">⭐</span>
                  <span className="font-semibold text-gray-800">{user.rating}</span>
                  <span className="text-gray-500 text-sm">({user.reviews_count}개 리뷰)</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{user.bio}</p>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-gray-600">
                    👥 {user.followers_count.toLocaleString()}
                  </div>
                  <Link href={`/user/${user.id}`}>
                    <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                      프로필 보기
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">검색 결과가 없습니다.</p>
            <p className="text-gray-400">다른 키워드로 검색해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}