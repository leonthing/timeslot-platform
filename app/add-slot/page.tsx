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
    price: ''
  });

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!currentUser) {
    alert('로그인이 필요합니다.');
    router.push('/auth');
    return;
  }

  try {
    // Supabase에 타임슬롯 저장
    const { data, error } = await supabase
      .from('timeslots')
      .insert([
        {
          user_id: currentUser.id,
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          location: formData.location,
          price: parseInt(formData.price)
        }
      ]);

    if (error) throw error;

    alert(`타임슬롯이 생성되었습니다!\n\n제목: ${formData.title}\n가격: ₩${Number(formData.price).toLocaleString()}`);
    
    // 메인 페이지로 이동
    router.push('/');
  } catch (error: any) {
    alert(`저장 실패: ${error.message}`);
    console.error('Error saving timeslot:', error);
  }
};

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
      <div className="max-w-3xl mx-auto p-8">
        {/* 뒤로가기 */}
        <Link 
          href="/" 
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          ← 내 프로필로 돌아가기
        </Link>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">새 타임슬롯 추가</h1>
          <p className="text-gray-600">당신의 시간을 판매할 준비를 하세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {/* 제목 */}
          <div className="mb-6">
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
          <div className="mb-6">
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

          {/* 시간 & 장소 (2열) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 소요 시간 */}
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
                <option value="30분">30분</option>
                <option value="45분">45분</option>
                <option value="60분">60분</option>
                <option value="90분">90분</option>
                <option value="120분">120분</option>
                <option value="60분 × 4회">60분 × 4회 (월간)</option>
                <option value="60분 × 8회">60분 × 8회 (월간)</option>
              </select>
            </div>

            {/* 장소 */}
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

          {/* 가격 */}
          <div className="mb-8">
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

          {/* 미리보기 */}
          <div className="mb-8 p-6 bg-purple-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4">미리보기</h3>
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    {formData.title || '타임슬롯 제목'}
                  </h4>
                  <p className="text-gray-600 mb-3">
                    {formData.description || '타임슬롯 설명이 여기에 표시됩니다'}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>⏱️ {formData.duration || '시간 미선택'}</span>
                    <span>📍 {formData.location || '장소 미선택'}</span>
                  </div>
                </div>
                <div className="text-right ml-6">
                  <p className="text-2xl font-bold text-purple-600">
                    ₩{formData.price ? Number(formData.price).toLocaleString() : '0'}
                  </p>
                  <button 
                    type="button"
                    className="mt-2 bg-purple-600 text-white px-6 py-2 rounded-lg"
                  >
                    예약하기
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
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