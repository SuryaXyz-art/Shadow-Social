import { useState } from 'react'
import type { WalletState } from '../App'
import type { AleoWallet } from '../wallet'

interface PaymentsProps {
    wallet: WalletState
    showToast: (message: string, type?: 'success' | 'error') => void
    aleoWallet: AleoWallet | null
    programId: string
}

function ArrowUpIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
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

export default function Payments({ wallet, showToast, aleoWallet, programId }: PaymentsProps) {
    const [receiver, setReceiver] = useState('')
    const [amount, setAmount] = useState('')
    const [memo, setMemo] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [lastTxId, setLastTxId] = useState<string | null>(null)

    const handleSend = async () => {
        if (!receiver.trim() || !amount.trim()) {
            showToast('Enter recipient and amount', 'error')
            return
        }

        const num = parseFloat(amount)
        if (isNaN(num) || num <= 0) {
            showToast('Invalid amount', 'error')
            return
        }

        if (!receiver.startsWith('aleo1')) {
            showToast('Recipient must be a valid Aleo address (aleo1...)', 'error')
            return
        }

        setIsLoading(true)
        try {
            let txId: string | null = null

            if (aleoWallet && aleoWallet.type !== 'demo') {
                // Execute real private transfer via wallet
                txId = await aleoWallet.requestExecution({
                    programId,
                    functionName: 'private_transfer',
                    inputs: [
                        receiver,
                        `${Math.floor(num * 1_000_000)}u64`,
                        memo ? `${memo}field` : '0field',
                    ],
                    fee: 0.5,
                })
                setLastTxId(txId)
            } else {
                // Demo mode simulation
                await new Promise(r => setTimeout(r, 2500))
                txId = `at1${Array.from(crypto.getRandomValues(new Uint8Array(29)))
                    .map(b => b.toString(16).padStart(2, '0')).join('')}`
                setLastTxId(txId)
            }

            setShowSuccess(true)

            if (wallet.type !== 'demo' && txId) {
                showToast(`${amount} ALEO sent. TX: ${txId.slice(0, 12)}...`)
            } else {
                showToast(`${amount} ALEO transferred privately`)
            }

            setTimeout(() => {
                setShowSuccess(false)
                setAmount('')
                setMemo('')
                setLastTxId(null)
            }, 4000)
        } catch {
            showToast('Transfer failed', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    if (showSuccess) {
        return (
            <div className="payments-container container">
                <div className="card card-glass pay-card">
                    <div className="pay-success">
                        <div className="pay-success-check"><CheckIcon /></div>
                        <h2 style={{ marginBottom: '8px' }}>Payment Sent</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
                            {amount} ALEO transferred privately
                        </p>
                        {lastTxId && (
                            <code className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '12px' }}>
                                TX: {lastTxId.slice(0, 24)}...
                            </code>
                        )}
                        <span className="badge badge-accent">Zero-Knowledge Verified</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="payments-container container">
            <div className="card card-glass pay-card">
                <div className="pay-header">
                    <div className="pay-icon"><ArrowUpIcon /></div>
                    <div>
                        <h2>Private Transfer</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            Send ALEO without revealing sender or receiver
                        </p>
                    </div>
                </div>

                <form className="pay-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                    <div className="field-group">
                        <label className="field-label">Recipient Address</label>
                        <input
                            type="text"
                            className="input mono"
                            placeholder="aleo1..."
                            value={receiver}
                            onChange={(e) => setReceiver(e.target.value)}
                            id="pay-receiver-input"
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Amount (ALEO)</label>
                        <input
                            type="number"
                            className="input"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.001"
                            min="0"
                            id="pay-amount-input"
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Private Memo (Optional)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Encrypted memo — only recipient can read"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            id="pay-memo-input"
                        />
                    </div>

                    <div className="pay-info">
                        <ShieldIcon />
                        <span>
                            {wallet.type !== 'demo'
                                ? 'Transaction will be signed by your wallet and submitted to the Aleo network.'
                                : 'Transaction is fully private. Sender, receiver, and amount are hidden via zero-knowledge proofs.'
                            }
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={isLoading || !receiver.trim() || !amount.trim()}
                        id="send-payment-btn"
                    >
                        {isLoading ? (
                            <><span className="spinner"></span>
                                {wallet.type !== 'demo' ? 'Awaiting Wallet Signature' : 'Generating ZK Proof'}
                            </>
                        ) : (
                            'Send Private Payment'
                        )}
                    </button>
                </form>

                <div className="divider"></div>

                <div className="pay-wallet">
                    <p className="pay-wallet-label">
                        Connected via {wallet.type === 'leo' ? 'Leo Wallet' : wallet.type === 'puzzle' ? 'Puzzle Wallet' : 'Demo Mode'}
                    </p>
                    <code className="pay-wallet-addr">
                        {wallet.address?.slice(0, 16)}...{wallet.address?.slice(-8)}
                    </code>
                </div>
            </div>
        </div>
    )
}
