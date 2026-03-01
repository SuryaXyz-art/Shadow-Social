import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react'
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui'
import './App.css'
import Header from './components/Header'
import Landing from './components/Landing'
import { safeHash, randomFieldValue, buildTransaction, PROGRAM_ID, NETWORK } from './wallet'

const Feed = lazy(() => import('./components/Feed'))
const Messages = lazy(() => import('./components/Messages'))
const Payments = lazy(() => import('./components/Payments'))
const ReputationProofPanel = lazy(() => import('./components/ReputationProofPanel'))

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

export type WalletMode = 'real' | 'demo'

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
  const {
    publicKey,
    connected,
    disconnect: walletDisconnect,
    requestTransaction,
    requestRecords,
  } = useWallet()

  const [walletMode, setWalletMode] = useState<WalletMode | null>(null)
  const [identity, setIdentity] = useState<ShadowIdentity | null>(null)
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [posts, setPosts] = useState<Post[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState<number>(0)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [identityRecord, setIdentityRecord] = useState<string | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Cooldown timer
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

  // When wallet connects via SDK, auto-setup identity
  useEffect(() => {
    if (connected && publicKey && !identity && walletMode !== 'demo') {
      setWalletMode('real')
      handleRealWalletConnect(publicKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey])

  // ─── Real Wallet Connection ────────────────────────────────────────
  const handleRealWalletConnect = async (address: string) => {
    setIsLoading(true)
    try {
      // Try to fetch existing ShadowIdentity records from the wallet
      let existingRecord: string | null = null
      if (requestRecords) {
        try {
          const records = await requestRecords(PROGRAM_ID)
          // Find a ShadowIdentity record
          if (records && records.length > 0) {
            const identityRec = records.find((r: unknown) => {
              const rec = r as Record<string, unknown>
              return typeof rec === 'object' && rec !== null && (
                String(rec.functionId || '').includes('ShadowIdentity') ||
                String(rec.recordName || '').includes('ShadowIdentity') ||
                String(JSON.stringify(rec)).includes('identity_hash')
              )
            })
            if (identityRec) {
              existingRecord = JSON.stringify(identityRec)
            }
          }
        } catch {
          // Records may not be available yet — user may need to register
        }
      }

      if (existingRecord) {
        // Use existing identity from chain
        setIdentityRecord(existingRecord)
        const hash = (await safeHash(address)).slice(0, 32)
        setIdentity({
          identityHash: hash,
          reputation: 10,
          joinedAt: Date.now(),
          postCount: 0,
          isActive: true
        })
        showToast('Connected via Leo Wallet — identity found')
      } else {
        // No existing identity — register one
        try {
          if (requestTransaction) {
            const salt = randomFieldValue()
            const currentBlock = '1u64' // Current block placeholder
            const tx = buildTransaction(
              address,
              'register_identity',
              [`${salt}field`, currentBlock],
              500_000,
            )
            const txId = await requestTransaction(tx)
            showToast(`Identity registered. TX: ${String(txId).slice(0, 12)}...`)
          }
        } catch (err) {
          // If registration fails (maybe already registered), continue anyway
          console.warn('register_identity failed:', err)
        }

        // Create local identity representation
        const salt = typeof crypto !== 'undefined' && crypto.getRandomValues
          ? Array.from(crypto.getRandomValues(new Uint8Array(32))).join('')
          : Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)).join('')
        const identityHash = (await safeHash(address + salt)).slice(0, 32)

        setIdentity({
          identityHash,
          reputation: 10,
          joinedAt: Date.now(),
          postCount: 0,
          isActive: true
        })
        showToast('Connected via Leo Wallet')
      }
      setCurrentPage('feed')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect'
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Demo Mode ─────────────────────────────────────────────────────
  const enterDemoMode = async () => {
    setIsLoading(true)
    setWalletMode('demo')
    try {
      await new Promise(r => setTimeout(r, 800))
      const address = 'aleo12tjzsme3phssmvpzdnc3sjqgt5257c8q2l8unvnek6d3gnrquu9qat53gv'
      const salt = typeof crypto !== 'undefined' && crypto.getRandomValues
        ? Array.from(crypto.getRandomValues(new Uint8Array(32))).join('')
        : Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)).join('')
      const identityHash = (await safeHash(address + salt)).slice(0, 32)

      setIdentity({
        identityHash,
        reputation: 10,
        joinedAt: Date.now(),
        postCount: 0,
        isActive: true
      })
      setCurrentPage('feed')
      showToast('Connected in demo mode')
    } catch {
      showToast('Failed to enter demo mode', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Disconnect ────────────────────────────────────────────────────
  const disconnectWallet = async () => {
    if (walletMode === 'real') {
      try {
        await walletDisconnect()
      } catch {
        // Already disconnected
      }
    }
    setWalletMode(null)
    setIdentity(null)
    setIdentityRecord(null)
    setCurrentPage('landing')
    setPosts([])
    setMessages([])
    showToast('Disconnected')
  }

  // ─── Transaction Execution ─────────────────────────────────────────
  const executeTransaction = async (functionName: string, inputs: string[], fee = 500_000): Promise<string | null> => {
    if (walletMode === 'demo') {
      // Demo simulation
      await new Promise(r => setTimeout(r, 2000))
      const txId = `at1${Array.from({ length: 58 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`
      return txId
    }

    if (!publicKey || !requestTransaction) return null

    try {
      const tx = buildTransaction(publicKey, functionName, inputs, fee)
      const txId = await requestTransaction(tx)
      return typeof txId === 'string' ? txId : JSON.stringify(txId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed'
      showToast(message, 'error')
      return null
    }
  }

  // ─── Create Post ───────────────────────────────────────────────────
  const createPost = async (content: string) => {
    if (!identity) return

    if (cooldownUntil > Date.now()) {
      showToast('Rate limited. Wait before posting again.', 'error')
      return
    }

    setIsLoading(true)
    try {
      const salt = typeof crypto !== 'undefined' && crypto.getRandomValues
        ? Array.from(crypto.getRandomValues(new Uint8Array(16))).join('')
        : Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)).join('')
      const contentHash = (await safeHash(content + salt)).slice(0, 16)

      const postSalt = randomFieldValue()
      const currentBlock = `${Math.floor(Date.now() / 1000)}u64`

      let txId: string | null = null

      if (walletMode === 'real' && identityRecord) {
        // Real wallet: pass identity record + fields
        txId = await executeTransaction('create_post', [
          identityRecord,
          `${contentHash}field`,
          `${postSalt}field`,
          currentBlock,
        ])
      } else {
        // Demo mode: simulate transaction
        txId = await executeTransaction('create_post', [
          `${identity.identityHash}field`,
          `${contentHash}field`,
          `${postSalt}field`,
          currentBlock,
        ])
      }

      const postId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`

      const newPost: Post = {
        id: txId || postId,
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

      if (txId && walletMode === 'real') {
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

  // ─── Send Message ──────────────────────────────────────────────────
  const sendMessage = async (receiver: string, content: string) => {
    if (!identity) return

    setIsLoading(true)
    try {
      const contentHash = (await safeHash(content)).slice(0, 16)
      const messageSalt = randomFieldValue()
      const currentBlock = `${Math.floor(Date.now() / 1000)}u64`

      if (walletMode === 'real' && identityRecord) {
        await executeTransaction('send_message', [
          identityRecord,
          receiver,
          `${contentHash}field`,
          `${messageSalt}field`,
          currentBlock,
        ])
      } else {
        // Demo mode simulation
        await executeTransaction('send_message', [
          `${identity.identityHash}field`,
          receiver,
          `${contentHash}field`,
          `${messageSalt}field`,
          currentBlock,
        ])
      }

      const msgId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`

      const newMessage: Message = {
        id: msgId,
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

  // ─── Determine if user is "connected" (real wallet or demo) ────────
  const isConnected = identity !== null && walletMode !== null

  return (
    <div className="app">
      {isConnected && (
        <Header
          identity={identity}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onDisconnect={disconnectWallet}
          network={NETWORK}
          walletMode={walletMode}
          publicKey={publicKey || undefined}
        />
      )}

      <main className="main-content">
        {!isConnected && (
          <Landing
            onDemoMode={enterDemoMode}
            isLoading={isLoading}
            programId={PROGRAM_ID}
            walletConnected={connected}
          />
        )}

        <Suspense fallback={<PageLoader />}>
          {currentPage === 'feed' && isConnected && (
            <Feed
              posts={posts}
              onCreatePost={createPost}
              isLoading={isLoading}
              cooldownRemaining={cooldownRemaining}
              cooldownTotal={POST_COOLDOWN_MS}
            />
          )}

          {currentPage === 'messages' && isConnected && (
            <Messages
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          )}

          {currentPage === 'payments' && isConnected && (
            <Payments
              walletMode={walletMode!}
              showToast={showToast}
              executeTransaction={executeTransaction}
              publicKey={publicKey || undefined}
              identityRecord={identityRecord}
              programId={PROGRAM_ID}
            />
          )}

          {currentPage === 'reputation' && isConnected && identity && (
            <ReputationProofPanel
              identity={identity}
              showToast={showToast}
              executeTransaction={executeTransaction}
              walletMode={walletMode!}
              identityRecord={identityRecord}
              programId={PROGRAM_ID}
            />
          )}
        </Suspense>
      </main>

      {isConnected && (
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

export { WalletMultiButton }
export default App
