import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal, 
  Edit3, 
  Trash2,
  Flag,
  Link,
  Send,
  Reply,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
  Users,
  Copy
} from 'lucide-react';

interface PostAuthor {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
}

interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  created_at: string;
  reactions_count: number;
  replies?: Comment[];
  parent_id?: number;
}

interface Post {
  id: number;
  author: PostAuthor;
  content: string;
  post_type: "post" | "testimonial";
  media_url?: string;
  media_type?: string;
  created_at: string;
  reactions_count: number;
  comments_count: number;
  shares_count: number;
  is_profile_update?: boolean;
  is_cover_update?: boolean;
}

interface PostCardProps {
  post: Post;
  userToken: string;
  currentUserId: number;
  canEdit?: boolean;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onBookmark?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onEdit?: (postId: number) => void;
}

const reactionTypes = [
  { type: 'like', icon: Heart, color: 'text-red-500', label: 'Curtir' },
  { type: 'love', icon: Heart, color: 'text-pink-500', label: 'Amei' },
  { type: 'haha', icon: Laugh, color: 'text-yellow-500', label: 'Haha' },
  { type: 'wow', icon: ThumbsUp, color: 'text-blue-500', label: 'Uau' },
  { type: 'sad', icon: Frown, color: 'text-gray-500', label: 'Triste' },
  { type: 'angry', icon: Angry, color: 'text-red-600', label: 'Grr' },
];

