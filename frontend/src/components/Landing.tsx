interface LandingProps {
    onConnect: () => void
    isLoading: boolean
}

export default function Landing({ onConnect, isLoading }: LandingProps) {
    return (
        <div className="landing">
            <div className="landing-logo">🕶️</div>

            <h1 className="landing-title">
                <span>Shadow</span>
            </h1>

            <p className="landing-tagline">
                Your presence, without your identity.
            </p>

            <div className="landing-features">
                <div className="card feature-card">
                    <div className="feature-icon">🔐</div>
                    <h3 className="feature-title">Anonymous Posts</h3>
                    <p className="feature-desc">Share thoughts without revealing identity</p>
                </div>

                <div className="card feature-card">
                    <div className="feature-icon">💬</div>
                    <h3 className="feature-title">Private Messages</h3>
                    <p className="feature-desc">End-to-end encrypted conversations</p>
                </div>

                <div className="card feature-card">
                    <div className="feature-icon">💸</div>
                    <h3 className="feature-title">Stealth Payments</h3>
                    <p className="feature-desc">Send ALEO without exposure</p>
                </div>
            </div>

            <button
                className="btn btn-primary connect-btn"
                onClick={onConnect}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <span className="spinner"></span>
                        Entering Shadow...
                    </>
                ) : (
                    <>🔗 Sign in with Aleo</>
                )}
            </button>

            <div className="powered-by">
                <span>Powered by</span>
                <strong>Aleo</strong>
                <span>•</span>
                <span>Zero-Knowledge by default</span>
            </div>
        </div>
    )
}
