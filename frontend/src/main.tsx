import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { WalletProvider } from '@demox-labs/aleo-wallet-adapter-react'
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui'
import '@demox-labs/aleo-wallet-adapter-reactui/styles.css'
import './index.css'
import App from './App.tsx'
import { createWallets, WALLET_NETWORK, DECRYPT_PERMISSION } from './wallet'

function Root() {
  const wallets = useMemo(() => createWallets(), [])

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DECRYPT_PERMISSION}
      network={WALLET_NETWORK}
      autoConnect
    >
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
