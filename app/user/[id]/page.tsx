'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TimeSlotCalendar from '@/app/components/TimeSlotCalendar';
import FollowButton from '@/app/components/FollowButton';
import { supabase } from '@/lib/supabase';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [timeslots, setTimeslots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    loadUserProfile();
  }, [userId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadUserProfile = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      const { data: slots, error: slotsError } = await supabase
        .from('timeslots')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (slotsError) throw slotsError;
      setTimeslots(slots || []);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
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

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">사용자를 찾을 수 없습니다.</p>
          <Link href="/explore" className="text-purple-600">
            ← 탐색으로 돌아가기
          </Link>
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

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <Link 
          href="/explore" 
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          ← 탐색으로 돌아가기
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl flex-shrink-0">
              {userProfile.avatar || '👤'}
            </div>
            
            <div className="flex-1 text-center sm:text-left w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{userProfile.name}</h2>
              <p className="text-gray-600 mb-3 sm:mb-4 text-base sm:text-lg">{userProfile.title}</p>
              
              <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mb-3 sm:mb-4 text-sm sm:text-base flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-lg sm:text-xl">⭐</span>
                  <span className="font-semibold text-gray-800">{userProfile.rating || 0}</span>
                  <span className="text-gray-500 text-xs sm:text-sm">({userProfile.reviews_count || 0}개 리뷰)</span>
                </div>
                <div className="text-gray-600">
                  👥 팔로워 {userProfile.followers_count?.toLocaleString() || 0}
                </div>
              </div>

              <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                {userProfile.bio || '소개가 없습니다.'}
              </p>

              <div className="w-full sm:w-auto">
                <FollowButton userId={userId as string} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">💰 예약 가능한 타임슬롯</h3>
          
          {timeslots.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6 sm:p-8 text-center">
              <p className="text-gray-500">아직 등록된 타임슬롯이 없습니다.</p>
            </div>
          ) : (
            timeslots.map((slot) => (
              <div key={slot.id} className="bg-white rounded-xl shadow p-4 sm:p-6 hover:shadow-lg transition">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{slot.title}</h4>
                    <p className="text-gray-600 text-sm sm:text-base mb-3">{slot.description}</p>
                    
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-gray-500">
                        <span>⏱️ {slot.duration}</span>
                        <span>📍 {slot.location}</span>
                      </div>
                      
                      {slot.available_days && slot.available_days.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">📅 예약 가능:</span>
                          <div className="flex flex-wrap gap-1">
                            {slot.available_days.map((day: string) => (
                              <span key={day} className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
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
                  <div className="w-full sm:w-auto text-center sm:text-right sm:ml-6">
                    <p className="text-xl sm:text-2xl font-bold text-purple-600 mb-3">
                      ₩{slot.price?.toLocaleString()}
                    </p>
                    <TimeSlotCalendar 
                      slotTitle={slot.title}
                      price={`₩${slot.price?.toLocaleString()}`}
                      slotId={slot.id}
                      hostId={userId as string}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}