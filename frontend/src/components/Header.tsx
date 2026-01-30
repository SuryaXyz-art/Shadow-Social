import type { ShadowIdentity } from '../App'
import './Header.css'

interface HeaderProps {
    identity: ShadowIdentity | null
    currentPage: 'landing' | 'feed' | 'messages' | 'payments'
    onNavigate: (page: 'landing' | 'feed' | 'messages' | 'payments') => void
    onDisconnect: () => void
}

export default function Header({ identity, currentPage, onNavigate, onDisconnect }: HeaderProps) {
    return (
        <header className="header">
            <div className="header-inner container container-wide">
                <div className="header-brand" onClick={() => onNavigate('feed')}>
                    <span className="brand-icon">🕶️</span>
                    <span className="brand-name">Shadow</span>
                </div>

                <nav className="header-nav">
                    <button
                        className={`nav-item ${currentPage === 'feed' ? 'active' : ''}`}
                        onClick={() => onNavigate('feed')}
                    >
                        📝 Feed
                    </button>
                    <button
                        className={`nav-item ${currentPage === 'messages' ? 'active' : ''}`}
                        onClick={() => onNavigate('messages')}
                    >
                        💬 Messages
                    </button>
                    <button
                        className={`nav-item ${currentPage === 'payments' ? 'active' : ''}`}
                        onClick={() => onNavigate('payments')}
                    >
                        💸 Pay
                    </button>
                </nav>

                <div className="header-right">
                    {identity && (
                        <div className="identity-badge">
                            <span className="identity-dot"></span>
                            <span className="identity-hash">{identity.identityHash.slice(0, 8)}...</span>
                        </div>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={onDisconnect}>
                        Exit
                    </button>
                </div>
            </div>
        </header>
    )
}
