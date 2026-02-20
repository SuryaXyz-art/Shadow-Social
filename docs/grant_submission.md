# Shadow — Grant Submission

---

## Project Overview

Shadow is a composable zero-knowledge identity and reputation infrastructure layer built on the Aleo network. It provides privacy-preserving social primitives — anonymous posting, encrypted messaging, confidential payments, and threshold-based reputation verification — all enforced by Leo smart contracts and verified on-chain without exposing user identity.

Shadow is designed as a protocol layer, not a standalone application. Its identity records, reputation proofs, and commitment bindings are composable primitives that any Aleo program can import and use.

**Program**: `shadow_social.aleo`
**Frontend**: React + TypeScript + Vite, deployed on Vercel
**Network**: Aleo Testnet

---

## Core Innovation

Shadow introduces **zero-knowledge reputation threshold verification** as a reusable primitive on Aleo.

A user with a reputation of 847 can prove they exceed a threshold of 200 without revealing the number 847. The verifier learns exactly one bit of information: the condition is satisfied, or it is not.

This is implemented via the `prove_reputation_threshold` transition, which asserts `identity.reputation >= min_score` within the ZK circuit. No state is modified. No public outputs expose private values. The proof itself is the only artifact.

Additionally, `commit_reputation` stores a BHP256 commitment of the reputation value on-chain, enabling external programs to verify reputation properties without querying the score directly.

These two primitives — threshold proofs and commitment bindings — enable any Aleo program to implement reputation-gated access without building its own identity or scoring system.

---

## Technical Differentiation

| Dimension | Shadow | Typical Web3 Social |
|-----------|--------|---------------------|
| Identity | BHP256-hashed, wallet-unlinkable | Wallet address as identity |
| Reputation | Private, ZK-provable via threshold | Public score on-chain |
| Post privacy | Content hash only, no plaintext | Plaintext or IPFS (public) |
| Message privacy | Fully private, zero public outputs | Public or semi-encrypted |
| Composability | Records and transitions importable | Siloed application |
| Anti-spam | Nonce-gated + deduplication + rate limiting | Token staking or CAPTCHAs |

Shadow is the first implementation on Aleo that combines:

1. Private identity records as composable primitives
2. Threshold-based reputation verification without score disclosure
3. BHP256 commitment bindings for external proof validation
4. Nonce-gated anti-spam with content deduplication

---

## Security Model

Shadow's security is enforced entirely at the constraint level. Every mitigation is a Leo assertion, not application logic.

**Replay prevention**: `used_nonces` mapping with `assert(!nonce_used)` in finalize blocks.

**Content deduplication**: `post_hashes` mapping with `assert(!content_exists)`.

**Rate limiting**: `rate_limits` mapping with per-identity block-height tracking.

**Reputation bounds**: Per-action cap of 10, global cap of 0-1000, nonce-gated transitions.

**Identity ownership**: `assert_eq(self.caller, identity.owner)` on every transition.

**ZK leakage**: No transition exposes private inputs as public outputs. Sensitive transitions (messaging, transfers, threshold proofs) have zero public outputs.

A formal threat model is available at `docs/threat_model.md`, covering 8 attack vectors with concrete Leo code references.

---

## Ecosystem Impact

Shadow provides foundational infrastructure that the Aleo ecosystem currently lacks:

1. **Reusable identity primitive**: `ShadowIdentity` can serve as a composable identity record for any Aleo application, reducing the need for each project to build its own identity system.

2. **Reputation gating**: The `prove_reputation_threshold` transition enables any program to gate access by private reputation — DAO voting, DeFi participation, community membership — without building a scoring system.

3. **Anti-spam infrastructure**: The nonce + deduplication + rate limiting pattern is a proven anti-spam framework that other social or messaging protocols on Aleo can adopt or compose with.

4. **Privacy benchmark**: Shadow demonstrates that full-featured social applications can operate with zero plaintext on-chain, establishing a standard for privacy-first protocol design on Aleo.

---

## Roadmap

**Wave 1 (Complete)**: Core protocol — identity, posts, messages, payments, ZK reputation, anti-spam.

**Wave 2 (Complete)**: ZK threshold proofs, BHP256 commitment binding, code splitting, security hardening.

**Wave 3 (Next)**: JavaScript SDK for third-party integration, developer documentation portal, DAO gating reference implementations, wallet adapter SDK.

**Wave 4**: Cross-application identity portability, private governance module, ZK social graph proofs, anonymous tipping composability.

---

## Why Aleo

Aleo is the only Layer 1 blockchain that provides programmable zero-knowledge proofs at the application layer. This is a fundamental requirement for Shadow, not an optimization:

1. **Private records**: Aleo's record model enables `ShadowIdentity` to exist as an encrypted, owner-controlled data structure. No other chain provides this natively.

2. **Circuit-level assertions**: The `prove_reputation_threshold` transition enforces `reputation >= min_score` inside the ZK proof circuit. On any other chain, this would require a separate ZK proving system bolted onto the smart contract layer.

3. **Composable proofs**: Aleo's program model allows cross-program calls. External programs can import Shadow's transitions and records directly, without bridges, oracles, or off-chain relayers.

4. **Deterministic privacy**: Every Aleo transaction is private by default. Shadow does not need to opt into privacy — it inherits it from the network layer.

---

## Funding Utilization

| Allocation | Purpose |
|------------|---------|
| 40% | JavaScript SDK development and developer tooling |
| 25% | Cross-program composition testing and reference implementations |
| 20% | Security audit and formal verification |
| 15% | Documentation, developer relations, and ecosystem outreach |

Primary deliverable: A production-ready SDK that allows any Aleo developer to integrate Shadow identity and reputation gating with minimal code.

---

## Deliverables

| Item | Location |
|------|----------|
| Smart contract | `contracts/shadow_social/src/main.leo` |
| Frontend application | `frontend/` (deployed on Vercel) |
| Threat model | `docs/threat_model.md` |
| Demo script | `docs/demo_script.md` |
| README | `README.md` |
| Security headers | `frontend/vercel.json` |