export function EnhancedPostCard({ 
  post, 
  userToken,
  currentUserId,
  canEdit = false,
  onLike, 
  onComment, 
  onShare, 
  onBookmark,
  onDelete,
  onEdit
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.reactions_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [sharesCount, setSharesCount] = useState(post.shares_count);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  
  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);

  const handleReaction = async (reactionType: string = "like") => {
    try {
      const response = await fetch(`http://localhost:8000/posts/${post.id}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ reaction_type: reactionType }),
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setCurrentReaction(reactionType);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        onLike?.(post.id);
      }
    } catch (error) {
      console.error("Erro ao reagir ao post:", error);
    }
    setShowReactionPicker(false);
  };

  const handleShare = async (shareType: 'timeline' | 'message' | 'copy') => {
    try {
      if (shareType === 'copy') {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        alert("Link copiado para a área de transferência!");
        setShowShareModal(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/posts/${post.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ share_type: shareType }),
      });

      if (response.ok) {
        onShare?.(post.id);
        if (shareType === 'timeline') {
          alert("Post compartilhado na sua linha do tempo!");
        }
      }
    } catch (error) {
      console.error("Erro ao compartilhar post:", error);
    }
    setShowShareModal(false);
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/posts/${post.id}/comments`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoadingComment(true);
    try {
      const response = await fetch("http://localhost:8000/comments/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          post_id: parseInt(post.id.toString()),
        }),
      });

      if (response.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    } finally {
      setLoadingComment(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setLoadingComment(true);
    try {
      const response = await fetch("http://localhost:8000/comments/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyText,
          post_id: parseInt(post.id.toString()),
          parent_id: parentId,
        }),
      });

      if (response.ok) {
        setReplyText("");
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
    } finally {
      setLoadingComment(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar este post?")) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:8000/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        onDelete?.(post.id);
      } else {
        alert("Erro ao deletar post");
      }
    } catch (error) {
      console.error("Erro ao deletar post:", error);
      alert("Erro ao deletar post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = async () => {
    alert("Funcionalidade de denúncia será implementada");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getPostTypeLabel = () => {
    if (post.is_profile_update) return "atualizou a foto do perfil";
    if (post.is_cover_update) return "atualizou a foto de capa";
    if (post.post_type === "testimonial") return "escreveu um depoimento";
    return "";
  };

  const currentReactionIcon = currentReaction 
    ? reactionTypes.find(r => r.type === currentReaction)?.icon || Heart
    : Heart;

  const currentReactionColor = currentReaction 
    ? reactionTypes.find(r => r.type === currentReaction)?.color || 'text-gray-600'
    : 'text-gray-600';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={
                post.author.avatar
                  ? post.author.avatar.startsWith("http")
                    ? post.author.avatar
                    : `http://localhost:8000${post.author.avatar}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${post.author.first_name} ${post.author.last_name}`
                    )}&background=3B82F6&color=fff`
              }
              alt={`${post.author.first_name} ${post.author.last_name}`}
              className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
              onClick={() => window.location.href = `/profile/${post.author.id}`}
            />
            
            <div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.location.href = `/profile/${post.author.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {post.author.first_name} {post.author.last_name}
                </button>
                
                {getPostTypeLabel() && (
                  <span className="text-gray-600 text-sm">{getPostTypeLabel()}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatTimeAgo(post.created_at)}</span>
                {post.post_type === "testimonial" && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                    Depoimento
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showOptions && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {canEdit && (
                  <>
                    <button
                      onClick={() => {
                        onEdit?.(post.id);
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowOptions(false);
                      }}
                      disabled={isDeleting}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isDeleting ? "Deletando..." : "Deletar"}</span>
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                  </>
                )}
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                    setShowOptions(false);
                    alert("Link copiado!");
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Link className="w-4 h-4" />
                  <span>Copiar link</span>
                </button>
                
                {!canEdit && (
                  <button
                    onClick={() => {
                      handleReport();
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Denunciar</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {post.content && (
          <p className="text-gray-900 mb-4 whitespace-pre-wrap">{post.content}</p>
        )}

        {/* Media */}
        {post.media_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            {post.media_type?.startsWith("image/") ? (
              <img
                src={
                  post.media_url.startsWith("http")
                    ? post.media_url
                    : `http://localhost:8000${post.media_url}`
                }
                alt="Mídia do post"
                className="w-full max-h-96 object-cover"
              />
            ) : post.media_type?.startsWith("video/") ? (
              <video
                src={
                  post.media_url.startsWith("http")
                    ? post.media_url
                    : `http://localhost:8000${post.media_url}`
                }
                controls
                className="w-full max-h-96"
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            ) : null}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {/* Reaction counts */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {likesCount > 0 && (
              <span>{likesCount} {likesCount === 1 ? "curtida" : "curtidas"}</span>
            )}
            {post.comments_count > 0 && (
              <button onClick={handleToggleComments} className="hover:underline">
                {post.comments_count} {post.comments_count === 1 ? "comentário" : "comentários"}
              </button>
            )}
            {post.shares_count > 0 && (
              <span>{post.shares_count} {post.shares_count === 1 ? "compartilhamento" : "compartilhamentos"}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-1">
            {/* Enhanced Reaction Button */}
            <div className="relative">
              <button
                onClick={() => handleReaction(currentReaction || "like")}
                onMouseEnter={() => setShowReactionPicker(true)}
                onMouseLeave={() => setShowReactionPicker(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked
                    ? `bg-red-50 ${currentReactionColor}`
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {React.createElement(currentReactionIcon, { 
                  className: `w-5 h-5 ${isLiked ? "fill-current" : ""}` 
                })}
                <span>{currentReaction ? reactionTypes.find(r => r.type === currentReaction)?.label : "Curtir"}</span>
              </button>

              {/* Reaction Picker */}
              {showReactionPicker && (
                <div 
                  className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1 flex space-x-1 z-20"
                  onMouseEnter={() => setShowReactionPicker(true)}
                  onMouseLeave={() => setShowReactionPicker(false)}
                >
                  {reactionTypes.map((reaction) => (
                    <button
                      key={reaction.type}
                      onClick={() => handleReaction(reaction.type)}
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${reaction.color}`}
                      title={reaction.label}
                    >
                      <reaction.icon className="w-6 h-6" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleToggleComments}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Comentar</span>
            </button>

            {/* Enhanced Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareModal(!showShareModal)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Share className="w-5 h-5" />
                <span>Compartilhar</span>
              </button>

              {/* Share Modal */}
              {showShareModal && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <button
                    onClick={() => handleShare('timeline')}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <Users className="w-5 h-5" />
                    <span>Compartilhar na timeline</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="w-5 h-5" />
                    <span>Copiar link</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              onBookmark?.(post.id);
            }}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100">
          {/* Comment Input */}
          <div className="p-4 bg-gray-50">
            <form onSubmit={handleSubmitComment} className="flex space-x-3">
              <img
                src={`https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff`}
                alt="Your avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loadingComment || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 border-b border-gray-100 last:border-b-0">
                {/* Main Comment */}
                <div className="flex space-x-3">
                  <img
                    src={
                      comment.author.avatar ||
                      `https://ui-avatars.com/api/?name=${comment.author.first_name}+${comment.author.last_name}&background=3B82F6&color=fff`
                    }
                    alt={`${comment.author.first_name} ${comment.author.last_name}`}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="font-medium text-sm">
                        {comment.author.first_name} {comment.author.last_name}
                      </p>
                      <p className="text-gray-900">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{formatTimeAgo(comment.created_at)}</span>
                      <button className="hover:text-red-600 flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>Curtir</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="hover:text-blue-600 flex items-center space-x-1"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Responder</span>
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <form
                        onSubmit={(e) => handleSubmitReply(e, comment.id)}
                        className="mt-2 flex space-x-2"
                      >
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escreva uma resposta..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          type="submit"
                          disabled={loadingComment || !replyText.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-6 mt-3 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex space-x-3">
                            <img
                              src={
                                reply.author.avatar ||
                                `https://ui-avatars.com/api/?name=${reply.author.first_name}+${reply.author.last_name}&background=3B82F6&color=fff`
                              }
                              alt={`${reply.author.first_name} ${reply.author.last_name}`}
                              className="w-6 h-6 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-2">
                                <p className="font-medium text-xs">
                                  {reply.author.first_name}{" "}
                                  {reply.author.last_name}
                                </p>
                                <p className="text-gray-900 text-sm">
                                  {reply.content}
                                </p>
                              </div>
                              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                <span>{formatTimeAgo(reply.created_at)}</span>
                                <button className="hover:text-red-600 flex items-center space-x-1">
                                  <Heart className="w-3 h-3" />
                                  <span>Curtir</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close modals */}
      {(showShareModal || showReactionPicker) && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowShareModal(false);
            setShowReactionPicker(false);
          }}
        />
      )}
    </div>
  );
}
