'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AddSlotPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    location: '',
    requiresApproval: false,
    availableDays: [] as string[],
    availableTimes: [] as string[],
    bookingStartDate: '',
    bookingEndDate: ''
  });

  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setCurrentUser(user);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const toggleDay = (day: string) => {
    setFormData({
      ...formData,
      availableDays: formData.availableDays.includes(day)
        ? formData.availableDays.filter(d => d !== day)
        : [...formData.availableDays, day]
    });
  };

  const toggleTime = (time: string) => {
    setFormData({
      ...formData,
      availableTimes: formData.availableTimes.includes(time)
        ? formData.availableTimes.filter(t => t !== time)
        : [...formData.availableTimes, time]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (formData.availableDays.length === 0) {
      alert('예약 가능한 요일을 최소 1개 선택해주세요.');
      return;
    }

    if (formData.availableTimes.length === 0) {
      alert('예약 가능한 시간을 최소 1개 선택해주세요.');
      return;
    }

    try {
      const { error } = await supabase
        .from('timeslots')
        .insert([
          {
            user_id: currentUser.id,
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            price: parseInt(formData.price),
            location: formData.location,
            requires_approval: formData.requiresApproval,
            available_days: formData.availableDays,
            available_times: formData.availableTimes,
            booking_start_date: formData.bookingStartDate || null,
            booking_end_date: formData.bookingEndDate || null
          }
        ]);

      if (error) throw error;

      alert('타임슬롯이 생성되었습니다!');
      router.push('/');
    } catch (error: any) {
      console.error('Error creating timeslot:', error);
      alert(`타임슬롯 생성 실패: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    alert('로그아웃되었습니다.');
    router.push('/auth');
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">타임슬롯 추가</h1>
          <p className="text-sm sm:text-base text-gray-600">새로운 타임슬롯을 생성하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 space-y-4 sm:space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              타임슬롯 제목 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="예: 1:1 코드 리뷰"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm sm:text-base"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              설명 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="타임슬롯에 대한 설명을 작성하세요"
              required
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none text-sm sm:text-base"
            />
          </div>

          {/* 소요 시간과 가격 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                소요 시간 *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="예: 30분"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                가격 (₩) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="50000"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm sm:text-base"
              />
            </div>
          </div>

          {/* 장소 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              장소 *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="온라인 (Zoom) 또는 오프라인 장소"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm sm:text-base"
            />
          </div>

          {/* 예약 가능 요일 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              예약 가능한 요일 *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base ${
                    formData.availableDays.includes(day)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* 예약 가능 시간 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              예약 가능한 시간 *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleTime(time)}
                  className={`py-2 rounded-lg font-semibold transition text-xs sm:text-sm ${
                    formData.availableTimes.includes(time)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* 예약 가능 기간 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                예약 시작일 (선택)
              </label>
              <input
                type="date"
                name="bookingStartDate"
                value={formData.bookingStartDate}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                예약 종료일 (선택)
              </label>
              <input
                type="date"
                name="bookingEndDate"
                value={formData.bookingEndDate}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm sm:text-base"
              />
            </div>
          </div>

          {/* 승인 필요 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requiresApproval"
              name="requiresApproval"
              checked={formData.requiresApproval}
              onChange={handleChange}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="requiresApproval" className="text-gray-700 font-semibold text-sm sm:text-base">
              예약 시 승인 필요 (자동 확정이 아닌 수동 승인)
            </label>
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
              타임슬롯 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}