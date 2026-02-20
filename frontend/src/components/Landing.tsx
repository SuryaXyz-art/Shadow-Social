interface LandingProps {
    onConnect: () => void
    isLoading: boolean
    programId: string
}

function LockIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}

function MessageIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}

function StarIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}

function ShieldIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    )
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

function ArrowIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
        </svg>
    )
}

export default function Landing({ onConnect, isLoading, programId }: LandingProps) {
    return (
        <div className="landing">
            <div className="landing-inner">

                {/* Hero */}
                <div className="hero animate-in">
                    <div className="hero-badge">
                        <span>Built on Aleo</span>
                        <span style={{ color: 'var(--text-dim)' }}>|</span>
                        <span>Zero-Knowledge</span>
                    </div>

                    <h1>Private social infrastructure protocol</h1>

                    <p className="hero-sub">
                        Anonymous posting, encrypted messaging, confidential payments, and threshold-based reputation verification — all enforced with zero-knowledge proofs on Aleo.
                    </p>

                    <div className="hero-actions">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={onConnect}
                            disabled={isLoading}
                            id="connect-wallet-btn"
                        >
                            {isLoading ? (
                                <><span className="spinner"></span>Connecting</>
                            ) : (
                                'Connect Wallet'
                            )}
                        </button>
                        <a
                            className="btn btn-ghost btn-lg"
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Documentation
                        </a>
                    </div>
                </div>

                {/* Features */}
                <div className="features animate-in delay-1">
                    <div className="features-label">Core Capabilities</div>
                    <div className="features-grid">
                        <div className="card feature-card">
                            <div className="feature-icon"><LockIcon /></div>
                            <div className="feature-title">Anonymous Posts</div>
                            <p className="feature-desc">
                                Publish content without revealing identity. BHP256 hashing ensures content integrity while preserving anonymity.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon"><MessageIcon /></div>
                            <div className="feature-title">Private Messages</div>
                            <p className="feature-desc">
                                End-to-end encrypted peer-to-peer messaging. Only the intended recipient can decrypt the content.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon"><StarIcon /></div>
                            <div className="feature-title">ZK Reputation</div>
                            <p className="feature-desc">
                                Build verifiable reputation privately. Prove credibility without exposing your interaction history.
                            </p>
                        </div>

                        <div className="card feature-card">
                            <div className="feature-icon"><ArrowIcon /></div>
                            <div className="feature-title">Private Transfers</div>
                            <p className="feature-desc">
                                Send ALEO without revealing sender, receiver, or amount. Encrypted memo field for additional context.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Architecture */}
                <div className="section animate-in delay-2">
                    <div className="section-label">Architecture</div>
                    <h3>Transaction flow</h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Shadow operates as a privacy layer on Aleo. Every action produces a zero-knowledge proof
                        that validates the operation without exposing the actor.
                    </p>
                    <div className="arch-flow">
                        <span>Wallet Connection</span>
                        <span style={{ color: 'var(--accent-muted)' }}>&nbsp;&nbsp;{'>'}&nbsp;&nbsp;Identity Hash (BHP256)</span>
                        <span style={{ color: 'var(--accent-muted)' }}>&nbsp;&nbsp;{'>'}&nbsp;&nbsp;ZK Proof Generation</span>
                        <span style={{ color: 'var(--accent-muted)' }}>&nbsp;&nbsp;{'>'}&nbsp;&nbsp;On-chain Verification</span>
                        <span style={{ color: 'var(--accent-muted)' }}>&nbsp;&nbsp;{'>'}&nbsp;&nbsp;State Transition</span>
                    </div>
                </div>

                {/* Security Model */}
                <div className="section animate-in delay-2">
                    <div className="section-label">Security Model</div>
                    <h3>Threat mitigation</h3>
                    <div className="security-grid">
                        <div className="card security-card">
                            <div className="security-card-icon"><ShieldIcon /></div>
                            <div>
                                <div className="security-card-title">Replay Prevention</div>
                                <p className="security-card-desc">
                                    Every transaction includes a unique nonce. The <code>used_nonces</code> mapping ensures no action can be replayed.
                                </p>
                            </div>
                        </div>
                        <div className="card security-card">
                            <div className="security-card-icon"><LockIcon /></div>
                            <div>
                                <div className="security-card-title">Content Deduplication</div>
                                <p className="security-card-desc">
                                    Post content is hashed with BHP256. The <code>post_hashes</code> mapping prevents identical content from being submitted twice.
                                </p>
                            </div>
                        </div>
                        <div className="card security-card">
                            <div className="security-card-icon"><StarIcon /></div>
                            <div>
                                <div className="security-card-title">ZK Uniqueness</div>
                                <p className="security-card-desc">
                                    Anti-spam tokens use <code>commit_to_field</code> to bind identity and salt, preventing forgery or reuse.
                                </p>
                            </div>
                        </div>
                        <div className="card security-card">
                            <div className="security-card-icon"><MessageIcon /></div>
                            <div>
                                <div className="security-card-title">Zero Plaintext</div>
                                <p className="security-card-desc">
                                    No message content, post body, or memo is stored in plaintext. Only hashes are persisted on-chain.
                                </p>
                            </div>
                        </div>
                        <div className="card security-card">
                            <div className="security-card-icon"><ShieldIcon /></div>
                            <div>
                                <div className="security-card-title">Private Threshold Verification</div>
                                <p className="security-card-desc">
                                    Reputation is proven via <code>prove_reputation_threshold</code>. Only a boolean (pass/fail) is revealed. The actual score stays private.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ZK Reputation Proof */}
                <div className="section animate-in delay-2 zk-threshold-section">
                    <div className="section-label">Zero-Knowledge Reputation Proof</div>
                    <h3>Threshold-based verification</h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Shadow enables users to prove their reputation meets a minimum threshold without
                        disclosing the underlying score. The ZK circuit enforces the constraint — the verifier
                        learns only that the condition is satisfied. This primitive powers gated access,
                        governance eligibility, and Sybil resistance without compromising privacy.
                    </p>
                    <div className="zk-features">
                        <div className="zk-feature">
                            <div className="zk-feature-icon"><ShieldIcon /></div>
                            <span className="zk-feature-text">Score remains private. Only pass/fail is proven.</span>
                        </div>
                        <div className="zk-feature">
                            <div className="zk-feature-icon"><LockIcon /></div>
                            <span className="zk-feature-text">Prevents Sybil attacks with verifiable minimum credibility.</span>
                        </div>
                        <div className="zk-feature">
                            <div className="zk-feature-icon"><StarIcon /></div>
                            <span className="zk-feature-text">Enables gated communities and private governance.</span>
                        </div>
                        <div className="zk-feature">
                            <div className="zk-feature-icon"><CheckIcon /></div>
                            <span className="zk-feature-text">Composable primitive for DAO access controls.</span>
                        </div>
                    </div>
                </div>

                {/* Privacy */}
                <div className="section animate-in delay-3">
                    <div className="section-label">Privacy Model</div>
                    <h3>What stays private</h3>
                    <ul className="privacy-list">
                        <li>
                            <span className="privacy-check"><CheckIcon /></span>
                            Wallet address and identity linkage
                        </li>
                        <li>
                            <span className="privacy-check"><CheckIcon /></span>
                            Message contents and social graph
                        </li>
                        <li>
                            <span className="privacy-check"><CheckIcon /></span>
                            Transaction amounts and participants
                        </li>
                        <li>
                            <span className="privacy-check"><CheckIcon /></span>
                            Posting history and interaction patterns
                        </li>
                        <li>
                            <span className="privacy-check"><CheckIcon /></span>
                            Reputation score details and source
                        </li>
                    </ul>
                </div>

                {/* Reputation */}
                <div className="section animate-in delay-3">
                    <div className="section-label">Reputation Protocol</div>
                    <h3>Anonymous but accountable</h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Shadow implements a ZK-based reputation system scored from 0 to 1000. Reputation changes
                        are nonce-gated (maximum 10 points per action) with on-chain verification. Users can prove
                        credibility without exposing their wallet address or interaction history.
                    </p>
                    <div className="rep-stats">
                        <div className="rep-stat">
                            <div className="rep-stat-value">0 — 1000</div>
                            <div className="rep-stat-label">Score range</div>
                        </div>
                        <div className="rep-stat">
                            <div className="rep-stat-value">10</div>
                            <div className="rep-stat-label">Max per action</div>
                        </div>
                        <div className="rep-stat">
                            <div className="rep-stat-value">Nonce-gated</div>
                            <div className="rep-stat-label">Replay prevention</div>
                        </div>
                    </div>
                </div>

                {/* Composability */}
                <div className="section animate-in delay-4 zk-threshold-section">
                    <div className="section-label">Composable Infrastructure</div>
                    <h3>Build on Shadow</h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Shadow is designed as an infrastructure layer, not a standalone application. Any Aleo program
                        can import <code>ShadowIdentity</code> and call <code>prove_reputation_threshold</code> to gate
                        access by private reputation. No SDKs. No oracles. One cross-program call.
                    </p>
                    <div className="zk-features" style={{ marginTop: '20px' }}>
                        <div className="zk-feature">
                            <div className="zk-feature-icon"><ShieldIcon /></div>
                            <span className="zk-feature-text">DAO voting with private reputation thresholds</span>
                        </div>
                        <div className="zk-feature">
                            <div className="zk-feature-icon"><LockIcon /></div>
                            <span className="zk-feature-text">DeFi participation gated by verifiable credibility</span>
                        </div>
                        <div className="zk-feature">
                            <div className="zk-feature-icon"><StarIcon /></div>
                            <span className="zk-feature-text">No state coupling. Consumer programs cannot affect Shadow scores.</span>
                        </div>
                        <div className="zk-feature">
                            <div className="zk-feature-icon"><CheckIcon /></div>
                            <span className="zk-feature-text">Zero trust assumptions beyond Aleo proof validity</span>
                        </div>
                    </div>
                    <div className="card" style={{ marginTop: '16px', padding: '16px 20px' }}>
                        <code className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.7', whiteSpace: 'pre', display: 'block' }}>
                            {`shadow_social.aleo/prove_reputation_threshold(
    identity, 200u32
);
// Voter's score stays private. Only pass/fail is verified.`}
                        </code>
                    </div>
                </div>

                {/* Footer */}
                <div className="landing-footer animate-in delay-4">
                    <span className="mono" style={{ fontSize: '0.75rem' }}>{programId} v3</span>
                    <span className="footer-sep">|</span>
                    <span>Private Social Infrastructure Protocol</span>
                    <span className="footer-sep">|</span>
                    <span>Built on Aleo</span>
                    <span className="footer-sep">|</span>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <span className="footer-sep">|</span>
                    <a href="https://developer.aleo.org/" target="_blank" rel="noopener noreferrer">Docs</a>
                    <span className="footer-sep">|</span>
                    <span>MIT License</span>
                </div>

            </div>
        </div>
    )
}
