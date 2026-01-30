# 🕶️ Shadow

> **Your presence, without your identity.**

A privacy-first anonymous social and messaging platform built on **Aleo**. Sign in with your wallet, post anonymously, message privately, and transact confidentially—without revealing identity.

![Aleo](https://img.shields.io/badge/Built%20on-Aleo-purple?style=for-the-badge)
![Leo](https://img.shields.io/badge/Smart%20Contract-Leo-blue?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Anonymous Posts** | Share thoughts without revealing identity |
| 💬 **Private Messages** | End-to-end encrypted peer-to-peer messages |
| 💸 **Stealth Payments** | Send ALEO without exposing sender/receiver |
| 🛡️ **Anti-Spam** | ZK uniqueness proofs prevent bots |

---

## 🏗️ Architecture

```
User → Connect Aleo Wallet → Generate Shadow Identity (ZK)
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                 ↓                  ↓
              Anonymous Post    Private Message    Private Transfer
                    ↓                 ↓                  ↓
              ZK Proof Gen      Encryption         ZK Proof Gen
                    ↓                 ↓                  ↓
                    └─────────── Aleo Network ──────────┘
```

---

## 📁 Project Structure

```
Shadow/
├── contracts/shadow_social/
│   ├── src/main.leo       # 320 lines - Full contract
│   ├── program.json
│   └── .env
├── frontend/
│   ├── src/components/    # React components
│   └── src/App.tsx        # Main app
├── docs/
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | Aleo L1 |
| Smart Contracts | Leo |
| Frontend | React + TypeScript + Vite |
| Styling | Pure CSS (Dark theme) |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to `http://localhost:5173`

---

## 📝 Leo Contract

### Records
- `ShadowIdentity` - Private user identity
- `ShadowPost` - Anonymous post
- `ShadowMessage` - Encrypted message
- `PaymentReceipt` - Private transfer receipt
- `UniquenessToken` - Anti-spam token

### Transitions
| Function | Purpose |
|----------|---------|
| `register_identity` | Create shadow identity |
| `create_post` | Anonymous post |
| `send_message` | Private message |
| `private_transfer` | Stealth payment |
| `prove_uniqueness` | Anti-spam proof |

---

## 🔒 Privacy Model

### Hidden
- ✅ Wallet address
- ✅ Message contents
- ✅ Posting history
- ✅ Social graph
- ✅ Payment details

### Public
- Post existence (not content)
- Proof validity

---

## 🔗 Resources

- [Aleo Developer Docs](https://developer.aleo.org/)
- [Leo Language Docs](https://docs.leo-lang.org/leo)
- [Aleo Faucet](https://faucet.aleo.org/)

---

## 📊 Build Status

| Component | Status |
|-----------|--------|
| Leo Contract | ✅ 320 lines |
| Frontend | ✅ 5 components |
| Dark Theme | ✅ Pure CSS |
| Build | ✅ Verified |

---

<p align="center">
  <strong>🕶️ Shadow</strong><br>
  <em>Your presence, without your identity.</em>
</p>
