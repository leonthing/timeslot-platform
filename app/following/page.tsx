'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function FollowingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    alert('로그아웃되었습니다.');
  };

  // 샘플 팔로잉 데이터
  const followingUsers = [
    {
      id: 1,
      name: "김개발",
      title: "시니어 개발자 | 스타트업 멘토",
      avatar: "👤",
      followers: 1234,
      isActive: true
    },
    {
      id: 2,
      name: "박요가",
      title: "요가 강사 | 웰니스 코치",
      avatar: "🧘‍♀️",
      followers: 856,
      isActive: true
    },
    {
      id: 4,
      name: "최연애",
      title: "연애 상담 전문가",
      avatar: "💝",
      followers: 1876,
      isActive: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* 상단 네비게이션 */}
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

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">팔로잉</h1>
          <p className="text-gray-600">내가 팔로우한 {followingUsers.length}명의 전문가</p>
        </div>

        {/* 팔로잉 목록 */}
        <div className="space-y-4">
          {followingUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6"
            >
              <div className="flex items-center justify-between">
                {/* 사용자 정보 */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-3xl">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                      {user.isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                          활동 중
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{user.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      👥 팔로워 {user.followers.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* 버튼들 */}
                <div className="flex gap-3">
                  <Link href={`/user/${user.id}`}>
                    <button className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition font-semibold">
                      프로필 보기
                    </button>
                  </Link>
                  <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">
                    팔로잉
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {followingUsers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">아직 팔로우한 전문가가 없습니다.</p>
            <Link href="/explore">
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold">
                전문가 탐색하기
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}