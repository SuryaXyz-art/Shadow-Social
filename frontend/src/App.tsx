import { useState, useCallback } from 'react'
import './App.css'
import Header from './components/Header'
import Landing from './components/Landing'
import Feed from './components/Feed'
import Messages from './components/Messages'
import Payments from './components/Payments'

// Types
export interface ShadowIdentity {
  identityHash: string
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

type Page = 'landing' | 'feed' | 'messages' | 'payments'

function App() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null
  })

  const [identity, setIdentity] = useState<ShadowIdentity | null>(null)
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [posts, setPosts] = useState<Post[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Connect wallet & create Shadow identity
  const connectWallet = async () => {
    setIsLoading(true)
    try {
      // Check for Aleo wallet
      if (typeof window !== 'undefined' && (window as any).aleo) {
        const address = await (window as any).aleo.connect()
        setWallet({ connected: true, address })
        await createIdentity(address)
      } else {
        // Demo mode
        setTimeout(() => {
          const demoAddress = 'aleo12tjzsme3phssmvpzdnc3sjqgt5257c8q2l8unvnek6d3gnrquu9qat53gv'
          setWallet({ connected: true, address: demoAddress })
          createIdentity(demoAddress)
        }, 1000)
      }
    } catch (error) {
      showToast('Failed to connect', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const createIdentity = async (address: string) => {
    // Generate identity hash (simulated - in production uses Leo)
    const encoder = new TextEncoder()
    const data = encoder.encode(address + Date.now())
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const identityHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)

    setIdentity({
      identityHash,
      joinedAt: Date.now(),
      postCount: 0,
      isActive: true
    })
    setCurrentPage('feed')
    showToast('Shadow identity created', 'success')
  }

  const disconnectWallet = () => {
    setWallet({ connected: false, address: null })
    setIdentity(null)
    setCurrentPage('landing')
    showToast('Disconnected')
  }

  // Create anonymous post
  const createPost = async (content: string) => {
    if (!identity) return

    setIsLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1500))

      const encoder = new TextEncoder()
      const data = encoder.encode(content + Date.now())
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
      setIdentity(prev => prev ? { ...prev, postCount: prev.postCount + 1 } : null)
      showToast('Posted anonymously')
    } catch {
      showToast('Failed to post', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Send private message
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
      showToast('Failed to send', 'error')
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
        />
      )}

      <main className="main-content">
        {currentPage === 'landing' && (
          <Landing
            onConnect={connectWallet}
            isLoading={isLoading}
          />
        )}

        {currentPage === 'feed' && (
          <Feed
            posts={posts}
            onCreatePost={createPost}
            isLoading={isLoading}
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
      </main>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default App
