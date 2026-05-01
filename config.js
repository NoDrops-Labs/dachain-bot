export default {
  debug: false,            // Enable verbose logging for debugging (shows API requests/responses)
  enableLoop: true,        // Run continuously with automatic reruns (false = run once and exit)
  loopDelayMinutes: 480,   // Time between cycles in minutes (480 = 8 hours)
  
  retry: {
    maxProxyRetries: 3,    // Max proxy rotation attempts per account before giving up
    maxApiRetries: 2,      // Max API retry attempts for transient errors (503, 429, etc.)
  },
  
  fallback: {
    noProxyOnExhausted: false, // Use direct connection when all proxies blocked (not recommended for multiple accounts)
  },
  
  delays: {
    betweenAccountsMin: 3,    // Min delay between starting accounts (seconds) - helps avoid rate limiting
    betweenAccountsMax: 10,   // Max delay between starting accounts (seconds) - randomized for natural behavior
    afterTaskComplete: 1.5,   // Delay after completing each task (seconds)
    afterError: 5,            // Delay after encountering an error (seconds) - gives API time to recover
    betweenRequestsMin: 1.2,  // Min delay between API requests (seconds) - prevents hammering
    betweenRequestsMax: 4.5,  // Max delay between API requests (seconds) - randomized for natural behavior
  },

  transactions: {
    enabled: true,            // Enable automated DACC transactions between wallets
    dailyMin: 3,              // Minimum transactions per account per run
    dailyMax: 5,              // Maximum transactions per account per run (randomized)
    amountMin: 0.01,          // Minimum transaction amount in DACC
    amountMax: 0.05,          // Maximum transaction amount in DACC (randomized)
    minBalanceThreshold: 0.35, // Minimum DACC balance required to send transactions (reserves gas)
    delayBetweenTxMin: 2,     // Min delay between transactions (seconds)
    delayBetweenTxMax: 8,     // Max delay between transactions (seconds) - randomized
  },

  onchain: {
    burnEnabled: true,        // Enable one-time DACC burn for QE rewards (burns small amount for points)
    stakeEnabled: true,       // Enable one-time DACC staking (locks DACC for rewards)
    stakeAmountMin: 0.1,      // Minimum DACC to stake (randomized between min/max)
    stakeAmountMax: 1.0,      // Maximum DACC to stake (adjust based on your balance)
  },

  quantumCrates: {
    enabled: false,           // Enable automated quantum crate opening (requires 150 QE per crate)
    maxOpensPerRun: 5,        // Max crates to open per account per run (API limit: 5)
  },
};
