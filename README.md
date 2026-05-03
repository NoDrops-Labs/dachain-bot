# DAChain Bot

Automated bot for DAChain Testnet Inception with support for multi-account, proxy rotation, and concurrent processing.

> 💡 **Join Our Community**: For updates, support, and discussions, join our Telegram channel: [@NoDrops](https://t.me/NoDrops)
> **Code Obfuscation Notice**: This script will be obfuscated to prevent unauthorized code redistribution. The full source code will be shared publicly after the event ends.

## Features

- 🔐 **Wallet Authentication** - SIWE (Sign-In With Ethereum) authentication
- 💾 **Session Caching** - Stores session tokens with automatic re-authentication
- 🎯 **Task Automation** - Auto-complete daily tasks, faucet claims, and badge minting
- 💰 **Transaction Automation** - Automated DACC transactions between wallets
- 🔥 **Onchain Operations** - DACC burn for QE and staking support
- 📦 **Quantum Crates** - Automated crate opening (configurable)
- 👥 **Multi-Account** - Process multiple accounts with pool-based concurrency
- 🔄 **Proxy Support** - HTTP, HTTPS, SOCKS4, and SOCKS5 proxies with rotation
- 🛡️ **Smart Proxy Management** - Gradual blocking, failure tracking, and automatic fallback
- 📊 **TUI Dashboard** - Real-time monitoring with loop countdown and proxy statistics
- ⏱️ **Smart Delays** - Random delays between accounts to avoid rate limiting
- 🔁 **Loop Mode** - Schedule automatic reruns every 8 hours
- 🔄 **Auto-Retry** - Intelligent retry with Circuit Breaker protection

## Requirements

- **[DAChain Account](https://inception.dachain.io?ref=DAC541493)** - Register and connect wallet
- **Node.js** v18 or higher
- **npm** (Node Package Manager)
- **Private Keys** - Ethereum wallet private keys
- **Proxies** (Optional but recommended for multiple accounts)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Interactive Setup (Recommended)

Run the interactive setup wizard to configure everything:

```bash
npm run setup
```

The setup wizard will guide you through:
- **Private Keys** - Enter your wallet private keys (comma or space separated)
- **Proxies** - Optional proxy list (comma or space separated)

### 3. Manual Configuration (Alternative)

If you prefer manual setup:

**Create `.env` file:**

```env
# Private Keys (numbered format)
PK_1=0x...your_private_key_1
PK_2=0x...your_private_key_2
PK_3=0x...your_private_key_3
```

**Edit `proxies.txt`:**

```
http://user:pass@proxy1.com:8080
socks5://user:pass@proxy2.com:1080
socks4://proxy3.com:1080
```

**Supported formats:**
- HTTP: `http://user:pass@host:port` or `http://host:port`
- HTTPS: `https://user:pass@host:port` or `https://host:port`
- SOCKS5: `socks5://user:pass@host:port` or `socks5://host:port`
- SOCKS4: `socks4://user:pass@host:port` or `socks4://host:port`

### 4. Run the Bot

```bash
npm start
```

## How It Works

### Processing Flow

1. **Authentication** - Wallet-based authentication (or uses cached session)
2. **Profile Sync** - Fetches current points, badge status, and blockchain balance
3. **Faucet** - Claims testnet tokens if available
4. **Quantum Crates** - Opens available crates (if enabled in config)
5. **Tasks** - Completes available Inception tasks
6. **Badge Minting** - Mints unclaimed NFT badges
7. **Transactions** - Sends DACC transactions between wallets (if enabled)
8. **Onchain Operations** - Burns DACC for QE and stakes DACC (if enabled)
9. **Summary** - Shows final points and stats
10. **Loop** - Waits 8 hours until next run (if enabled)

### Session Caching

- Sessions are cached in `data/data.json`
- Valid sessions skip the authentication API call entirely
- Sessions auto-refresh when expired (automatic re-authentication)
- Cached data displayed immediately in TUI
- Profile data preserved across retry attempts

### Checkpoint System

The bot uses an 8-stage checkpoint system to prevent duplicate operations:
1. Authentication complete
2. Profile loaded
3. Faucet claimed
4. Crates opened
5. Tasks completed
6. Badges minted
7. Transactions sent
8. Onchain operations done

Each checkpoint is saved to `data.json`, so if the bot crashes or is interrupted, it resumes from the last checkpoint on retry.

### Pool-Based Concurrency

The bot uses a **proxy pool** for maximum efficiency:
- **10 proxies, 6 accounts** → All 6 accounts run concurrently
- When one account finishes, its proxy is **immediately** reassigned
- Random 3-10 second delay between account completions

**Advanced ProxyPool Features:**
- Gradual blocking after 3 consecutive failures
- Success tracking resets failure counters
- Wait queue when all proxies are busy
- Force-block mechanism after max account retries
- Automatic fallback to direct connection (if enabled in config)

## Configuration

Edit `config.js` to customize bot behavior:

```javascript
export default {
  debug: false,
  enableLoop: true,
  loopDelayMinutes: 480,
  
  retry: {
    maxProxyRetries: 3,
    maxApiRetries: 2,
  },
  
  fallback: {
    noProxyOnExhausted: false,
  },
  
  delays: {
    betweenAccountsMin: 3,
    betweenAccountsMax: 10,
    afterTaskComplete: 1.5,
    afterError: 5,
    betweenRequestsMin: 1.2,
    betweenRequestsMax: 4.5,
  },

  transactions: {
    enabled: true,
    dailyMin: 3,
    dailyMax: 5,
    amountMin: 0.01,
    amountMax: 0.05,
    minBalanceThreshold: 0.35,
    delayBetweenTxMin: 2,
    delayBetweenTxMax: 8,
  },

  onchain: {
    burnEnabled: true,
    stakeEnabled: true,
    stakeAmountMin: 0.1,
    stakeAmountMax: 1.0,
  },

  quantumCrates: {
    enabled: false,
    maxOpensPerRun: 5,
  },
};
```

**Configuration Notes:**
- Time values use **human-readable units** (minutes and seconds)
- `loopDelayMinutes: 480` = 8 hours
- Delays are automatically converted to milliseconds internally
- Random delays help avoid rate limiting and detection

## Data Storage

| Path | Purpose |
|------|---------|
| `.env` | Private keys (PK_N) |
| `proxies.txt` | Proxy list |
| `logs/process.log` | Activity logs with timestamps |
| `data/data.json` | Cached sessions and account state |
| `data/data.json.lock` | File lock for concurrent access protection |

## Utility Scripts

Manage bot data and logs easily with these npm scripts:

```bash
npm start              # Run the bot
npm run setup          # Interactive setup wizard
npm test               # Run test suite
npm run clear-log      # Clear log file
npm run clear-data     # Clear account data
npm run check-config   # Display current configuration
npm run check-log      # Display log file
npm run check-data     # Show account summary with points
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No accounts loaded | Check `.env` for PK_1, PK_2, etc. |
| Proxy connection failed | Verify proxy format includes protocol (http://, socks5://, etc.) |
| HTTP 401 errors | Session expired, will auto-refresh on next run |
| All proxies blocked | Add more proxies or wait for cooldown |
| Bot exits immediately | Check logs with `npm run check-log` |
| "Cannot read properties of undefined" | Ensure all config sections exist (transactions, onchain, quantumCrates) |
| RPC 504 Gateway Timeout | Bot handles gracefully, will skip onchain operations and continue |

## Project Structure

```
dachain-bot/
├── index.js              # CLI entry point with loop mode
├── config.js             # Configuration (all sections required)
├── package.json          # Dependencies
├── .env                  # Private keys (not committed)
├── proxies.txt           # Proxy list (not committed)
├── src/
│   ├── app.js            # Main bot orchestration with checkpoint system
│   ├── ui.js             # TUI dashboard and logger
│   ├── core/
│   │   ├── api.js        # DAChain API client
│   │   └── chain.js      # Blockchain constants
│   ├── services/
│   │   ├── auth.js       # Wallet authentication with Circuit Breaker
│   │   ├── wallet.js     # Wallet utilities
│   │   ├── faucet.js     # Faucet claiming with Circuit Breaker
│   │   ├── crate.js      # Quantum crate opening with Circuit Breaker
│   │   ├── tasks.js      # Task automation with Circuit Breaker
│   │   ├── badges.js     # Badge minting with Circuit Breaker
│   │   ├── transactions.js # Transaction automation with Circuit Breaker
│   │   └── onchain.js    # Burn/stake operations with Circuit Breaker
│   └── utils/
│       ├── helper.js     # ProxyPool, atomic writes, mutex locking
│       ├── logger.js     # File logging
│       ├── setup.js      # Interactive setup
│       ├── errors.js     # Error classification and retry logic
│       └── circuit-breaker.js # Circuit Breaker implementation
├── data/                 # Runtime data (gitignored)
│   └── data.json         # Cached sessions and checkpoints
└── logs/                 # Process logs (gitignored)
    └── process.log       # Activity log with timestamps
```

## DAChain Network

- **RPC**: `https://rpctest.dachain.tech`
- **Chain ID**: `21894`
- **Symbol**: `DACC`
- **Explorer**: `https://exptest.dachain.tech`
- **App**: `https://inception.dachain.io`
- **Referral**: `DAC541493`

## Notes

- **Account Setup**: Register at [https://inception.dachain.io?ref=DAC541493](https://inception.dachain.io?ref=DAC541493) and connect wallet
- **Daily Limits**: Faucet cooldown is 8 hours, crate opening limited to 5 per day
- **Concurrency**: Based on proxy count (1 account at a time without proxies)
- **Delays**: Random 3-10s delay between accounts to avoid rate limiting
- **Session Cache**: Stored locally, never shared or uploaded
- **Proxy Blocking**: Proxies are blocked after 3 consecutive failures
- **Dashboard**: Shows Total/Working/Blocked proxy statistics and loop countdown timer
- **Circuit Breakers**: All services protected, opens after 5 failures, auto-resets after 60s
- **File Locking**: Prevents data.json corruption from concurrent access

## Disclaimer

This bot is for educational purposes only. Use at your own risk. Always ensure you comply with the terms of service of the platforms you interact with.

## Support the Project

If this project has been helpful to you, consider supporting its development with donations:

| Network | Address |
|---------|---------|
| **EVM** | `0xfD1847bFAA92fb8c0d100b207d377490C5acd34c` |
| **SOL** | `BBZjp11sJNvekXZEBhhYDro9gsyyhEKXXcfEEub5ubje` |
| **TON** | `UQDoLQNF-nt9CFOHBs9mQqxH9YJKrZ6mFPbAeHH8Jo9xIGCb` |
| **SUI** | `0x79672047f5e2fa0c4db3e4278f80b9ac504b2858c6d82d63f833fbdcc6805175` |
| **TRX** | `TUq1ijVy3rwm9f66ohPhDVbD3dDd3Astfx` |

## License

This project is licensed under the [MIT License](LICENSE).

---

**Made with ❤️ by NoDrops Community**
