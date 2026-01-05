'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function FeedPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
const [posts, setPosts] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
const [activeTab, setActiveTab] = useState<'all' | 'following'>('all'); // 이 줄 추가

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
  if (currentUser !== null) {
    loadPosts(activeTab);
  }
}, [currentUser, activeTab]); // activeTab 추가

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadPosts = async (tab: 'all' | 'following' = 'all') => {
  try {
    let postsData;

    if (tab === 'following' && currentUser) {
      // 내가 팔로우한 사람들의 ID 가져오기
      const { data: followData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      if (!followData || followData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const followingIds = followData.map(f => f.following_id);

      // 팔로우한 사람들의 게시물만 가져오기
      const { data } = await supabase
        .from('posts')
        .select('*')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false });

      postsData = data;
    } else {
      // 모든 게시물 가져오기
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      postsData = data;
    }

    if (!postsData) {
      setLoading(false);
      return;
    }

    // 각 게시물의 작성자 정보 가져오기
    const postsWithUsers = await Promise.all(
      postsData.map(async (post) => {
        const { data: user } = await supabase
          .from('users')
          .select('id, name, avatar')
          .eq('id', post.user_id)
          .single();

        // 현재 사용자가 좋아요 했는지 확인
        let isLiked = false;
        if (currentUser) {
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', currentUser.id)
            .single();
          
          isLiked = !!likeData;
        }

        // 댓글 가져오기
        const { data: commentsData } = await supabase
          .from('post_comments')
          .select('*')
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });

        const commentsWithUsers = await Promise.all(
          (commentsData || []).map(async (comment) => {
            const { data: commentUser } = await supabase
              .from('users')
              .select('id, name, avatar')
              .eq('id', comment.user_id)
              .single();
            
            return {
              ...comment,
              user: commentUser
            };
          })
        );

        return {
          ...post,
          user,
          isLiked,
          comments: commentsWithUsers
        };
      })
    );

    setPosts(postsWithUsers);
  } catch (error) {
    console.error('Error loading posts:', error);
  } finally {
    setLoading(false);
  }
};

  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      if (isCurrentlyLiked) {
        // 좋아요 취소
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id);

        await supabase.rpc('increment_post_likes', {
          post_id: postId,
          amount: -1
        });
      } else {
        // 좋아요
        await supabase
          .from('post_likes')
          .insert([
            {
              post_id: postId,
              user_id: currentUser.id
            }
          ]);

        await supabase.rpc('increment_post_likes', {
          post_id: postId,
          amount: 1
        });
      }

      // 피드 새로고침
      loadPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId]
    });
  };

  const handleAddComment = async (postId: string) => {
    if (!currentUser || !commentInputs[postId]?.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert([
          {
            post_id: postId,
            user_id: currentUser.id,
            content: commentInputs[postId].trim()
          }
        ]);

      if (error) throw error;

      await supabase.rpc('increment_post_comments', {
        post_id: postId,
        amount: 1
      });

      // 댓글 입력 초기화
      setCommentInputs({ ...commentInputs, [postId]: '' });
      
      // 피드 새로고침
      loadPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    alert('로그아웃되었습니다.');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
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
              <Link href="/feed" className="text-purple-600 font-semibold">
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
        <div className="mb-8">
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">피드</h1>
      <p className="text-gray-600">모두의 최신 소식</p>
    </div>
    <Link href="/create-post">
      <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold">
        ✍️ 글쓰기
      </button>
    </Link>
  </div>

  {/* 탭 */}
  <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
    <button
      onClick={() => setActiveTab('all')}
      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
        activeTab === 'all'
          ? 'bg-purple-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      전체 피드
    </button>
    <button
      onClick={() => setActiveTab('following')}
      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
        activeTab === 'following'
          ? 'bg-purple-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      타임라인
    </button>
  </div>
</div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">아직 게시물이 없습니다.</p>
            <Link href="/create-post">
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold">
                첫 게시물 작성하기
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                {/* 작성자 정보 */}
                <div className="flex items-center gap-3 mb-4">
                  <Link href={`/user/${post.user?.id}`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xl cursor-pointer">
                      {post.user?.avatar || '👤'}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/user/${post.user?.id}`}>
                      <h3 className="font-bold text-gray-800 hover:text-purple-600 cursor-pointer">
                        {post.user?.name || '알 수 없음'}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                  </div>
                </div>

                {/* 게시물 내용 */}
                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* 좋아요, 댓글 버튼 */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-6 mb-4">
                    <button
                      onClick={() => handleLike(post.id, post.isLiked)}
                      className={`flex items-center gap-2 transition ${
                        post.isLiked
                          ? 'text-red-600'
                          : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <span className="text-xl">{post.isLiked ? '❤️' : '🤍'}</span>
                      <span className="font-semibold">{post.likes_count || 0}</span>
                    </button>

                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition"
                    >
                      <span className="text-xl">💬</span>
                      <span className="font-semibold">{post.comments_count || 0}</span>
                    </button>
                  </div>

                  {/* 댓글 섹션 */}
                  {showComments[post.id] && (
                    <div className="mt-4 space-y-3">
                      {/* 댓글 입력 */}
                      {currentUser && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            placeholder="댓글을 입력하세요..."
                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentInputs[post.id]?.trim()}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                              commentInputs[post.id]?.trim()
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            작성
                          </button>
                        </div>
                      )}

                      {/* 댓글 목록 */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2">
                          {post.comments.map((comment: any) => (
                            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm">
                                  {comment.user?.avatar || '👤'}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{comment.user?.name || '알 수 없음'}</span>
                                    <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                                  </div>
                                  <p className="text-gray-800 text-sm mt-1">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}