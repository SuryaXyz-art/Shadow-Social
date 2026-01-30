import { useState } from 'react'
import type { WalletState } from '../App'

interface PaymentsProps {
    wallet: WalletState
    showToast: (message: string, type: 'success' | 'error') => void
}

export default function Payments({ wallet, showToast }: PaymentsProps) {
    const [receiver, setReceiver] = useState('')
    const [amount, setAmount] = useState('')
    const [memo, setMemo] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSend = async () => {
        if (!receiver.trim() || !amount.trim()) {
            showToast('Enter recipient and amount', 'error')
            return
        }

        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum <= 0) {
            showToast('Invalid amount', 'error')
            return
        }

        setIsLoading(true)
        try {
            // Simulate private transfer
            await new Promise(r => setTimeout(r, 2500))
            showToast(`Sent ${amount} ALEO privately`, 'success')
            setAmount('')
            setMemo('')
        } catch {
            showToast('Transfer failed', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="payments-container container">
            <div className="card payment-card">
                <div className="payment-header">
                    <div className="payment-icon">💸</div>
                    <div>
                        <h2>Private Transfer</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Send ALEO without revealing sender or receiver
                        </p>
                    </div>
                </div>

                <form className="payment-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                    <div>
                        <label className="payment-label">Recipient Address</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="aleo1..."
                            value={receiver}
                            onChange={(e) => setReceiver(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="payment-label">Amount (ALEO)</label>
                        <input
                            type="number"
                            className="input"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.001"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="payment-label">Private Memo (Optional)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Encrypted note..."
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                        />
                    </div>

                    <div className="payment-info">
                        <span>🔒</span>
                        <span>
                            Transaction is fully private. No one can see sender, receiver, or amount.
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px' }}
                        disabled={isLoading || !receiver.trim() || !amount.trim()}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Sending Privately...
                            </>
                        ) : (
                            <>💸 Send Private Payment</>
                        )}
                    </button>
                </form>

                <div className="divider"></div>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Connected Wallet
                    </p>
                    <code style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-ghost)',
                        background: 'var(--bg-secondary)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-block'
                    }}>
                        {wallet.address?.slice(0, 16)}...{wallet.address?.slice(-8)}
                    </code>
                </div>
            </div>
        </div>
    )
}
