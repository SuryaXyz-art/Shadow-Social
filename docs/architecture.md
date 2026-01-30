# 🏗️ Architecture

## System Overview

AntiGravity ID Vault is a Zero-Knowledge Identity system built on Aleo L1. The architecture follows a privacy-first design where all sensitive data remains encrypted and only boolean proofs are shared.

## Components

### 1. Leo Smart Contract (`antigravity_id.aleo`)

The on-chain component manages:
- **Credential Records**: Encrypted identity credentials owned by users
- **Proof Submission**: On-chain proof verification
- **Revocation**: Issuer-controlled credential invalidation

### 2. Frontend Application

React-based UI providing:
- Wallet connection (Leo Wallet / Puzzle Wallet)
- Credential issuance interface
- Proof generation workflows
- Verifier dashboard

### 3. Aleo Blockchain

- **Records**: Private data structures owned by addresses
- **Mappings**: Public on-chain state (revocations, verified proofs)
- **Transitions**: State transitions that generate ZK proofs

## Data Flow

```
┌─────────────────┐
│   User Input    │  (e.g., Date of Birth)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Local Hashing  │  Data hashed client-side
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Leo Transition  │  issue_credential()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Record Created  │  Encrypted on Aleo
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Proof Request  │  "Prove age > 18"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ZK Proof Gen  │  Off-chain computation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ On-Chain Verify │  Boolean result public
└─────────────────┘
```

## Security Model

1. **No Raw Data Exposure**: Only hashes stored on-chain
2. **Issuer Attestation**: Credentials signed by issuers
3. **Revocability**: Issuers can invalidate credentials
4. **Non-Transferability**: Records bound to owner address
