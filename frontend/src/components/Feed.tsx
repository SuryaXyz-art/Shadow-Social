import { useState } from 'react'
import type { Post } from '../App'

interface FeedProps {
    posts: Post[]
    onCreatePost: (content: string) => void
    isLoading: boolean
    cooldownRemaining: number
    cooldownTotal: number
}

function UserIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    )
}

function EditIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
        </svg>
    )
}

export default function Feed({ posts, onCreatePost, isLoading, cooldownRemaining, cooldownTotal }: FeedProps) {
    const [content, setContent] = useState('')

    const handleSubmit = () => {
        if (!content.trim()) return
        onCreatePost(content)
        setContent('')
    }

    const formatTime = (ts: number) => {
        const diff = Date.now() - ts
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        return `${Math.floor(hours / 24)}d ago`
    }

    const cooldownSecs = Math.ceil(cooldownRemaining / 1000)
    const cooldownPct = cooldownTotal > 0 ? ((cooldownTotal - cooldownRemaining) / cooldownTotal) * 100 : 100

    return (
        <div className="feed-container container">

            {/* Compose */}
            <div className="card card-glass compose">
                <div className="compose-top">
                    <div className="compose-avatar"><UserIcon /></div>
                    <span>Posting anonymously via zero-knowledge proof</span>
                </div>

                <textarea
                    className="input textarea"
                    placeholder="Write something. Your identity stays private."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={500}
                    id="compose-textarea"
                />

                {cooldownRemaining > 0 && (
                    <div className="cooldown">
                        <span>Rate limited</span>
                        <div className="cooldown-track">
                            <div className="cooldown-fill" style={{ width: `${cooldownPct}%` }} />
                        </div>
                        <span className="mono">{cooldownSecs}s</span>
                    </div>
                )}

                <div className="compose-bottom">
                    <span className="compose-meta">
                        Content hashed with BHP256 before submission
                    </span>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={isLoading || !content.trim() || cooldownRemaining > 0}
                        id="post-btn"
                    >
                        {isLoading ? <span className="spinner"></span> : 'Post'}
                    </button>
                </div>
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon"><EditIcon /></div>
                    <p className="empty-title">No posts yet</p>
                    <p className="empty-desc">Be the first to post anonymously</p>
                </div>
            ) : (
                <div className="posts-list">
                    {posts.map((post, i) => (
                        <div className="card post-card" key={post.id} style={{ animationDelay: `${i * 40}ms` }}>
                            <div className="post-header">
                                <div className="compose-avatar"><UserIcon /></div>
                                <div className="post-meta">
                                    <span className="post-author">Anonymous</span>
                                    <span className="post-time">{formatTime(post.createdAt)}</span>
                                </div>
                                <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>Verified</span>
                            </div>

                            <p className="post-content">{post.content}</p>

                            <div className="post-footer">
                                <span className="post-action">Reply</span>
                                <span className="post-action">Share</span>
                                <span className="post-hash">#{post.contentHash}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
