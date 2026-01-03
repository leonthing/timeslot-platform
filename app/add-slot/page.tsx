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
    location: '',
    price: '',
    isOngoing: true,
    startDate: '',
    endDate: '',
    availableDays: [] as string[],
    availableTimes: [] as string[],
    requiresApproval: false
  });

  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
  const timeSlots = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'isOngoing') {
        setFormData({ ...formData, isOngoing: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const toggleTime = (time: string) => {
    setFormData(prev => ({
      ...prev,
      availableTimes: prev.availableTimes.includes(time)
        ? prev.availableTimes.filter(t => t !== time)
        : [...prev.availableTimes, time]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      router.push('/auth');
      return;
    }

    if (formData.availableDays.length === 0) {
      alert('예약 가능 요일을 최소 1개 이상 선택해주세요.');
      return;
    }

    if (formData.availableTimes.length === 0) {
      alert('예약 가능 시간을 최소 1개 이상 선택해주세요.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('timeslots')
        .insert([
          {
            user_id: currentUser.id,
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            location: formData.location,
            price: parseInt(formData.price),
            available_days: formData.availableDays,
            available_times: formData.availableTimes,
            is_ongoing: formData.isOngoing,
            start_date: formData.isOngoing ? null : formData.startDate,
            end_date: formData.isOngoing ? null : formData.endDate,
            requires_approval: formData.requiresApproval
          }
        ]);

      if (error) throw error;

      alert(`타임슬롯이 생성되었습니다!\n\n제목: ${formData.title}\n가격: ₩${Number(formData.price).toLocaleString()}`);
      router.push('/');
    } catch (error: any) {
      alert(`저장 실패: ${error.message}`);
      console.error('Error saving timeslot:', error);
    }
  };

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

      <div className="max-w-3xl mx-auto p-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          ← 내 프로필로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">새 타임슬롯 추가</h1>
          <p className="text-gray-600">당신의 시간을 판매할 준비를 하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              타임슬롯 제목 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="예: 1:1 커피챗 상담"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              설명 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="이 타임슬롯에서 제공하는 내용을 자세히 설명해주세요"
              required
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none"
            />
          </div>

          {/* 시간 & 장소 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                소요 시간 *
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
              >
                <option value="">선택하세요</option>
                <option value="30분">1시간</option>
                <option value="45분">2시간</option>
                <option value="60분">3시간</option>
                <option value="90분">4시간</option>
                <option value="120분">5시간</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                장소 *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
              >
                <option value="">선택하세요</option>
                <option value="온라인">온라인</option>
                <option value="오프라인">오프라인</option>
                <option value="온라인/오프라인">온라인/오프라인</option>
              </select>
            </div>
          </div>

          {/* 예약 가능 기간 */}
<div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
    📆 예약 가능 기간
  </h3>
  
  <label className="flex items-center gap-3 mb-4 cursor-pointer">
    <input
      type="checkbox"
      name="isOngoing"
      checked={formData.isOngoing}
      onChange={handleChange}
      className="w-5 h-5 cursor-pointer"
    />
    <span className="text-gray-700 font-semibold">
      ♾️ 계속 제공 (종료일 없음)
    </span>
  </label>

  {!formData.isOngoing && (
    <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg">
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          시작일 📅
        </label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required={!formData.isOngoing}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          종료일 📅
        </label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required={!formData.isOngoing}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
        />
      </div>
    </div>
  )}
</div>

{/* 예약 가능 요일 */}
<div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
    📅 예약 가능 요일 <span className="text-sm text-red-600">(최소 1개 선택)</span>
  </h3>
  <p className="text-sm text-gray-600 mb-4">
    선택한 요일에만 예약을 받을 수 있어요
  </p>
  <div className="flex flex-wrap gap-3">
    {daysOfWeek.map(day => (
      <button
        key={day}
        type="button"
        onClick={() => toggleDay(day)}
        className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
          formData.availableDays.includes(day)
            ? 'bg-blue-600 text-white shadow-lg scale-105'
            : 'bg-white text-gray-600 hover:bg-blue-100 border-2 border-gray-200'
        }`}
      >
        {day}
      </button>
    ))}
  </div>
  {formData.availableDays.length > 0 && (
    <p className="text-sm text-blue-600 mt-3">
      ✓ {formData.availableDays.join(', ')} 선택됨
    </p>
  )}
</div>

{/* 예약 가능 시간 */}
<div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
    ⏰ 예약 가능 시간 <span className="text-sm text-red-600">(최소 1개 선택)</span>
  </h3>
  <p className="text-sm text-gray-600 mb-4">
    선택한 시간대에만 예약을 시작할 수 있어요
  </p>
  <div className="grid grid-cols-6 gap-2">
    {timeSlots.map(time => (
      <button
        key={time}
        type="button"
        onClick={() => toggleTime(time)}
        className={`px-3 py-3 rounded-lg text-sm font-bold transition-all ${
          formData.availableTimes.includes(time)
            ? 'bg-green-600 text-white shadow-lg'
            : 'bg-white text-gray-600 hover:bg-green-100 border-2 border-gray-200'
        }`}
      >
        {time}
      </button>
    ))}
  </div>
  {formData.availableTimes.length > 0 && (
    <p className="text-sm text-green-600 mt-3">
      ✓ {formData.availableTimes.length}개 시간대 선택됨
    </p>
  )}
</div>

          {/* 가격 */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              가격 (원) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                ₩
              </span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="50000"
                required
                min="0"
                step="1000"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              플랫폼 수수료 15%가 차감됩니다
            </p>
          </div>
{/* 예약 승인 설정 */}
<div className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50">
  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
    ✋ 예약 승인 방식
  </h3>
  <p className="text-sm text-gray-600 mb-4">
    예약 신청이 들어왔을 때 어떻게 처리할까요?
  </p>
  
  <div className="space-y-3">
    <label className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-orange-400 transition">
      <input
        type="radio"
        name="approvalType"
        checked={!formData.requiresApproval}
        onChange={() => setFormData({ ...formData, requiresApproval: false })}
        className="mt-1 w-5 h-5 cursor-pointer"
      />
      <div>
        <div className="font-bold text-gray-800 mb-1">⚡ 자동 승인 (추천)</div>
        <div className="text-sm text-gray-600">
          예약 신청이 들어오면 바로 확정됩니다. 빠르고 편리해요.
        </div>
      </div>
    </label>

    <label className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-orange-400 transition">
      <input
        type="radio"
        name="approvalType"
        checked={formData.requiresApproval}
        onChange={() => setFormData({ ...formData, requiresApproval: true })}
        className="mt-1 w-5 h-5 cursor-pointer"
      />
      <div>
        <div className="font-bold text-gray-800 mb-1">👤 수동 승인</div>
        <div className="text-sm text-gray-600">
          예약 신청을 검토한 후 직접 승인/거절할 수 있어요. 신중하게 선택할 수 있습니다.
        </div>
      </div>
    </label>
  </div>
  
  {formData.requiresApproval && (
    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800">
        💡 수동 승인 시 예약 신청자는 승인을 기다려야 합니다. 24시간 내에 응답해주세요!
      </p>
    </div>
  )}
</div>
          {/* 버튼 */}
          <div className="flex gap-4 pt-4">
            <Link 
              href="/"
              className="flex-1 text-center px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              취소
            </Link>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              타임슬롯 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}