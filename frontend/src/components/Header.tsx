import type { ShadowIdentity } from '../App'

type Page = 'landing' | 'feed' | 'messages' | 'payments' | 'reputation'

interface HeaderProps {
    identity: ShadowIdentity | null
    currentPage: Page
    onNavigate: (page: Page) => void
    onDisconnect: () => void
    network: string
}

function LogoSvg() {
    return (
        <svg className="brand-logo" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

export default function Header({ identity, currentPage, onNavigate, onDisconnect, network }: HeaderProps) {
    return (
        <header className="header">
            <div className="header-inner">
                <div className="header-brand" onClick={() => onNavigate('feed')}>
                    <LogoSvg />
                    <span className="brand-name">Shadow</span>
                </div>

                <nav className="header-nav">
                    <button
                        className={`nav-item ${currentPage === 'feed' ? 'active' : ''}`}
                        onClick={() => onNavigate('feed')}
                        id="nav-feed"
                    >
                        Feed
                    </button>
                    <button
                        className={`nav-item ${currentPage === 'messages' ? 'active' : ''}`}
                        onClick={() => onNavigate('messages')}
                        id="nav-messages"
                    >
                        Messages
                    </button>
                    <button
                        className={`nav-item ${currentPage === 'payments' ? 'active' : ''}`}
                        onClick={() => onNavigate('payments')}
                        id="nav-payments"
                    >
                        Payments
                    </button>
                    <button
                        className={`nav-item ${currentPage === 'reputation' ? 'active' : ''}`}
                        onClick={() => onNavigate('reputation')}
                        id="nav-reputation"
                    >
                        ZK Proof
                    </button>
                </nav>

                <div className="header-right">
                    <span className="network-indicator">{network}</span>

                    {identity && (
                        <>
                            <div className="rep-display" title={`Reputation: ${identity.reputation}`}>
                                <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" /></svg>
                                <span>{identity.reputation}</span>
                            </div>

                            <div className="wallet-badge">
                                <span className="wallet-dot"></span>
                                <span className="mono">{identity.identityHash.slice(0, 8)}</span>
                            </div>
                        </>
                    )}

                    <button className="btn btn-ghost btn-sm" onClick={onDisconnect} id="disconnect-btn">
                        Disconnect
                    </button>
                </div>
            </div>
        </header>
    )
}
