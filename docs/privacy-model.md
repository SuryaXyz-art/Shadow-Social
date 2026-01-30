# 🔒 Privacy Model

## Core Principles

AntiGravity ID Vault is built on three fundamental privacy principles:

### 1. Data Minimization
Only the minimum necessary data is collected and stored. Instead of full identity documents, we store:
- Poseidon hashes of credential data
- Essential metadata (type, issuer, validity)

### 2. Zero-Knowledge by Default
All proofs are zero-knowledge:
- Verifier learns ONLY the proof result (true/false)
- No underlying data is revealed
- No linkability between proofs

### 3. User Sovereignty
- Users control their credential records
- Only users can generate proofs from their credentials
- Selective disclosure is user-initiated

---

## What is Hidden

| Data | Protection |
|------|------------|
| Raw identity data | Never stored, only hashed |
| Date of birth | Only birth year stored for age proofs |
| Wallet balance | Not exposed during proofs |
| Transaction history | Completely hidden |
| Credential contents | Encrypted in records |

## What is Revealed

| Data | Visibility |
|------|------------|
| Proof result | Public (true/false) |
| Proof type | Public (e.g., "age > 18") |
| Issuer address | Optional (for trust) |
| Timestamp | Public (when proof submitted) |

---

## ZK Guarantees

### Non-Linkability
Multiple proofs from the same credential cannot be linked together by verifiers.

### Soundness
A false proof cannot be generated - if the proof verifies, the statement is true.

### Zero-Knowledge
The verifier learns nothing beyond the truth of the statement.

### Non-Replayability
Proofs are bound to specific contexts and cannot be replayed.

---

## Threat Model

### Protected Against
- ✅ Data breaches (no raw data stored)
- ✅ Correlation attacks (proofs unlinkable)
- ✅ Credential theft (bound to addresses)
- ✅ Unauthorized disclosure (user controls)

### Trust Assumptions
- Issuers are trusted for initial credential accuracy
- Aleo blockchain is secure
- Client-side hashing is performed correctly

---

## Comparison to Traditional Systems

| Aspect | Traditional KYC | AntiGravity |
|--------|----------------|-------------|
| Data storage | Full documents | Only hashes |
| Verification | Share documents | ZK proofs only |
| Data breaches | High risk | Minimal exposure |
| User control | Limited | Full sovereignty |
| Privacy | None | Maximum |
