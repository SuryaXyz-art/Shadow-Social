# Shadow

**Private Social Infrastructure Protocol with ZK Identity and Threshold-Based Reputation Verification**

Shadow is a privacy-first social and messaging protocol built on the Aleo network. It enables anonymous posting, encrypted messaging, confidential payments, zero-knowledge reputation, and threshold-based reputation proofs — all verified on-chain without exposing user identity.

---

## Table of Contents

- [Overview](#overview)
- [Problem](#problem)
- [Solution](#solution)
- [Architecture](#architecture)
- [Smart Contract Design](#smart-contract-design)
- [Composable Identity Primitive](#composable-identity-primitive)
- [Frontend Architecture](#frontend-architecture)
- [Zero-Knowledge Reputation Proof](#zero-knowledge-reputation-proof)
- [Privacy Model](#privacy-model)
- [Security Model](#security-model)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Shadow is a social protocol that decouples identity from activity. Users connect an Aleo wallet, generate a private identity hash, and interact anonymously. Every action — posting, messaging, paying — produces a zero-knowledge proof that validates the operation without revealing the actor.

| Feature | Status |
|---------|--------|
| Anonymous posting with content deduplication | Implemented |
| End-to-end encrypted messaging | Implemented |
| Confidential ALEO transfers | Implemented |
| ZK-based reputation (0–1000) | Implemented |
| Threshold-based reputation proof | Implemented |
| Reputation commitment binding (BHP256) | Implemented |
| Anti-spam: nonce replay prevention | Implemented |
| Rate limiting (10 blocks per post) | Implemented |

---

## Problem

Existing social platforms require identity disclosure to participate. Even decentralized alternatives often expose wallet addresses, transaction histories, and social graphs on-chain. There is no production-ready solution for:

- Posting without identity linkage
- Messaging without metadata exposure
- Transacting without sender/receiver visibility
- Building reputation without revealing interaction history

---

## Solution

Shadow uses Aleo's zero-knowledge proof system to solve each of these problems at the protocol level:

1. **Identity**: Wallet address is hashed with BHP256 and a random salt. The resulting identity hash is the only public-facing identifier.
2. **Posts**: Content is hashed before submission. Only the hash is stored on-chain. Content is never stored in plaintext.
3. **Messages**: Encrypted off-chain with the recipient's key. Only the content hash is stored on-chain for proof of delivery.
4. **Payments**: Standard Aleo private transfers with an encrypted memo field. Neither sender, receiver, nor amount is publicly visible.
5. **Reputation**: A score (0–1000) tracked per identity hash. Score changes are gated by nonce-protected transitions to prevent manipulation.

---

## Architecture

```
User
  |
  v
Wallet Connection (Aleo private key, local signing)
  |
  v
Identity Registration
  |-- BHP256::hash_to_field(self.caller, salt) --> identity_hash
  |-- ShadowIdentity record (private, owned by caller)
  |-- identities[identity_hash] = true
  |
  +---> Social Layer
  |       |-- create_post:      content_hash --> posts[post_id]
  |       |-- send_message:     encrypted, zero public outputs
  |       |-- private_transfer: amount + memo hidden
  |
  +---> Reputation Layer
  |       |-- increase_reputation: +amount (max 10, cap 1000)
  |       |-- decrease_reputation: -amount (floor 0)
  |       |-- Anti-replay: used_nonces[nonce_hash] enforced
  |
  +---> ZK Proof Layer
  |       |-- prove_reputation_threshold(identity, min_score)
  |       |     assert(reputation >= min_score)
  |       |     --> boolean result only, no state change
  |       |
  |       |-- commit_reputation(identity, salt)
  |       |     BHP256::commit_to_field(reputation, salt)
  |       |     --> reputation_commitments[identity_hash] = commitment
  |
  +---> External Program Validation
          |-- Import ShadowIdentity record
          |-- Call prove_reputation_threshold cross-program
          |-- Verify commitment against reputation_commitments mapping
          |-- Gate access: DAO voting, DeFi, communities
          |
          v
        Aleo Network (ZK verification, no identity exposed)
```

---

## Smart Contract Design

**Program**: `shadow_social.aleo`

### Records

| Record | Purpose |
|--------|---------|
| `ShadowIdentity` | Private identity with reputation score |
| `ShadowPost` | Anonymous post with content hash |
| `ShadowMessage` | Encrypted peer-to-peer message |
| `PaymentReceipt` | Confidential transfer receipt |
| `UniquenessToken` | Anti-spam proof with nonce binding |

### Mappings

| Mapping | Purpose |
|---------|---------|
| `identities` | Registered identity hash tracking |
| `posts` | Post existence proofs |
| `post_hashes` | Content deduplication |
| `used_nonces` | Replay attack prevention |
| `rate_limits` | Per-identity rate limiting |
| `reputation_scores` | ZK reputation tracking |
| `reputation_commitments` | BHP256 commitment binding for threshold proofs |

### Transitions

| Function | Description |
|----------|-------------|
| `register_identity` | Create shadow identity with initial reputation of 10 |
| `create_post` | Submit anonymous post with content hash deduplication and nonce check |
| `send_message` | Send encrypted message to recipient |
| `read_message` | Mark message as read |
| `prove_uniqueness` | Generate anti-spam token with `commit_to_field` binding |
| `use_token` | Consume uniqueness token |
| `increase_reputation` | Add reputation (max 10 per action, cap 1000) |
| `decrease_reputation` | Remove reputation (min 0) |
| `private_transfer` | Send ALEO with encrypted memo |
| `prove_reputation_threshold` | ZK proof that reputation >= threshold. No score disclosed. No state modified. |
| `commit_reputation` | Store BHP256 commitment of reputation for external verification |
| `deactivate_identity` | Soft delete account |
| `reactivate_identity` | Restore account |

---

## Composable Identity Primitive

Shadow is designed as infrastructure, not a standalone application. Its records, transitions, and mappings are composable primitives that any Aleo program can import and use.

### What external programs can do

| Capability | Mechanism |
|------------|-----------|
| Require minimum reputation | Call `prove_reputation_threshold` with a threshold value |
| Verify identity uniqueness | Call `prove_uniqueness` and consume the resulting token |
| Use `ShadowIdentity` as a credential | Import the record type and validate ownership |
| Gate DAO voting by private reputation | Cross-program call with threshold assertion |
| Gate DeFi participation by credibility | Verify reputation commitment without seeing the score |

### Pseudo-integration example

```leo
import shadow_social.aleo;

program gated_dao.aleo {
    transition gated_vote(
        identity: shadow_social.aleo/ShadowIdentity,
        proposal_id: field
    ) -> bool {
        // Require reputation >= 200 to vote.
        // The voter's actual score is never disclosed.
        shadow_social.aleo/prove_reputation_threshold(identity, 200u32);

        // Execute privileged action
        return true;
    }
}
```

This pattern requires zero custom identity logic on the consumer side. Shadow handles identity registration, reputation tracking, and threshold verification. The consumer program only needs to specify the minimum threshold.

### Design principles

1. **No SDK required for on-chain integration**: External Leo programs compose via standard `import` and cross-program calls.
2. **No oracle dependency**: Reputation is verified inside the ZK circuit, not by an external service.
3. **No state coupling**: `prove_reputation_threshold` does not modify Shadow's state. The consumer program cannot affect Shadow's reputation scores.
4. **Minimal trust assumptions**: The consumer trusts only the Aleo network's proof validity. Shadow's contract logic is immutable and verifiable.

---

## Frontend Architecture

| Component | Purpose |
|-----------|---------|
| `Landing` | Hero, feature grid, architecture, security model, ZK threshold section |
| `Header` | SVG logo, navigation, reputation, network indicator |
| `Feed` | Compose box, rate limit indicator, post list |
| `Messages` | Encrypted message composer and sent list |
| `Payments` | Confidential transfer form with success state |
| `ReputationProofPanel` | ZK threshold proof interface with pass/fail states |

**Stack**: React, TypeScript, Vite. Lazy-loaded components via `React.lazy` + `Suspense`. Pure CSS design system with glassmorphism, Inter typography, and institutional dark theme.

**Environment variables**:
- `VITE_PROGRAM_ID` — Aleo program identifier
- `VITE_NETWORK` — Target network (testnet / mainnet)

---

## Zero-Knowledge Reputation Proof

Shadow introduces threshold-based reputation verification as a reusable ZK primitive. Users can prove their reputation meets a minimum threshold without revealing the actual score.

### Transition

```leo
transition prove_reputation_threshold(
    identity: ShadowIdentity,
    min_score: u32
) -> ShadowIdentity
```

The transition asserts `identity.reputation >= min_score` within the ZK circuit. The verifier learns only that the proof is valid (boolean). The actual reputation value remains private. No state is modified.

### Commitment Binding

```leo
transition commit_reputation(
    identity: ShadowIdentity,
    commitment_salt: field
) -> ShadowIdentity
```

Stores a BHP256 commitment of the reputation value on-chain via the `reputation_commitments` mapping. The commitment binds the score to a random salt. Without the salt, the commitment reveals nothing about the underlying value.

### Security Guarantees

- No public output reveals the reputation score
- Threshold must be within valid range (0-1000)
- Caller must own the identity record
- Identity must be active
- No state mutation occurs during proof generation
- Commitment is binding: cannot be forged without the salt

### Use Cases

- **Gated communities**: Require minimum reputation to join without disclosing scores
- **Private governance**: Prove eligibility to vote without revealing interaction history
- **Sybil resistance**: Verify minimum credibility for anonymous interactions
- **Cross-protocol composability**: Other programs can verify Shadow reputation proofs

This primitive is designed to be composable. Any Aleo program can consume the proof output or verify the commitment to build reputation-gated functionality.

---

## Privacy Model

### Private (never exposed)

- Wallet address to identity linkage
- Message content
- Post authorship
- Social graph and interaction history
- Payment sender, receiver, and amount
- Reputation change history

### Public (on-chain)

- Post existence (hash only)
- Proof validity
- Aggregate reputation score (not linked to wallet)

---

## Security Model

| Threat | Mitigation |
|--------|------------|
| Replay attacks | `used_nonces` mapping enforces nonce uniqueness |
| Duplicate content spam | `post_hashes` mapping prevents identical posts |
| Rapid posting | `rate_limits` mapping enforces 10-block cooldown |
| Reputation manipulation | Nonce-gated transitions, max 10 per action, cap 0–1000 |
| Identity impersonation | BHP256 hash derived from wallet + random salt |
| Uniqueness bypass | `commit_to_field` binds token to identity and salt |
| Reputation disclosure | `prove_reputation_threshold` reveals only boolean result |
| Commitment forgery | BHP256 commitment binding prevents score misrepresentation |
| Private key exposure | No keys stored in frontend. Wallet signs locally. |
| Environment leak | `.env` files excluded via `.gitignore` |

---

## Deployment

### Prerequisites

- Leo CLI
- Node.js 18+
- Aleo wallet extension

### Contract

```bash
cd contracts/shadow_social
leo build
leo deploy --network testnet --program shadow_social.aleo
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_PROGRAM_ID and VITE_NETWORK
npm install
npm run build
```

Deploy `dist/` to Vercel, Netlify, or any static hosting provider.

**Vercel configuration**:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_PROGRAM_ID`, `VITE_NETWORK`

---

## Roadmap

### Wave 1 (Complete)
- Core protocol: identity, posts, messages, payments
- ZK reputation system (0-1000, nonce-gated)
- Anti-spam infrastructure (deduplication, rate limiting)
- Institutional frontend with dark theme

### Wave 2 (Complete)
- ZK reputation threshold proofs (`prove_reputation_threshold`)
- BHP256 reputation commitment binding (`commit_reputation`)
- Threat model documentation
- Security hardening and deployment configuration

### Wave 3 (Next)
- JavaScript SDK for third-party program integration (`@shadow/sdk`)
- Proof helper utilities for frontend developers
- DAO gating reference implementations
- Developer documentation portal

### Wave 4
- Cross-application identity portability
- Private governance module (proposal + voting with threshold gating)
- ZK social graph proofs (prove connection without revealing graph)
- Anonymous tipping composability

---

## Project Structure

```
shadow/
  contracts/shadow_social/
    src/main.leo              # Smart contract (~620 lines)
    program.json
  frontend/
    src/
      components/             # 6 React components (lazy-loaded)
      App.tsx                 # Application state and routing
      index.css               # Design system
      App.css                 # Component styles
    index.html
    vercel.json               # Security headers
    .env.example
  docs/
    threat_model.md           # 8-vector threat analysis
    demo_script.md            # 90-second narration
    grant_submission.md       # Structured grant answers
    x_thread.md               # Technical X thread
    ecosystem_strategy.md     # Integration and partnerships
  README.md
```

---

## License

MIT
