# Shadow - Testnet Deployment Guide

## Program Info
- **Program Name**: `shadow_social.aleo`
- **Network**: Aleo Testnet

## Constructor Information

The program includes an `init()` constructor that can only be called once after deployment:

```leo
transition init() {
    return then finalize();
}

finalize init() {
    let is_init: bool = Mapping::get_or_use(initialized, 0u8, false);
    assert(!is_init);
    Mapping::set(initialized, 0u8, true);
}
```

---

## Quick Deploy via Leo Playground

Since Leo CLI installation failed on Windows, use the **Leo Playground** for deployment:

### Step 1: Open Leo Playground
👉 https://play.leo-lang.org/

### Step 2: Create New Project
1. Click "New Project" or use the editor
2. Set program name: `shadow_social`

### Step 3: Paste Contract Code
Copy the entire contents of:
```
contracts/shadow_social/src/main.leo
```

### Step 4: Deploy to Testnet
1. Click the **"Deploy"** button (rocket icon)
2. Enter your Private Key:
   ```
   APrivateKey1zkpK2Bq7YFaCDQpo1AmTvhUBUcTaZhgDBPUK5bRjEZZejmU
   ```
3. Select Network: **Testnet**
4. Click **"Deploy"**

### Step 5: Initialize the Contract (Call Constructor)
After deployment, call the `init()` function to initialize:
```
Program: shadow_social.aleo
Function: init
Inputs: (none required)
```

### Step 6: Wait for Confirmation
- Deployment takes ~30-60 seconds
- You'll get a Transaction ID
- View on Explorer: https://explorer.aleo.org/

---

## Alternative: Install Leo on WSL/Linux

If you have WSL installed:

```bash
# In WSL terminal
curl -sSf https://raw.githubusercontent.com/ProvableHQ/leo/mainnet/install.sh | sh
source ~/.bashrc
leo --version

# Navigate to project
cd /mnt/c/Users/msi/Desktop/A2\ -\ Aleo\ Shadow/contracts/shadow_social
leo build
leo deploy --network testnet --private-key APrivateKey1zkpK2Bq7YFaCDQpo1AmTvhUBUcTaZhgDBPUK5bRjEZZejmU
```

---

## Deployment Cost

Estimated: ~10-20 Aleo credits for a program this size

Get testnet tokens: https://faucet.aleo.org/

---

## After Deployment

Save your:
- **Transaction ID**: `at1...xxxxx`
- **Program ID**: `shadow_social.aleo`

Update frontend to connect to deployed program.
