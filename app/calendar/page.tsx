'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '@/lib/supabase';

export default function CalendarPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'following'>('my');

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (currentUser !== null) {
      loadEvents();
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    filterEventsByDate(selectedDate);
  }, [selectedDate, events]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadEvents = async () => {
    try {
      let eventsData;

      if (activeTab === 'my' && currentUser) {
        // 내 이벤트만
        const { data } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('event_date', { ascending: true });
        
        eventsData = data;
      } else if (activeTab === 'following' && currentUser) {
        // 팔로우한 사람들의 이벤트
        const { data: followData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUser.id);

        if (!followData || followData.length === 0) {
          setEvents([]);
          setLoading(false);
          return;
        }

        const followingIds = followData.map(f => f.following_id);

        const { data } = await supabase
          .from('calendar_events')
          .select('*')
          .in('user_id', followingIds)
          .order('event_date', { ascending: true });

        eventsData = data;
      }

      if (!eventsData) {
        setLoading(false);
        return;
      }

      // 각 이벤트의 작성자 정보 가져오기
      const eventsWithUsers = await Promise.all(
        eventsData.map(async (event) => {
          const { data: user } = await supabase
            .from('users')
            .select('id, name, avatar')
            .eq('id', event.user_id)
            .single();

          // 현재 사용자가 참석 신청했는지 확인
          let isAttending = false;
          if (currentUser) {
            const { data: attendeeData } = await supabase
              .from('event_attendees')
              .select('*')
              .eq('event_id', event.id)
              .eq('user_id', currentUser.id)
              .single();
            
            isAttending = !!attendeeData;
          }

          return {
            ...event,
            user,
            isAttending
          };
        })
      );

      setEvents(eventsWithUsers);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const filtered = events.filter(event => event.event_date === dateString);
    setSelectedDateEvents(filtered);
  };

  const handleAttend = async (eventId: string, isCurrentlyAttending: boolean) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      if (isCurrentlyAttending) {
        // 참석 취소
        await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', currentUser.id);

        await supabase.rpc('increment_event_attendees', {
          event_id: eventId,
          amount: -1
        });
      } else {
        // 참석 신청
        await supabase
          .from('event_attendees')
          .insert([
            {
              event_id: eventId,
              user_id: currentUser.id
            }
          ]);

        await supabase.rpc('increment_event_attendees', {
          event_id: eventId,
          amount: 1
        });
      }

      loadEvents();
    } catch (error) {
      console.error('Error toggling attendance:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    alert('로그아웃되었습니다.');
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  const getTileClassName = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split('T')[0];
    const hasEvent = events.some(event => event.event_date === dateString);
    return hasEvent ? 'has-event' : '';
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
      <style jsx global>{`
        .has-event {
          background-color: rgba(147, 51, 234, 0.2) !important;
          font-weight: bold;
        }
      `}</style>

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
              <Link href="/calendar" className="text-purple-600 font-semibold">
                캘린더
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

      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">캘린더</h1>
              <p className="text-gray-600">이벤트를 확인하고 참석하세요</p>
            </div>
            <Link href="/create-event">
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold">
                📅 이벤트 만들기
              </button>
            </Link>
          </div>

          {/* 탭 */}
          <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                activeTab === 'my'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              내 이벤트
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                activeTab === 'following'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              팔로잉 이벤트
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 캘린더 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Calendar
              onChange={(date) => setSelectedDate(date as Date)}
              value={selectedDate}
              locale="ko-KR"
              tileClassName={getTileClassName}
              className="border-none w-full"
            />
          </div>

          {/* 선택한 날짜의 이벤트 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedDate.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">이 날짜에 이벤트가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">{event.title}</h3>
                        {event.user && (
                          <Link href={`/user/${event.user.id}`}>
                            <p className="text-sm text-gray-500 hover:text-purple-600 cursor-pointer">
                              by {event.user.name}
                            </p>
                          </Link>
                        )}
                      </div>
                      {event.event_time && (
                        <span className="text-purple-600 font-semibold">
                          {formatTime(event.event_time)}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    )}

                    {event.location && (
                      <p className="text-gray-500 text-sm mb-3">
                        📍 {event.location}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        👥 {event.attendees_count || 0}명 참석
                      </span>

                      {currentUser && event.user_id !== currentUser.id && (
                        <button
                          onClick={() => handleAttend(event.id, event.isAttending)}
                          className={`px-4 py-2 rounded-lg font-semibold transition ${
                            event.isAttending
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {event.isAttending ? '참석 취소' : '참석하기'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}