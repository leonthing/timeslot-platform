'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TimeSlotCalendar from './components/TimeSlotCalendar';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [timeslots, setTimeslots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    
    if (user) {
      // 사용자 프로필 정보 가져오기
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);
      
      // 사용자의 타임슬롯 가져오기
      const { data: slots } = await supabase
        .from('timeslots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setTimeslots(slots || []);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
    setTimeslots([]);
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
              <Link href="/feed" className="text-gray-600 hover:text-gray-800 font-semibold">
  피드
</Link>
              <Link href="/bookings" className="text-gray-600 hover:text-gray-800 font-semibold">
                예약 내역
              </Link>
              <Link href="/" className="text-purple-600 font-semibold">
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
        {!currentUser ? (
          // 로그인하지 않은 상태
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">⏰ TimeSlot</h1>
            <p className="text-gray-600 mb-8">당신의 시간을 공유하고 판매하세요</p>
            <Link href="/auth">
              <button className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition font-semibold text-lg">
                시작하기
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* 헤더 */}
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">내 프로필</h1>
              <p className="text-gray-600">당신의 시간을 공유하고 판매하세요</p>
            </header>

            {/* 프로필 카드 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-start gap-6">
                {/* 프로필 이미지 */}
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-3xl">
                  {userProfile?.avatar || '👤'}
                </div>
                
                {/* 프로필 정보 */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {userProfile?.name || '이름 없음'}
                  </h2>
                  <p className="text-gray-600 mb-4">{userProfile?.title || '직업 미설정'}</p>
                  <p className="text-gray-700">
                    {userProfile?.bio || '자기소개를 작성해주세요.'}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-lg">⭐</span>
                      <span className="font-semibold text-gray-800">{userProfile?.rating || 0}</span>
                      <span className="text-gray-500 text-sm">({userProfile?.reviews_count || 0}개 리뷰)</span>
                    </div>
                    <div className="flex items-center gap-6 mb-4">
                    <Link href="/followers" className="text-gray-600 hover:text-purple-600 cursor-pointer transition">
  👥 팔로워 {userProfile.followers_count?.toLocaleString() || 0}
</Link>
<Link href="/following" className="text-gray-600 hover:text-purple-600 cursor-pointer transition">
  ➡️ 팔로잉 {userProfile.following_count?.toLocaleString() || 0}
</Link>
                  </div>
                    
                  </div>
                </div>
                <Link href="/edit-profile">
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                  프로필 편집
                </button>
                </Link>
              </div>
            </div>

            {/* 타임슬롯 목록 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">💰 예약 가능한 타임슬롯</h3>
                <Link href="/add-slot">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                    + 타임슬롯 추가
                  </button>
                </Link>
              </div>
              
              {timeslots.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-8 text-center">
                  <p className="text-gray-500 mb-4">아직 등록된 타임슬롯이 없습니다.</p>
                  <Link href="/add-slot">
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold">
                      첫 타임슬롯 만들기
                    </button>
                  </Link>
                </div>
              ) : (
                timeslots.map((slot) => (
                  <div key={slot.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">{slot.title}</h4>
                        <p className="text-gray-600 mb-3">{slot.description}</p>
                        <div className="space-y-2 text-sm">
  <div className="flex gap-4 text-gray-500">
    <span>⏱️ {slot.duration}</span>
    <span>📍 {slot.location}</span>
  </div>
  
  {slot.available_days && slot.available_days.length > 0 && (
    <div className="flex items-center gap-2">
      <span className="text-gray-500">📅 예약 가능:</span>
      <div className="flex gap-1">
        {slot.available_days.map((day: string) => (
          <span key={day} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
            {day}
          </span>
        ))}
      </div>
    </div>
  )}
  
  {slot.available_times && slot.available_times.length > 0 && (
    <div className="text-gray-500">
      ⏰ {slot.available_times.slice(0, 3).join(', ')}
      {slot.available_times.length > 3 && ` 외 ${slot.available_times.length - 3}개`}
    </div>
  )}
  
  {slot.requires_approval && (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
      ✋ 승인 필요
    </div>
  )}
</div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">₩{slot.price.toLocaleString()}</p>
                        <div className="mt-2">
                          <TimeSlotCalendar 
  slotTitle={slot.title}
  price={`₩${slot.price.toLocaleString()}`}
  slotId={slot.id}
  hostId={currentUser?.id}
/>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}