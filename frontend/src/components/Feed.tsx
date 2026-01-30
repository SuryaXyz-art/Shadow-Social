import { useState } from 'react'
import type { Post } from '../App'

interface FeedProps {
    posts: Post[]
    onCreatePost: (content: string) => void
    isLoading: boolean
}

export default function Feed({ posts, onCreatePost, isLoading }: FeedProps) {
    const [postContent, setPostContent] = useState('')

    const handleSubmit = () => {
        if (!postContent.trim()) return
        onCreatePost(postContent)
        setPostContent('')
    }

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        return `${Math.floor(hours / 24)}d ago`
    }

    return (
        <div className="feed-container container">
            {/* Compose Box */}
            <div className="card compose-box">
                <div className="compose-header">
                    <div className="avatar avatar-ghost">👤</div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Posting anonymously
                    </span>
                </div>

                <textarea
                    className="input compose-input textarea"
                    placeholder="What's on your mind? No one will know it's you..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    maxLength={500}
                />

                <div className="compose-footer">
                    <span className="compose-hint">
                        🔒 Identity hidden via ZK proof
                    </span>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={isLoading || !postContent.trim()}
                    >
                        {isLoading ? <span className="spinner"></span> : 'Post'}
                    </button>
                </div>
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🕶️</div>
                    <p className="empty-title">The shadows are quiet</p>
                    <p className="empty-desc">Be the first to post anonymously</p>
                </div>
            ) : (
                <div className="posts-list">
                    {posts.map((post) => (
                        <div className="card post-card" key={post.id}>
                            <div className="post-header">
                                <div className="avatar avatar-ghost">👤</div>
                                <div className="post-meta">
                                    <span className="post-author">Anonymous</span>
                                    <span className="post-time">{formatTime(post.createdAt)}</span>
                                </div>
                                <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>
                                    🔒 ZK
                                </span>
                            </div>

                            <p className="post-content">{post.content}</p>

                            <div className="post-footer">
                                <span className="post-action">💭 Reply</span>
                                <span className="post-action">🔗 Share</span>
                                <span className="post-action" style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-ghost)' }}>
                                    #{post.contentHash}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
