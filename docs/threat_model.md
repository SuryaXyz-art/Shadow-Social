# Shadow — Threat Model

**Program**: `shadow_social.aleo` | **Version**: 3.0

This document provides a formal analysis of Shadow's threat surface and the specific mechanisms that mitigate each vector. Every mitigation references concrete Leo assertions, mappings, or cryptographic primitives.

---

## 1. Replay Attack Mitigation

**Attack scenario**: An adversary captures a valid transaction and resubmits it to duplicate its effect (e.g., double-posting, double-spending reputation).

**Mitigation**: Every state-changing transition generates a nonce hash derived from the caller's identity and a user-provided salt:

```leo
let nonce_hash: field = BHP256::hash_to_field(
    (identity.identity_hash, post_salt)
);
```

The `used_nonces` mapping tracks every consumed nonce:

```leo
let nonce_used: bool = Mapping::get_or_use(used_nonces, nonce_hash, false);
assert(!nonce_used);
Mapping::set(used_nonces, nonce_hash, true);
```

**Why it fails**: Replaying a transaction reuses the same nonce hash. The `assert(!nonce_used)` check in the finalize block rejects the duplicate. The attacker cannot forge a new nonce without the private identity hash and a fresh salt.

---

## 2. Sybil Resistance Model

**Attack scenario**: An adversary creates multiple identities to amplify influence, bypass rate limits, or accumulate disproportionate reputation.

**Mitigation**: Identity registration is bound to the caller's wallet address:

```leo
let identity_hash: field = BHP256::hash_to_field(
    (self.caller, identity_salt)
);
```

The `identities` mapping prevents duplicate registration:

```leo
let exists: bool = Mapping::get_or_use(identities, identity_hash, false);
assert(!exists);
Mapping::set(identities, identity_hash, true);
```

**Why it fails**: Each wallet address produces a deterministic identity hash (given the same salt). While an attacker can create multiple wallet addresses, each requires a funded Aleo account with sufficient credits to pay transaction fees. The economic cost of maintaining multiple funded wallets provides a natural Sybil barrier. Additionally, `prove_reputation_threshold` enables downstream applications to require minimum reputation, which new Sybil accounts cannot immediately satisfy.

---

## 3. Deduplication Strategy

**Attack scenario**: An adversary submits identical post content repeatedly to spam the feed.

**Mitigation**: Post content is hashed and checked against the `post_hashes` mapping:

```leo
let content_exists: bool = Mapping::get_or_use(post_hashes, content_hash, false);
assert(!content_exists);
Mapping::set(post_hashes, content_hash, true);
```

**Why it fails**: The `assert(!content_exists)` check rejects any post whose content hash already exists on-chain. The attacker cannot submit the same content twice. Changing even one character produces a different hash, but this is mitigated by rate limiting (see below).

**Secondary control**: The `rate_limits` mapping enforces a per-identity cooldown:

```leo
Mapping::set(rate_limits, identity_hash, current_block);
```

This prevents rapid-fire posting even with unique content.

---

## 4. Identity Ownership Enforcement

**Attack scenario**: An adversary attempts to use another user's `ShadowIdentity` record to post, message, or transact on their behalf.

**Mitigation**: Every transition that consumes a `ShadowIdentity` verifies ownership:

```leo
assert_eq(self.caller, identity.owner);
```

**Why it fails**: Aleo records are encrypted and owned by a specific address. The `self.caller` check in the transition ensures that only the wallet that owns the record can invoke transitions with it. An attacker cannot construct a valid transaction using someone else's record because they lack the decryption key to read its contents, and even if they could, the `assert_eq` would fail.

---

## 5. Reputation Integrity

**Attack scenario**: An adversary attempts to inflate their reputation beyond valid bounds, bypass the per-action cap, or manipulate scores.

**Mitigation**: Reputation changes are bounded at multiple levels:

```leo
// Per-action cap
assert(amount <= 10u32);

// Global ceiling
let new_rep: u32 = identity.reputation + amount;
let capped: u32 = new_rep < 1000u32 ? new_rep : 1000u32;

// Floor enforcement (decrease)
let new_rep: u32 = identity.reputation >= amount ? identity.reputation - amount : 0u32;
```

