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

  // 사용자 데이터 (실제로는 API에서 가져올 데이터)
  const usersData: any = {
    '1': {
      name: "김개발",
      title: "시니어 개발자 | 스타트업 멘토",
      avatar: "👤",
      rating: 4.9,
      reviews: 127,
      followers: 1234,
      bio: "10년 경력의 풀스택 개발자입니다. 스타트업 창업과 개발 관련 상담을 제공합니다. 현재까지 50개 이상의 스타트업을 멘토링하며 성공적인 제품 런칭을 도왔습니다.",
      tags: ["개발", "스타트업", "멘토링"],
      slots: [
        {
          id: 1,
          title: "1:1 커피챗 상담",
          description: "스타트업 아이디어 검증 및 초기 전략 상담",
          duration: "60분",
          location: "온라인/오프라인",
          price: 50000
        },
        {
          id: 2,
          title: "코드 리뷰 세션",
          description: "당신의 코드를 함께 리뷰하고 개선점을 찾습니다",
          duration: "90분",
          location: "온라인",
          price: 80000
        },
        {
          id: 3,
          title: "기술 멘토링 (월간)",
          description: "한 달간 주 1회 정기 멘토링 세션",
          duration: "60분 × 4회",
          location: "온라인",
          price: 280000
        }
      ]
    },
    '2': {
      name: "박요가",
      title: "요가 강사 | 웰니스 코치",
      avatar: "🧘‍♀️",
      rating: 5.0,
      reviews: 89,
      followers: 856,
      bio: "15년 경력의 요가 강사입니다. 몸과 마음의 균형을 찾는 요가를 가르치며, 개인의 체형과 상태에 맞춘 맞춤형 수업을 제공합니다.",
      tags: ["요가", "명상", "건강"],
      slots: [
        {
          id: 1,
          title: "개인 요가 레슨",
          description: "1:1 맞춤형 요가 수업",
          duration: "60분",
          location: "오프라인 (강남)",
          price: 30000
        },
        {
          id: 2,
          title: "명상 & 호흡법 클래스",
          description: "스트레스 해소를 위한 명상과 호흡법",
          duration: "45분",
          location: "온라인",
          price: 25000
        },
        {
          id: 3,
          title: "월간 요가 패키지",
          description: "주 2회 정기 요가 수업 (총 8회)",
          duration: "60분 × 8회",
          location: "오프라인",
          price: 200000
        }
      ]
    },
    '3': {
      name: "이디자이너",
      title: "UX/UI 디자이너",
      avatar: "🎨",
      rating: 4.8,
      reviews: 64,
      followers: 542,
      bio: "7년차 프로덕트 디자이너입니다. 사용자 중심의 디자인과 효과적인 포트폴리오 제작을 도와드립니다.",
      tags: ["디자인", "포트폴리오", "피그마"],
      slots: [
        {
          id: 1,
          title: "포트폴리오 리뷰",
          description: "디자인 포트폴리오 피드백 및 개선 방향 제시",
          duration: "90분",
          location: "온라인",
          price: 70000
        },
        {
          id: 2,
          title: "UX/UI 멘토링",
          description: "실무 프로젝트 기반 디자인 멘토링",
          duration: "120분",
          location: "온라인",
          price: 100000
        }
      ]
    },
    '4': {
      name: "최연애",
      title: "연애 상담 전문가",
      avatar: "💝",
      rating: 4.7,
      reviews: 203,
      followers: 1876,
      bio: "심리학 전공 후 10년간 연애 및 관계 상담을 해왔습니다. 솔직하고 현실적인 조언으로 많은 분들의 고민을 해결해드렸습니다.",
      tags: ["연애", "관계", "상담"],
      slots: [
        {
          id: 1,
          title: "연애 고민 상담",
          description: "현재 겪고 있는 연애 문제 해결",
          duration: "60분",
          location: "온라인",
          price: 40000
        },
        {
          id: 2,
          title: "소개팅/데이트 코칭",
          description: "매력적인 첫인상과 대화법",
          duration: "90분",
          location: "온라인/오프라인",
          price: 60000
        }
      ]
    }
  };

  const user = usersData[userId as string] || usersData['1'];

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
        {/* 뒤로가기 버튼 */}
        <Link 
          href="/explore" 
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          ← 탐색으로 돌아가기
        </Link>

        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* 프로필 이미지 */}
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-5xl">
              {user.avatar}
            </div>
            
            {/* 프로필 정보 */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h2>
              <p className="text-gray-600 mb-4 text-lg">{user.title}</p>
              
              {/* 평점 & 팔로워 */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-xl">⭐</span>
                  <span className="font-semibold text-gray-800 text-lg">{user.rating}</span>
                  <span className="text-gray-500">({user.reviews}개 리뷰)</span>
                </div>
                <div className="text-gray-600">
                  👥 팔로워 {user.followers.toLocaleString()}
                </div>
              </div>

              {/* 소개 */}
              <p className="text-gray-700 leading-relaxed mb-4">
                {user.bio}
              </p>

              {/* 태그 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {user.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* 팔로우 버튼 */}
              <FollowButton userId={userId} />
            </div>
          </div>
        </div>

        {/* 타임슬롯 목록 */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">💰 예약 가능한 타임슬롯</h3>
          
          {user.slots.map((slot: any) => (
            <div key={slot.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">{slot.title}</h4>
                  <p className="text-gray-600 mb-3">{slot.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>⏱️ {slot.duration}</span>
                    <span>📍 {slot.location}</span>
                  </div>
                </div>
                <div className="text-right ml-6">
                  <p className="text-2xl font-bold text-purple-600 mb-2">
                    ₩{slot.price.toLocaleString()}
                  </p>
                  <TimeSlotCalendar 
  slotTitle={slot.title}
  price={`₩${slot.price.toLocaleString()}`}
  slotId={slot.id}
  hostId={userId}
/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}