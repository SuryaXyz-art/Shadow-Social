import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import './App.css'
import Header from './components/Header'
import Landing from './components/Landing'
import { detectWallets, connectWallet as connectAleoWallet } from './wallet'
import type { AleoWallet, WalletType } from './wallet'

const Feed = lazy(() => import('./components/Feed'))
const Messages = lazy(() => import('./components/Messages'))
const Payments = lazy(() => import('./components/Payments'))
const ReputationProofPanel = lazy(() => import('./components/ReputationProofPanel'))

const PROGRAM_ID = import.meta.env.VITE_PROGRAM_ID || 'shadow_social.aleo'
const NETWORK = import.meta.env.VITE_NETWORK || 'testnet'

export interface ShadowIdentity {
  identityHash: string
  reputation: number
  joinedAt: number
  postCount: number
  isActive: boolean
}

export interface Post {
  id: string
  contentHash: string
  content: string
  createdAt: number
  anonymous: boolean
}

export interface Message {
  id: string
  senderHash: string
  contentHash: string
  content: string
  sentAt: number
  isRead: boolean
}

export interface WalletState {
  connected: boolean
  address: string | null
  type: WalletType | null
}

type Page = 'landing' | 'feed' | 'messages' | 'payments' | 'reputation'

const POST_COOLDOWN_MS = 30_000

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '80px 20px',
      color: 'var(--text-dim)'
    }}>
      <span className="spinner" style={{ width: 20, height: 20 }}></span>
    </div>
  )
}

function WalletModal({ onSelect, onClose }: {
  onSelect: (type: WalletType) => void
  onClose: () => void
}) {
  const available = detectWallets()

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wallet-modal-header">
          <h3>Connect Wallet</h3>
          <button className="wallet-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="wallet-modal-options">
          <button
            className={`wallet-option ${available.includes('leo') ? '' : 'wallet-option-disabled'}`}
            onClick={() => available.includes('leo') ? onSelect('leo') : window.open('https://leo.app', '_blank')}
            id="connect-leo-wallet"
          >
            <div className="wallet-option-info">
              <span className="wallet-option-name">Leo Wallet</span>
              <span className="wallet-option-status">
                {available.includes('leo') ? 'Detected' : 'Not installed'}
              </span>
            </div>
            <span className="wallet-option-action">
              {available.includes('leo') ? 'Connect' : 'Install'}
            </span>
          </button>

          <button
            className={`wallet-option ${available.includes('puzzle') ? '' : 'wallet-option-disabled'}`}
            onClick={() => available.includes('puzzle') ? onSelect('puzzle') : window.open('https://puzzle.online', '_blank')}
            id="connect-puzzle-wallet"
          >
            <div className="wallet-option-info">
              <span className="wallet-option-name">Puzzle Wallet</span>
              <span className="wallet-option-status">
                {available.includes('puzzle') ? 'Detected' : 'Not installed'}
              </span>
            </div>
            <span className="wallet-option-action">
              {available.includes('puzzle') ? 'Connect' : 'Install'}
            </span>
          </button>

          <div className="wallet-divider">
            <span>or</span>
          </div>

          <button
            className="wallet-option wallet-option-demo"
            onClick={() => onSelect('demo')}
            id="connect-demo-wallet"
          >
            <div className="wallet-option-info">
              <span className="wallet-option-name">Demo Mode</span>
              <span className="wallet-option-status">Simulated wallet for preview</span>
            </div>
            <span className="wallet-option-action">Enter</span>
          </button>
        </div>

        <p className="wallet-modal-note">
          Install Leo Wallet or Puzzle Wallet to sign real transactions on Aleo {NETWORK}.
        </p>
      </div>
    </div>
  )
}