Each reputation transition is nonce-gated (see Section 1), preventing replay-based inflation.

**Why it fails**: The combination of per-action caps (max 10), global bounds (0-1000), and nonce-gated transitions makes it impossible to inflate reputation without consuming unique nonces for each increment. The economic cost of generating valid nonces scales linearly with the desired reputation.

---

## 6. Commitment Binding Security

**Attack scenario**: An adversary commits a false reputation value, or attempts to use a commitment generated from a different score.

**Mitigation**: The `commit_reputation` transition computes the commitment inside the ZK circuit using the identity's actual reputation:

```leo
let commitment: field = BHP256::commit_to_field(
    identity.reputation, commitment_salt
);
```

The commitment is deterministic: given the same reputation and salt, it always produces the same field element.

**Why it fails**: The commitment is computed within the prover's circuit from the private `identity.reputation` field. The prover cannot substitute a different value because the ZK proof would be invalid — the circuit enforces that the committed value matches the record's actual reputation. BHP256's collision resistance ensures that two different inputs cannot produce the same commitment.

---

## 7. Nonce Lifecycle

**Attack scenario**: An adversary exhausts the nonce space, or finds a way to generate valid nonces without owning the identity.

**Nonce derivation**:

```leo
let nonce_hash: field = BHP256::hash_to_field(
    (identity.identity_hash, user_provided_salt)
);
```

**Lifecycle**:

1. User provides a salt (arbitrary `field` value)
2. Nonce hash is derived from `(identity_hash, salt)` via BHP256
3. Finalize checks `used_nonces[nonce_hash] == false`
4. Nonce is marked as used: `used_nonces[nonce_hash] = true`
5. Nonce cannot be reused

**Why exhaustion fails**: The `field` type in Aleo has approximately 2^253 possible values. The nonce space is effectively infinite.

**Why forgery fails**: The nonce hash depends on the private `identity_hash`. Without knowledge of this value, an attacker cannot predict or construct a valid nonce hash.

---

## 8. ZK Leakage Analysis

**Attack scenario**: An adversary observes on-chain data to infer private information about users.

**Analysis of each transition**:

| Transition | Public Outputs | Private Inputs | Leakage |
|------------|---------------|----------------|---------|
| `register_identity` | `identity_hash` (via mapping) | wallet address, salt | Hash is one-way; wallet not recoverable |
| `create_post` | `post_id`, `content_hash`, `nonce_hash` | identity, content, salt | Content not recoverable from hash |
| `send_message` | None | sender, receiver, content | Zero public leakage |
| `prove_reputation_threshold` | None | identity, min_score | Zero public leakage |
| `commit_reputation` | `commitment` (via mapping) | identity, salt | Score not recoverable without salt |
| `private_transfer` | None | sender, receiver, amount, memo | Zero public leakage |

**Timing analysis**: All transitions have similar execution profiles. An observer cannot distinguish between different transition types based on timing alone, as ZK proof generation dominates execution time uniformly.

**Graph analysis**: Since identity hashes are derived from wallet addresses with random salts, and messages are fully private, there is no exploitable social graph on-chain. The `identities` mapping reveals only that an identity exists, not who owns it or what they have done.

---

## Summary

| Vector | Primary Defense | Secondary Defense |
|--------|----------------|-------------------|
| Replay | `used_nonces` mapping | Nonce derived from identity hash |
| Sybil | Wallet-bound identity | Economic cost of funded accounts |
| Spam | `post_hashes` deduplication | `rate_limits` cooldown |
| Impersonation | `assert_eq(self.caller, identity.owner)` | Record encryption |
| Reputation manipulation | Per-action cap (10), global cap (1000) | Nonce-gated transitions |
| Commitment forgery | BHP256 circuit enforcement | Collision resistance |
| Nonce exhaustion | 2^253 field space | Identity-bound derivation |
| Information leakage | No public outputs on sensitive transitions | One-way hash functions |
