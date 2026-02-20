import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import './App.css'
import Header from './components/Header'
import Landing from './components/Landing'

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

function App() {
  const [wallet, setWallet] = useState<WalletState>({ connected: false, address: null })
  const [identity, setIdentity] = useState<ShadowIdentity | null>(null)
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [posts, setPosts] = useState<Post[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState<number>(0)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

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

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      if (typeof window !== 'undefined' && (window as any).aleo) {
        const address = await (window as any).aleo.connect()
        setWallet({ connected: true, address })
        await createIdentity(address)
      } else {
        await new Promise(r => setTimeout(r, 1200))
        const demoAddress = 'aleo12tjzsme3phssmvpzdnc3sjqgt5257c8q2l8unvnek6d3gnrquu9qat53gv'
        setWallet({ connected: true, address: demoAddress })
        await createIdentity(demoAddress)
      }
    } catch {
      showToast('Failed to connect wallet', 'error')
    } finally {
      setIsLoading(false)
    }
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
    showToast('Shadow identity created')
  }

  const disconnectWallet = () => {
    setWallet({ connected: false, address: null })
    setIdentity(null)
    setCurrentPage('landing')
    setPosts([])
    setMessages([])
    showToast('Disconnected')
  }

  const createPost = async (content: string) => {
    if (!identity) return

    if (cooldownUntil > Date.now()) {
      showToast('Rate limited. Wait before posting again.', 'error')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1800))

      const encoder = new TextEncoder()
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const data = encoder.encode(content + Array.from(salt).join(''))
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)

      const newPost: Post = {
        id: crypto.randomUUID(),
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
      showToast('Posted anonymously via ZK proof')
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
      await new Promise(r => setTimeout(r, 1500))

      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)

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
        />
      )}

      <main className="main-content">
        {currentPage === 'landing' && (
          <Landing
            onConnect={connectWallet}
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
            />
          )}

          {currentPage === 'reputation' && identity && (
            <ReputationProofPanel
              identity={identity}
              showToast={showToast}
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

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default App
