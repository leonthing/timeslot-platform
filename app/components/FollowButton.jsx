'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function FollowButton({ userId, initialFollowing = false }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const updateFollowerCount = async (targetUserId, change) => {
  const { error } = await supabase.rpc('increment_follower_count', {
    user_id: targetUserId,
    amount: change
  });
  
  if (error) {
    console.error('Error updating follower count:', error);
  }
};

const updateFollowingCount = async (targetUserId, change) => {
  console.log('updateFollowingCount called:', targetUserId, change);
  
  const { error } = await supabase.rpc('increment_following_count', {
    user_id: targetUserId,
    amount: change
  });
  
  if (error) {
    console.error('Error updating following count:', error);
  } else {
    console.log('Following count updated successfully!');
  }
};

  useEffect(() => {
    checkFollowStatus();
  }, []);

 const checkFollowStatus = async () => {
  // 현재 로그인한 사용자 확인
  const { data: { user } } = await supabase.auth.getUser();
  setCurrentUser(user);

  if (!user) return;

  // 팔로우 상태 확인 (.single() 제거)
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', userId);

  // data 배열의 길이가 0보다 크면 팔로우 중
  setIsFollowing(data && data.length > 0);
};

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isFollowing) {
  // 언팔로우
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', currentUser.id)
    .eq('following_id', userId);

  if (error) throw error;

  // 상대방 팔로워 수 감소
  await updateFollowerCount(userId, -1);
  // 내 팔로잉 수 감소
  await updateFollowingCount(currentUser.id, -1);

  setIsFollowing(false);
  alert('팔로우를 취소했습니다.');
  
  window.location.reload();
} else {
  // 팔로우
  const { error } = await supabase
    .from('follows')
    .insert([
      {
        follower_id: currentUser.id,
        following_id: userId
      }
    ]);

  if (error) throw error;

  // 상대방 팔로워 수 증가
  await updateFollowerCount(userId, 1);
  // 내 팔로잉 수 증가
  await updateFollowingCount(currentUser.id, 1);

  setIsFollowing(true);
  alert('팔로우했습니다!');
  
  window.location.reload();
}
    } catch (error) {
      console.error('Follow error:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      alert(`오류가 발생했습니다: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`px-8 py-3 rounded-lg font-semibold transition ${
        isFollowing
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          : 'bg-purple-600 text-white hover:bg-purple-700'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? '처리 중...' : isFollowing ? '팔로잉' : '팔로우'}
    </button>
  );
}