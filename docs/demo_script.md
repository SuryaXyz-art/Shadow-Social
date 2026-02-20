# Shadow — 90-Second Demo Script

**Format**: Narrated walkthrough for grant submission video or live presentation.

---

## [0:00 - 0:10] The Problem

Every social platform today forces a trade-off: participate and sacrifice your privacy, or stay private and lose your voice. Decentralized alternatives moved data on-chain but made it worse — wallet addresses, transaction histories, and social graphs are permanently visible to anyone.

## [0:10 - 0:25] The Solution

Shadow eliminates this trade-off. It is a composable zero-knowledge identity and reputation infrastructure layer built on Aleo. Users interact anonymously — posting, messaging, transacting — while building verifiable reputation. No wallet address is ever linked to any action.

## [0:25 - 0:40] How It Works

When a user connects their wallet, Shadow generates a private identity hash using BHP256 with a random salt. This hash is the only identifier — one-way, unlinkable to the wallet. Every interaction produces a zero-knowledge proof that validates the action without revealing the actor. Posts are stored as content hashes. Messages are fully encrypted. Payments disclose nothing.

## [0:40 - 0:55] The Core Innovation

Shadow introduces threshold-based reputation verification. A user with a reputation of 847 can prove they exceed a threshold of 200 without revealing the number 847. The verifier learns only one bit of information: pass or fail. This is enforced at the circuit level by Leo's constraint system — the `prove_reputation_threshold` transition asserts `reputation >= min_score` inside the ZK proof. No state is modified. No score is disclosed.

## [0:55 - 1:10] Security

Every action is nonce-gated to prevent replay attacks. Content is deduplicated via hash mappings. Reputation is capped at 0 to 1000 with a maximum of 10 points per action. Identity ownership is enforced by `assert_eq(self.caller, identity.owner)` on every transition. The threat model is documented with concrete Leo assertions for each vector.

## [1:10 - 1:25] Composability

Shadow is not an application — it is infrastructure. Any Aleo program can import `ShadowIdentity` as a record and call `prove_reputation_threshold` to gate access. DAO voting, DeFi participation, gated communities — all of these become possible with a single cross-program call. The reputation commitment system enables external verification without revealing scores.

## [1:25 - 1:30] Why Aleo

Aleo is the only Layer 1 that provides programmable zero-knowledge proofs at the application layer. Shadow leverages this to make privacy the default, not an afterthought. This is what identity infrastructure looks like on Aleo.

---

**Closing frame**: Shadow — Composable Zero-Knowledge Identity and Reputation Infrastructure for Aleo.
