'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function FollowersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowers();
  }, []);

  const loadFollowers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth';
        return;
      }
      setCurrentUser(user);

      // 나를 팔로우하는 사람들 가져오기
      const { data: followData } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id);

      if (!followData || followData.length === 0) {
        setLoading(false);
        return;
      }

      // 팔로워들의 상세 정보 가져오기
      const followerIds = followData.map(f => f.follower_id);
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .in('id', followerIds);

      setFollowers(usersData || []);
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
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

      <div className="max-w-4xl mx-auto p-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          ← 내 프로필로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">팔로워</h1>
          <p className="text-gray-600">나를 팔로우하는 {followers.length}명</p>
        </div>

        {followers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">아직 팔로워가 없습니다.</p>
            <p className="text-gray-400 mt-2">멋진 타임슬롯을 추가하고 사람들과 연결해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followers.map((follower) => (
              <Link 
                key={follower.id} 
                href={`/user/${follower.id}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-3xl">
                    {follower.avatar || '👤'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{follower.name}</h3>
                    <p className="text-gray-600 text-sm">{follower.title}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>⭐ {follower.rating || 0}</span>
                      <span>👥 팔로워 {follower.followers_count || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}