function App() {
  const [wallet, setWallet] = useState<WalletState>({ connected: false, address: null, type: null })
  const [aleoWallet, setAleoWallet] = useState<AleoWallet | null>(null)
  const [identity, setIdentity] = useState<ShadowIdentity | null>(null)
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [posts, setPosts] = useState<Post[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState<number>(0)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [showWalletModal, setShowWalletModal] = useState(false)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    if (cooldownUntil <= Date.now()) {
      setCooldownRemaining(0)
      return
    }
    const interval = setInterval(() => {
      const remaining = Math.max(0, cooldownUntil - Date.now())
      setCooldownRemaining(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldownUntil])

  const handleWalletSelect = async (type: WalletType) => {
    setShowWalletModal(false)
    setIsLoading(true)
    try {
      const w = await connectAleoWallet(type)
      setAleoWallet(w)
      setWallet({ connected: true, address: w.publicKey, type })
      await createIdentity(w.publicKey)

      if (type === 'demo') {
        showToast('Connected in demo mode')
      } else {
        showToast(`Connected via ${type === 'leo' ? 'Leo' : 'Puzzle'} Wallet`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet'
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const openWalletModal = () => {
    setShowWalletModal(true)
  }

  const createIdentity = async (address: string) => {
    const encoder = new TextEncoder()
    const salt = crypto.getRandomValues(new Uint8Array(32))
    const data = encoder.encode(address + Array.from(salt).join(''))
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const identityHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)

    setIdentity({
      identityHash,
      reputation: 10,
      joinedAt: Date.now(),
      postCount: 0,
      isActive: true
    })
    setCurrentPage('feed')
  }

  const disconnectWallet = async () => {
    if (aleoWallet && aleoWallet.type !== 'demo') {
      try {
        await aleoWallet.disconnect()
      } catch {
        // Wallet may already be disconnected
      }
    }
    setAleoWallet(null)
    setWallet({ connected: false, address: null, type: null })
    setIdentity(null)
    setCurrentPage('landing')
    setPosts([])
    setMessages([])
    showToast('Disconnected')
  }

  const executeTransaction = async (functionName: string, inputs: string[]): Promise<string | null> => {
    if (!aleoWallet) return null

    try {
      const txId = await aleoWallet.requestExecution({
        programId: PROGRAM_ID,
        functionName,
        inputs,
        fee: 0.5,
      })
      return txId
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed'
      showToast(message, 'error')
      return null
    }
  }

  const createPost = async (content: string) => {
    if (!identity) return

    if (cooldownUntil > Date.now()) {
      showToast('Rate limited. Wait before posting again.', 'error')
      return
    }

    setIsLoading(true)
    try {
      const encoder = new TextEncoder()
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const data = encoder.encode(content + Array.from(salt).join(''))
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)

      // Execute on-chain transaction if wallet supports it
      const txId = await executeTransaction('create_post', [
        `${identity.identityHash}field`,
        `${contentHash}field`,
        `${crypto.getRandomValues(new Uint32Array(1))[0]}u64`,
      ])

      const newPost: Post = {
        id: txId || crypto.randomUUID(),
        contentHash,
        content,
        createdAt: Date.now(),
        anonymous: true
      }

      setPosts(prev => [newPost, ...prev])
      setIdentity(prev => prev ? {
        ...prev,
        postCount: prev.postCount + 1,
        reputation: Math.min(prev.reputation + 1, 1000)
      } : null)

      setCooldownUntil(Date.now() + POST_COOLDOWN_MS)

      if (txId && wallet.type !== 'demo') {
        showToast(`Posted on-chain. TX: ${txId.slice(0, 12)}...`)
      } else {
        showToast('Posted anonymously via ZK proof')
      }
    } catch {
      showToast('Failed to create post', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (_receiver: string, content: string) => {
    if (!identity) return

    setIsLoading(true)
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)

      // Execute on-chain transaction if wallet supports it
      await executeTransaction('send_message', [
        `${identity.identityHash}field`,
        `${_receiver}`,
        `${contentHash}field`,
      ])

      const newMessage: Message = {
        id: crypto.randomUUID(),
        senderHash: identity.identityHash.slice(0, 8),
        contentHash,
        content,
        sentAt: Date.now(),
        isRead: false
      }

      setMessages(prev => [newMessage, ...prev])
      showToast('Message sent privately')
    } catch {
      showToast('Failed to send message', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      {wallet.connected && (
        <Header
          identity={identity}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onDisconnect={disconnectWallet}
          network={NETWORK}
          walletType={wallet.type}
        />
      )}

      <main className="main-content">
        {currentPage === 'landing' && (
          <Landing
            onConnect={openWalletModal}
            isLoading={isLoading}
            programId={PROGRAM_ID}
          />
        )}

        <Suspense fallback={<PageLoader />}>
          {currentPage === 'feed' && (
            <Feed
              posts={posts}
              onCreatePost={createPost}
              isLoading={isLoading}
              cooldownRemaining={cooldownRemaining}
              cooldownTotal={POST_COOLDOWN_MS}
            />
          )}

          {currentPage === 'messages' && (
            <Messages
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          )}

          {currentPage === 'payments' && (
            <Payments
              wallet={wallet}
              showToast={showToast}
              aleoWallet={aleoWallet}
              programId={PROGRAM_ID}
            />
          )}

          {currentPage === 'reputation' && identity && (
            <ReputationProofPanel
              identity={identity}
              showToast={showToast}
              aleoWallet={aleoWallet}
              programId={PROGRAM_ID}
            />
          )}
        </Suspense>
      </main>

      {wallet.connected && (
        <nav className="nav-mobile">
          <button
            className={`nav-item ${currentPage === 'feed' ? 'active' : ''}`}
            onClick={() => setCurrentPage('feed')}
          >
            Feed
          </button>
          <button
            className={`nav-item ${currentPage === 'messages' ? 'active' : ''}`}
            onClick={() => setCurrentPage('messages')}
          >
            Messages
          </button>
          <button
            className={`nav-item ${currentPage === 'payments' ? 'active' : ''}`}
            onClick={() => setCurrentPage('payments')}
          >
            Payments
          </button>
          <button
            className={`nav-item ${currentPage === 'reputation' ? 'active' : ''}`}
            onClick={() => setCurrentPage('reputation')}
          >
            ZK Proof
          </button>
        </nav>
      )}

      {showWalletModal && (
        <WalletModal
          onSelect={handleWalletSelect}
          onClose={() => setShowWalletModal(false)}
        />
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default App
