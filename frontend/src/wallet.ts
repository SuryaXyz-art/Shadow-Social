/**
 * Shadow — Aleo Wallet Utilities
 *
 * Utility helpers for hashing, random generation, and wallet adapter config.
 * The actual wallet connection is handled by @demox-labs/aleo-wallet-adapter-react.
 */

import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo'
import {
    DecryptPermission,
    WalletAdapterNetwork,
    Transaction,
} from '@demox-labs/aleo-wallet-adapter-base'

// ─── Wallet Adapter Config ──────────────────────────────────────────────

export const PROGRAM_ID = import.meta.env.VITE_PROGRAM_ID || 'shadow_social.aleo'
export const NETWORK = import.meta.env.VITE_NETWORK || 'testnet'

export const WALLET_NETWORK =
    NETWORK === 'mainnet'
        ? WalletAdapterNetwork.MainnetBeta
        : WalletAdapterNetwork.TestnetBeta

export const DECRYPT_PERMISSION = DecryptPermission.UponRequest

export function createWallets() {
    return [
        new LeoWalletAdapter({ appName: 'Shadow' }),
    ]
}

// Re-export Transaction for use in components
export { Transaction, WalletAdapterNetwork }
export type { DecryptPermission }

// ─── Hashing Utilities ──────────────────────────────────────────────────

/**
 * Simple fallback hash for non-secure contexts (HTTP).
 * NOT cryptographically secure — used only for demo UI state.
 */
function fallbackHash(input: string): string {
    let h1 = 0xdeadbeef
    let h2 = 0x41c6ce57
    for (let i = 0; i < input.length; i++) {
        const ch = input.charCodeAt(i)
        h1 = Math.imul(h1 ^ ch, 2654435761)
        h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    const combined = (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')
    return (combined + combined + combined + combined).slice(0, 64)
}

/**
 * Hash a string using crypto.subtle (secure context) or fallback.
 */
export async function safeHash(input: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        try {
            const encoder = new TextEncoder()
            const data = encoder.encode(input)
            const hash = await crypto.subtle.digest('SHA-256', data)
            return Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0')).join('')
        } catch {
            return fallbackHash(input)
        }
    }
    return fallbackHash(input)
}

/**
 * Generate a random hex string (works in all contexts).
 */
export function randomHex(bytes: number): string {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
            .map(b => b.toString(16).padStart(2, '0')).join('')
    }
    return Array.from({ length: bytes }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('')
}

/**
 * Generate a random field-like value (numeric string for Leo field type).
 */
export function randomFieldValue(): string {
    // Generate a random 128-bit number as a decimal string (valid as Leo field)
    const bytes = typeof crypto !== 'undefined' && crypto.getRandomValues
        ? crypto.getRandomValues(new Uint8Array(16))
        : new Uint8Array(Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)))
    // Convert to a BigInt decimal string
    let value = BigInt(0)
    for (const b of bytes) {
        value = (value << BigInt(8)) | BigInt(b)
    }
    return value.toString()
}

/**
 * Build a transaction for the shadow_social.aleo program.
 */
export function buildTransaction(
    publicKey: string,
    functionName: string,
    inputs: string[],
    fee: number = 500_000,
): ReturnType<typeof Transaction.createTransaction> {
    return Transaction.createTransaction(
        publicKey,
        WALLET_NETWORK,
        PROGRAM_ID,
        functionName,
        inputs,
        fee,
    )
}
