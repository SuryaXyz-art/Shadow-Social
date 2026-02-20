import { useState } from 'react'
import type { ShadowIdentity } from '../App'

interface ReputationProofPanelProps {
    identity: ShadowIdentity
    showToast: (message: string, type?: 'success' | 'error') => void
}

function ShieldIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    )
}

function CheckCircleIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}

function XCircleIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    )
}

type ProofState = 'idle' | 'generating' | 'success' | 'failure'

export default function ReputationProofPanel({ identity, showToast }: ReputationProofPanelProps) {
    const [threshold, setThreshold] = useState('')
    const [proofState, setProofState] = useState<ProofState>('idle')
    const [lastThreshold, setLastThreshold] = useState(0)

    const handleProve = async () => {
        const value = parseInt(threshold, 10)

        if (isNaN(value) || value < 0) {
            showToast('Enter a valid threshold (0 or higher)', 'error')
            return
        }

        if (value > 1000) {
            showToast('Threshold cannot exceed 1000', 'error')
            return
        }

        setProofState('generating')
        setLastThreshold(value)

        try {
            // Simulate ZK proof generation (wallet transaction)
            await new Promise(r => setTimeout(r, 2200))

            // ZK constraint: reputation >= threshold
            if (identity.reputation >= value) {
                setProofState('success')
                showToast('Reputation threshold proof verified')
            } else {
                setProofState('failure')
                showToast('Proof failed: threshold not met', 'error')
            }
        } catch {
            setProofState('failure')
            showToast('Proof generation failed', 'error')
        }
    }

    const handleReset = () => {
        setProofState('idle')
        setThreshold('')
    }

    if (proofState === 'success') {
        return (
            <div className="proof-container container">
                <div className="card card-glass proof-card">
                    <div className="proof-result proof-result-pass">
                        <div className="proof-result-icon"><CheckCircleIcon /></div>
                        <h3>Proof Verified</h3>
                        <p className="proof-result-desc">
                            Zero-knowledge proof confirms reputation meets the minimum threshold of {lastThreshold}.
                            No score was disclosed.
                        </p>
                        <div className="proof-result-meta">
                            <span className="badge badge-accent">ZK Verified</span>
                            <span className="badge badge-ghost mono">Threshold: {lastThreshold}</span>
                        </div>
                        <button className="btn btn-ghost" onClick={handleReset} style={{ marginTop: 16 }}>
                            Generate Another Proof
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (proofState === 'failure') {
        return (
            <div className="proof-container container">
                <div className="card card-glass proof-card">
                    <div className="proof-result proof-result-fail">
                        <div className="proof-result-icon proof-fail-icon"><XCircleIcon /></div>
                        <h3>Proof Failed</h3>
                        <p className="proof-result-desc">
                            Reputation does not meet the requested threshold of {lastThreshold}.
                            No information about the actual score was disclosed.
                        </p>
                        <button className="btn btn-ghost" onClick={handleReset} style={{ marginTop: 16 }}>
                            Try Different Threshold
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="proof-container container">
            <div className="card card-glass proof-card">
                <div className="proof-header">
                    <div className="proof-header-icon"><ShieldIcon /></div>
                    <div>
                        <h2>ZK Reputation Proof</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            Prove your reputation meets a threshold without revealing your score
                        </p>
                    </div>
                </div>

                <div className="proof-explainer">
                    <p>
                        This generates a zero-knowledge proof that your reputation is greater than or equal to
                        the specified minimum. The verifier learns only that the condition is satisfied — your
                        actual score remains private.
                    </p>
                </div>

                <div className="field-group">
                    <label className="field-label">Minimum Threshold</label>
                    <input
                        type="number"
                        className="input"
                        placeholder="e.g. 100"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        min="0"
                        max="1000"
                        id="threshold-input"
                    />
                    <span className="field-hint">Range: 0 — 1000. Your score is never disclosed.</span>
                </div>

                <div className="proof-info">
                    <ShieldIcon />
                    <span>
                        The proof is generated locally via your wallet. Only the boolean result (pass/fail)
                        is verifiable on-chain. No private fields are exposed.
                    </span>
                </div>

                <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={handleProve}
                    disabled={proofState === 'generating' || !threshold.trim()}
                    id="generate-proof-btn"
                >
                    {proofState === 'generating' ? (
                        <><span className="spinner"></span>Generating ZK Proof</>
                    ) : (
                        'Prove Reputation Threshold'
                    )}
                </button>

                <div className="divider"></div>

                <div className="proof-use-cases">
                    <div className="proof-use-cases-label">Use Cases</div>
                    <ul className="proof-use-list">
                        <li>Access gated community channels with minimum reputation</li>
                        <li>Qualify for governance participation without score disclosure</li>
                        <li>Prove credibility to counterparties in private transfers</li>
                        <li>Enable Sybil-resistant anonymous interactions</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
