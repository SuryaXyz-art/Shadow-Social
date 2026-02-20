/**
 * Shadow — Aleo Wallet Integration
 *
 * Handles connection to Leo Wallet and Puzzle Wallet browser extensions.
 * Provides methods for wallet connection, disconnection, transaction
 * execution, and record decryption.
 *
 * Supported wallets:
 *   - Leo Wallet (window.leoWallet)
 *   - Puzzle Wallet (window.puzzle)
 *
 * Falls back to a simulated demo wallet when no extension is detected.
 */

export type WalletType = 'leo' | 'puzzle' | 'demo'

export interface AleoWallet {
    type: WalletType
    publicKey: string
    connect(): Promise<string>
    disconnect(): Promise<void>
    requestExecution(params: ExecutionParams): Promise<string>
    signMessage(message: string): Promise<string>
}

export interface ExecutionParams {
    programId: string
    functionName: string
    inputs: string[]
    fee: number
}

interface LeoWalletProvider {
    connect(): Promise<{ address: string }>
    disconnect(): Promise<void>
    requestExecution(params: {
        programId: string
        functionName: string
        inputs: string[]
        fee: number
    }): Promise<{ transactionId: string }>
    signMessage(message: Uint8Array): Promise<{ signature: string }>
    decrypt(ciphertext: string): Promise<{ plaintext: string }>
    on(event: string, callback: (...args: unknown[]) => void): void
}

interface PuzzleWalletProvider {
    connect(): Promise<string>
    disconnect(): Promise<void>
    requestExecution(params: {
        programId: string
        functionName: string
        inputs: string[]
        fee: number
    }): Promise<{ transactionId: string }>
    signMessage(message: string): Promise<string>
}

declare global {
    interface Window {
        leoWallet?: LeoWalletProvider
        puzzle?: PuzzleWalletProvider
    }
}

/**
 * Detect which wallet extensions are available in the browser.
 */
export function detectWallets(): WalletType[] {
    const available: WalletType[] = []
    if (typeof window !== 'undefined') {
        if (window.leoWallet) available.push('leo')
        if (window.puzzle) available.push('puzzle')
    }
    return available
}

/**
 * Connect to the specified wallet type.
 * Returns an AleoWallet interface that abstracts the underlying provider.
 */
export async function connectWallet(type: WalletType): Promise<AleoWallet> {
    switch (type) {
        case 'leo':
            return connectLeoWallet()
        case 'puzzle':
            return connectPuzzleWallet()
        case 'demo':
            return connectDemoWallet()
    }
}

async function connectLeoWallet(): Promise<AleoWallet> {
    const provider = window.leoWallet
    if (!provider) {
        throw new Error('Leo Wallet extension not detected. Install it from leo.app')
    }

    const result = await provider.connect()
    const address = result.address

    return {
        type: 'leo',
        publicKey: address,
        connect: async () => {
            const r = await provider.connect()
            return r.address
        },
        disconnect: () => provider.disconnect(),
        requestExecution: async (params) => {
            const result = await provider.requestExecution({
                programId: params.programId,
                functionName: params.functionName,
                inputs: params.inputs,
                fee: params.fee,
            })
            return result.transactionId
        },
        signMessage: async (message) => {
            const encoder = new TextEncoder()
            const result = await provider.signMessage(encoder.encode(message))
            return result.signature
        },
    }
}

async function connectPuzzleWallet(): Promise<AleoWallet> {
    const provider = window.puzzle
    if (!provider) {
        throw new Error('Puzzle Wallet extension not detected. Install it from puzzle.online')
    }

    const address = await provider.connect()

    return {
        type: 'puzzle',
        publicKey: address,
        connect: async () => provider.connect(),
        disconnect: () => provider.disconnect(),
        requestExecution: async (params) => {
            const result = await provider.requestExecution({
                programId: params.programId,
                functionName: params.functionName,
                inputs: params.inputs,
                fee: params.fee,
            })
            return result.transactionId
        },
        signMessage: (message) => provider.signMessage(message),
    }
}

async function connectDemoWallet(): Promise<AleoWallet> {
    await new Promise(r => setTimeout(r, 800))
    const address = 'aleo12tjzsme3phssmvpzdnc3sjqgt5257c8q2l8unvnek6d3gnrquu9qat53gv'

    return {
        type: 'demo',
        publicKey: address,
        connect: async () => address,
        disconnect: async () => { },
        requestExecution: async (_params) => {
            await new Promise(r => setTimeout(r, 2000))
            const txId = Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0')).join('')
            return `at1${txId.slice(0, 58)}`
        },
        signMessage: async (message) => {
            await new Promise(r => setTimeout(r, 500))
            const encoder = new TextEncoder()
            const data = encoder.encode(message)
            const hash = await crypto.subtle.digest('SHA-256', data)
            return Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0')).join('')
        },
    }
}
