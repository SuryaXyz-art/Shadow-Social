import { useState } from 'react'
import type { Message } from '../App'

interface MessagesProps {
    messages: Message[]
    onSendMessage: (receiver: string, content: string) => void
    isLoading: boolean
}

export default function Messages({ messages, onSendMessage, isLoading }: MessagesProps) {
    const [receiver, setReceiver] = useState('')
    const [content, setContent] = useState('')

    const handleSend = () => {
        if (!receiver.trim() || !content.trim()) return
        onSendMessage(receiver, content)
        setContent('')
    }

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="messages-container container">
            {/* Compose Message */}
            <div className="card message-composer">
                <div className="compose-header">
                    <span className="feature-icon">💬</span>
                    <div>
                        <h3 style={{ marginBottom: '4px' }}>Send Private Message</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            End-to-end encrypted via Aleo
                        </p>
                    </div>
                </div>

                <div className="message-input-group">
                    <label className="message-label">Recipient Address</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="aleo1..."
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                    />
                </div>

                <div className="message-input-group">
                    <label className="message-label">Message</label>
                    <textarea
                        className="input textarea"
                        placeholder="Your private message..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="compose-footer">
                    <span className="compose-hint">
                        🔐 Only recipient can decrypt
                    </span>
                    <button
                        className="btn btn-primary"
                        onClick={handleSend}
                        disabled={isLoading || !receiver.trim() || !content.trim()}
                    >
                        {isLoading ? <span className="spinner"></span> : 'Send'}
                    </button>
                </div>
            </div>

            {/* Messages List */}
            <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Sent Messages
            </h3>

            {messages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <p className="empty-title">No messages yet</p>
                    <p className="empty-desc">Send your first private message</p>
                </div>
            ) : (
                <div className="messages-list">
                    {messages.map((msg) => (
                        <div className="card message-card" key={msg.id}>
                            <div className="message-header">
                                <span className="message-sender badge badge-ghost">
                                    To: {msg.senderHash}...
                                </span>
                                <span className="message-time">{formatTime(msg.sentAt)}</span>
                            </div>
                            <p className="message-content">{msg.content}</p>
                            <span className="message-encrypted">
                                🔒 Encrypted • {msg.contentHash}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
