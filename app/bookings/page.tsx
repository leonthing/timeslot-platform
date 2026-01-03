/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
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

  // 내가 한 예약 (다른 사람의 타임슬롯 예약)
  const sentBookings = [
    {
      id: 1,
      hostName: "김개발",
      hostAvatar: "👤",
      slotTitle: "1:1 커피챗 상담",
      date: "2026-01-15",
      time: "14:00",
      price: 50000,
      status: "confirmed",
      location: "온라인"
    },
    {
      id: 2,
      hostName: "박요가",
      hostAvatar: "🧘‍♀️",
      slotTitle: "개인 요가 레슨",
      date: "2026-01-10",
      time: "10:00",
      price: 30000,
      status: "completed",
      location: "오프라인 (강남)"
    },
    {
      id: 3,
      hostName: "최연애",
      hostAvatar: "💝",
      slotTitle: "연애 고민 상담",
      date: "2026-01-20",
      time: "19:00",
      price: 40000,
      status: "confirmed",
      location: "온라인"
    }
  ];

  // 내가 받은 예약 (내 타임슬롯에 대한 예약)
  const receivedBookings = [
    {
      id: 1,
      guestName: "이고객",
      guestAvatar: "👨",
      slotTitle: "1:1 커피챗 상담",
      date: "2026-01-12",
      time: "15:00",
      price: 50000,
      status: "confirmed",
      location: "온라인"
    },
    {
      id: 2,
      guestName: "박손님",
      guestAvatar: "👩",
      slotTitle: "코드 리뷰 세션",
      date: "2026-01-08",
      time: "16:00",
      price: 80000,
      status: "completed",
      location: "온라인"
    },
    {
      id: 3,
      guestName: "정예약",
      guestAvatar: "🧑",
      slotTitle: "기술 멘토링 (월간)",
      date: "2026-01-18",
      time: "18:00",
      price: 280000,
      status: "confirmed",
      location: "온라인"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">예약 확정</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">완료</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">취소됨</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const currentBookings = activeTab === 'sent' ? sentBookings : receivedBookings;

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
              <Link href="/bookings" className="text-purple-600 font-semibold">
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
      <div className="max-w-5xl mx-auto p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">예약 내역</h1>
          <p className="text-gray-600">내 예약과 받은 예약을 확인하세요</p>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8 flex gap-2">
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'sent'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            내가 한 예약 ({sentBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'received'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            받은 예약 ({receivedBookings.length})
          </button>
        </div>

        {/* 예약 목록 */}
        <div className="space-y-4">
          {currentBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-2xl">
                    {activeTab === 'sent' ? booking.hostAvatar : 'guestAvatar' in booking ? booking.guestAvatar : '👤'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {activeTab === 'sent' ? booking.hostName : 'guestName' in booking ? booking.guestName : '게스트'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {activeTab === 'sent' ? '호스트' : '게스트'}
                    </p>
                  </div>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xl font-semibold text-gray-800 mb-3">
                  {booking.slotTitle}
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📅</span>
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>⏰</span>
                    <span>{booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📍</span>
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>💰</span>
                    <span className="font-semibold">₩{booking.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  {booking.status === 'confirmed' && (
                    <>
                      <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
                        {activeTab === 'sent' ? '일정 확인' : '일정 관리'}
                      </button>
                      <button className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold">
                        취소
                      </button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <>
                      <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
                        {activeTab === 'sent' ? '리뷰 작성' : '리뷰 보기'}
                      </button>
                      <button className="px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition font-semibold">
                        다시 예약
                      </button>
                    </>
                  )}
                  {booking.status === 'cancelled' && (
                    <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed">
                      취소된 예약
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {currentBookings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <p className="text-gray-500 text-lg mb-4">
              {activeTab === 'sent' ? '아직 예약한 내역이 없습니다.' : '아직 받은 예약이 없습니다.'}
            </p>
            <Link href="/explore">
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold">
                {activeTab === 'sent' ? '전문가 찾아보기' : '타임슬롯 추가하기'}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}