# Shadow — Technical Thread

**Platform**: X (Twitter)
**Audience**: Aleo developers, ZK researchers, protocol engineers
**Tag**: @AleoHQ

---

### Thread

**1/9**

We built a zero-knowledge reputation threshold proof system on Aleo.

A user with a reputation of 847 can prove they exceed 200 — without revealing 847.

The verifier learns exactly one bit: pass or fail.

Here is how it works. Thread.

---

**2/9**

The core transition:

```
prove_reputation_threshold(
    identity: ShadowIdentity,
    min_score: u32
) -> ShadowIdentity
```

Inside the ZK circuit, Leo enforces:

```
assert(identity.reputation >= min_score);
```

No state is modified. No public outputs. The proof is the only artifact.

---

**3/9**

Why is this different from public scoring?

Public reputation = anyone can see your score, filter you, or target you.

Private threshold = you prove you qualify without disclosing anything else.

This is the difference between showing your ID and proving you are over 21.

---

**4/9**

Replay prevention is nonce-gated:

```
nonce_hash = BHP256::hash_to_field(identity_hash, salt)
assert(!used_nonces[nonce_hash])
```

Every action consumes a unique nonce. Replay a transaction? The `assert` rejects it. You cannot forge a nonce without the private identity hash.

---

**5/9**

Content deduplication uses hash mappings:

```
assert(!post_hashes[content_hash])
```

Identical posts are rejected at the protocol level. Not by moderation. Not by governance. By a Leo assertion that runs inside the ZK circuit.

---

**6/9**

Reputation commitment binding:

```
commitment = BHP256::commit_to_field(reputation, salt)
```

This stores a binding commitment on-chain. External programs can verify reputation properties without querying the score. The commitment reveals nothing without the salt.

---

**7/9**

Why is this unique to Aleo?

1. Private records: `ShadowIdentity` is encrypted and owner-controlled
2. Circuit assertions: `assert(rep >= threshold)` runs inside the proof
3. Composability: external programs can import and call our transitions
4. Default privacy: every transaction is private at the network layer

No other L1 provides all four.

---

**8/9**

Composability example:

```
transition gated_dao_vote(
    identity: shadow_social.aleo/ShadowIdentity,
    proposal_id: field
) {
    shadow_social.aleo/prove_reputation_threshold(identity, 100u32);
    // execute vote
}
```

Any Aleo program can gate access by Shadow reputation. No SDKs. No oracles. One cross-program call.

---

**9/9**

Shadow is not a social app. It is composable zero-knowledge identity and reputation infrastructure for Aleo.

Live on testnet. Open source. MIT licensed.

Threat model, architecture, and grant submission docs included.

@AleoHQ

---

**End of thread.**
