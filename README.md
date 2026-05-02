# DAChain Bot

Automated bot for DAChain Testnet Inception with support for multi-account, proxy rotation, and concurrent processing.

> 💡 **Join Our Community**: For updates, support, and discussions, join our Telegram channel: [@NoDrops](https://t.me/NoDrops)

## Features

- 🔐 **Wallet Authentication** - Ethereum wallet-based authentication with SIWE
- 🎯 **Task Automation** - Auto-complete daily tasks, faucet claims, and badge minting
- 💰 **Transaction Automation** - Automated DACC transactions between wallets
- 🔥 **Onchain Operations** - DACC burn for QE and staking support
- 📦 **Quantum Crates** - Automated crate opening (configurable)
- 👥 **Multi-Account** - Process multiple accounts with pool-based concurrency
- 🔄 **Proxy Support** - HTTP, HTTPS, SOCKS4, and SOCKS5 proxies with rotation
- 🛡️ **Smart Proxy Management** - Gradual blocking, failure tracking, and automatic fallback
- 📊 **TUI Dashboard** - Real-time monitoring with cached data display and proxy statistics
- ⏱️ **Smart Delays** - Random delays between accounts to avoid rate limiting
- 🔁 **Loop Mode** - Schedule automatic reruns every 8 hours
- 💾 **Session Caching** - Stores session tokens to skip re-authentication
- 🔄 **Auto-Retry** - Intelligent retry with Circuit Breaker protection
- 📈 **Real-time Balance Tracking** - Monitors blockchain DACC balance throughout execution

## Requirements

- **[DAChain Account](https://inception.dachain.io?ref=DAC541493)** - Register and connect wallet
- **Node.js** v18 or higher
- **npm** (Node Package Manager)
- **Private Keys** - Ethereum wallet private keys
- **Proxies** (Optional but recommended for multiple accounts)

## Quick Start

### 1. Interactive Setup (Recommended)

Run the interactive setup wizard - it will automatically install dependencies if needed:

```bash
npm run setup
```

The setup wizard will:
- ✅ Auto-install dependencies if `node_modules` is missing
- 📝 Prompt for private keys (comma or space separated)
- 🌐 Prompt for proxies (optional, comma or space separated)
- 📁 Create `.env` and `proxies.txt` files

**Example:**
```
$ npm run setup

⚠️  Dependencies not found. Installing...
✅ Dependencies installed successfully!

╔════════════════════════════════════════╗
║     DAChain Bot Setup Wizard          ║
╚════════════════════════════════════════╝

? 📝 Enter private keys (comma or space separated): 
  0xabc..., 0xdef..., 0x123...

? 🌐 Enter proxies (comma or space separated, optional): 
  http://user:pass@proxy1.com:8080, socks5://user:pass@proxy2.com:1080

📁 Files created:
   ✅ .env (3 private keys)
   ✅ proxies.txt (2 proxies)

✅ Setup complete! Run: npm start
```

### 2. Manual Configuration (Alternative)

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

### 3. Run the Bot

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

### Error Handling & Resilience

**Circuit Breakers** - All services protected with circuit breakers:
- Opens after 5 consecutive failures
- Prevents cascading failures and API hammering
- Auto-resets after 60 seconds

**Smart Retry Logic**:
- Exponential backoff with jitter
- Error-type-specific retry limits
- Session expiry triggers automatic re-authentication
- RPC errors handled gracefully (no crashes)

**Data Persistence**:
- Atomic writes with mutex locking (no race conditions)
- Temp file + rename pattern (no corruption)
- Write errors propagated (no silent failures)
- Concurrent account processing safe

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

### Configuration Options

#### Core Settings
- `debug` - Enable verbose logging for debugging
- `enableLoop` - Run continuously with automatic reruns
- `loopDelayMinutes` - Time between cycles (default: 480 = 8 hours)

#### Retry Settings
- `maxProxyRetries` - Max proxy rotation attempts per account
- `maxApiRetries` - Max API retry attempts for transient errors

#### Fallback Settings
- `noProxyOnExhausted` - Use direct connection when all proxies blocked (not recommended)

#### Delay Settings (in seconds)
- `betweenAccountsMin/Max` - Random delay between account processing
- `afterTaskComplete` - Delay after completing a task
- `afterError` - Delay after encountering an error
- `betweenRequestsMin/Max` - Random delay between API requests

#### Transaction Settings
- `enabled` - Enable automated transactions
- `dailyMin/Max` - Number of transactions per account per run
- `amountMin/Max` - Transaction amount range in DACC
- `minBalanceThreshold` - Minimum balance required to send transactions
- `delayBetweenTxMin/Max` - Delay between transactions in seconds

#### Onchain Settings
- `burnEnabled` - Enable one-time DACC burn for QE rewards
- `stakeEnabled` - Enable one-time DACC staking
- `stakeAmountMin/Max` - Stake amount range in DACC

#### Quantum Crates Settings
- `enabled` - Enable automated crate opening (default: false)
- `maxOpensPerRun` - Maximum crates to open per run (max: 5 per API limit)

**Configuration Notes:**
- Time values use **human-readable units** (minutes and seconds)
- `loopDelayMinutes: 480` = 8 hours
- Delays are automatically converted to milliseconds internally
- Random delays help avoid rate limiting and detection
- **Config fallback**: Bot uses default values if `config.js` is missing
- **All config sections required**: Missing sections will cause errors

## Data Storage

| Path | Purpose |
|------|---------|
| `.env` | Private keys (PK_N) |
| `proxies.txt` | Proxy list |
| `logs/process.log` | Activity logs with timestamps |
| `data/data.json` | Cached sessions and account state |

**Security Notes:**
- ✅ Private keys stored ONLY in `.env` (gitignored)
- ✅ Private keys NEVER logged or transmitted
- ✅ All network requests go to `inception.dachain.io` only
- ✅ Session tokens stored locally in `data/data.json`
- ⚠️ Protect `.env` and `data/data.json` - never commit to git

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
| Loop mode not working | Check `config.js` has `enableLoop: true` and all config sections present |
| NaN in TUI display | Update to latest version with NaN fixes |
| Profile data lost after retry | Update to latest version with retry checkpoint fixes |

### Common Error Messages

**"Cannot read properties of undefined (reading 'minBalanceThreshold')"**
- Missing `transactions` section in config.js
- Solution: Ensure config.js includes all sections from the template

**"Cannot read properties of undefined (reading 'burnEnabled')"**
- Missing `onchain` section in config.js
- Solution: Ensure config.js includes all sections from the template

**"server response 504 Gateway Time-out"**
- RPC endpoint temporarily unavailable
- Solution: Bot handles this automatically, will skip blockchain operations

**"Faucet still pending after 15 attempts"**
- Faucet backend processing delay
- Solution: Normal behavior, faucet will be available on next run

**"Insufficient QE for crate opening"**
- Account doesn't have enough QE (need 150 QE minimum)
- Solution: Earn more QE through tasks and faucet claims

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

### Debug Mode

Enable debug logging in `config.js`:

```javascript
debug: true
```

This will show detailed API requests and responses in logs.

## License

[MIT](LICENSE)

## Disclaimer

This bot is for educational purposes only. Use at your own risk. Always ensure you comply with the terms of service of the platforms you interact with.

---

**Made with ❤️ by NoDrops Community**
