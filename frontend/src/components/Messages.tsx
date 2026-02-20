import { useState } from 'react'
import type { Message } from '../App'

interface MessagesProps {
    messages: Message[]
    onSendMessage: (receiver: string, content: string) => void
    isLoading: boolean
}

function LockIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}

function SendIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    )
}

export default function Messages({ messages, onSendMessage, isLoading }: MessagesProps) {
    const [receiver, setReceiver] = useState('')
    const [content, setContent] = useState('')

    const handleSend = () => {
        if (!receiver.trim() || !content.trim()) return
        onSendMessage(receiver, content)
        setContent('')
    }

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="messages-container container">

            {/* Compose */}
            <div className="card card-glass msg-composer">
                <div className="msg-composer-header">
                    <div className="msg-composer-icon"><SendIcon /></div>
                    <div>
                        <h3>Send Private Message</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            End-to-end encrypted via Aleo zero-knowledge proofs
                        </p>
                    </div>
                </div>

                <div className="field-group">
                    <label className="field-label">Recipient Address</label>
                    <input
                        type="text"
                        className="input mono"
                        placeholder="aleo1..."
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        id="msg-receiver-input"
                    />
                </div>

                <div className="field-group">
                    <label className="field-label">Message</label>
                    <textarea
                        className="input textarea"
                        placeholder="Your message. Only the recipient can decrypt this."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        id="msg-content-input"
                    />
                </div>

                <div className="compose-bottom">
                    <span className="compose-meta">Encrypted off-chain. Hash stored on-chain.</span>
                    <button
                        className="btn btn-primary"
                        onClick={handleSend}
                        disabled={isLoading || !receiver.trim() || !content.trim()}
                        id="send-msg-btn"
                    >
                        {isLoading ? <span className="spinner"></span> : 'Send'}
                    </button>
                </div>
            </div>

            {/* Sent Messages */}
            <div className="msg-section-title">Sent Messages</div>

            {messages.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon"><SendIcon /></div>
                    <p className="empty-title">No messages yet</p>
                    <p className="empty-desc">Send your first encrypted message</p>
                </div>
            ) : (
                <div className="msg-list">
                    {messages.map((msg) => (
                        <div className="card card-glass msg-card" key={msg.id}>
                            <div className="msg-card-header">
                                <span className="badge badge-ghost mono">To: {msg.senderHash}</span>
                                <span className="msg-card-time">{formatTime(msg.sentAt)}</span>
                            </div>
                            <p className="msg-card-body">{msg.content}</p>
                            <div className="msg-card-hash">
                                <LockIcon />
                                <span className="mono">{msg.contentHash}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
