'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Booking {
  id: string;
  slotTitle: string;
  date: string;
  time: string;
  price: number;
  status: string;
  location: string;
  userName: string;
  userAvatar: string;
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sentBookings, setSentBookings] = useState<Booking[]>([]);
  const [receivedBookings, setReceivedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAndLoadBookings();
  }, []);

  const checkUserAndLoadBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    
    if (user) {
      await loadBookings(user.id);
    }
    
    setLoading(false);
  };

  const loadBookings = async (userId: string) => {
    try {
      // 내가 한 예약 (guest_id가 나)
      const { data: sent } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          price,
          status,
          timeslots (
            title,
            location,
            user_id
          )
        `)
        .eq('guest_id', userId)
        .order('booking_date', { ascending: false });

      // 호스트 정보 가져오기
      if (sent) {
        const sentWithHosts = await Promise.all(
          sent.map(async (booking: any) => {
            const { data: host } = await supabase
              .from('users')
              .select('name, avatar')
              .eq('id', booking.timeslots.user_id)
              .single();

            return {
              id: booking.id,
              slotTitle: booking.timeslots.title,
              date: booking.booking_date,
              time: booking.booking_time,
              price: booking.price,
              status: booking.status,
              location: booking.timeslots.location,
              userName: host?.name || '알 수 없음',
              userAvatar: host?.avatar || '👤'
            };
          })
        );
        setSentBookings(sentWithHosts);
      }

      // 내가 받은 예약 (host_id가 나)
      const { data: received } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          price,
          status,
          guest_id,
          timeslots (
            title,
            location
          )
        `)
        .eq('host_id', userId)
        .order('booking_date', { ascending: false });

      // 게스트 정보 가져오기
      if (received) {
        const receivedWithGuests = await Promise.all(
          received.map(async (booking: any) => {
            const { data: guest } = await supabase
              .from('users')
              .select('name, avatar')
              .eq('id', booking.guest_id)
              .single();

            return {
              id: booking.id,
              slotTitle: booking.timeslots.title,
              date: booking.booking_date,
              time: booking.booking_time,
              price: booking.price,
              status: booking.status,
              location: booking.timeslots.location,
              userName: guest?.name || '알 수 없음',
              userAvatar: guest?.avatar || '👤'
            };
          })
        );
        setReceivedBookings(receivedWithGuests);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSentBookings([]);
    setReceivedBookings([]);
    alert('로그아웃되었습니다.');
  };

  const handleApprove = async (bookingId: string) => {
    if (!confirm('이 예약을 승인하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      alert('예약이 승인되었습니다!');
      if (currentUser) {
        await loadBookings(currentUser.id);
      }
    } catch (error: any) {
      alert(`승인 실패: ${error.message}`);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!confirm('이 예약을 거절하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      alert('예약이 거절되었습니다.');
      if (currentUser) {
        await loadBookings(currentUser.id);
      }
    } catch (error: any) {
      alert(`거절 실패: ${error.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">승인 대기</span>;
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

      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">예약 내역</h1>
          <p className="text-gray-600">내 예약과 받은 예약을 확인하세요</p>
        </div>

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

        <div className="space-y-4">
          {currentBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-2xl">
                    {booking.userAvatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{booking.userName}</h3>
                    <p className="text-sm text-gray-500">{activeTab === 'sent' ? '호스트' : '게스트'}</p>
                  </div>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xl font-semibold text-gray-800 mb-3">{booking.slotTitle}</h4>
                
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
                  {activeTab === 'received' && booking.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleApprove(booking.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        ✓ 승인
                      </button>
                      <button 
                        onClick={() => handleReject(booking.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                      >
                        ✗ 거절
                      </button>
                    </>
                  )}
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