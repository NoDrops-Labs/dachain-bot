import { pathToFileURL } from 'node:url';

let dotenvLoaded = false;
async function loadDotenv() {
  if (dotenvLoaded) return;
  try {
    await import('dotenv/config');
    dotenvLoaded = true;
  } catch (error) {
    // dotenv not available, continue without it
  }
}

export function parseCliArgs(args = process.argv.slice(2)) {
  const flags = new Map([
    ['--setup', 'setup'],
    ['--check-config', 'check-config'],
    ['--check-data', 'check-data'],
    ['--check-log', 'check-log'],
    ['--clear-log', 'clear-log'],
    ['--clear-data', 'clear-data'],
    ['--help', 'help'],
  ]);

  const first = args[0];
  return { command: flags.get(first) ?? 'start' };
}

export function isDirectExecution(metaUrl = import.meta.url, argvPath = process.argv[1]) {
  return Boolean(argvPath) && metaUrl === pathToFileURL(argvPath).href;
}

function getUsage() {
  return `Usage: node index.js [--setup|--check-config|--check-data|--check-log|--clear-log|--clear-data|--help]`;
}

export async function main(args = process.argv.slice(2), overrides = {}) {
  const { command } = parseCliArgs(args);
  
  if (command === 'help') {
    console.log(getUsage());
    return 'help';
  }

  const { loadAccounts, clearAccounts } = await import('./src/utils/helper.js');
  const { checkLog, clearLog } = await import('./src/utils/logger.js');

  if (command === 'check-config') {
    const config = await import('./config.js');
    console.log(JSON.stringify(config.default, null, 2));
    return 'check-config';
  }
  
  if (command === 'check-data') {
    const accounts = await loadAccounts();
    const addresses = Object.keys(accounts);
    
    if (addresses.length === 0) {
      console.log('No account data found');
      return 'check-data';
    }
    
    console.log(`\nAccount Data Summary (${addresses.length} accounts):\n`);
    console.log('-'.repeat(100));
    console.log('Address'.padEnd(45) + 'Points'.padEnd(15) + 'Status'.padEnd(15) + 'Last Updated');
    console.log('-'.repeat(100));
    
    for (const addr of addresses) {
      const data = accounts[addr];
      const points = (data.qeBalance || '0').toString().padEnd(15);
      const status = (data.status || 'unknown').padEnd(15);
      const lastUpdated = data.profile?.earned_at ? new Date(data.profile.earned_at).toLocaleString() : 'Never';
      
      console.log(`${addr.padEnd(45)}${points}${status}${lastUpdated}`);
    }
    
    console.log('-'.repeat(100));
    return 'check-data';
  }
  
  if (command === 'check-log') {
    const hasEntries = await checkLog();
    console.log(hasEntries ? 'Log has entries.' : 'Log is empty or missing.');
    return 'check-log';
  }
  
  if (command === 'clear-log') {
    await clearLog();
    console.log('Log cleared.');
    return 'clear-log';
  }
  
  if (command === 'clear-data') {
    await clearAccounts();
    console.log('Data cleared.');
    return 'clear-data';
  }

  if (command === 'setup') {
    // Check if node_modules exists
    const fs = await import('node:fs');
    const path = await import('node:path');
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('⚠️  Dependencies not found. Installing...\n');
      const { execSync } = await import('node:child_process');
      try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('\n✅ Dependencies installed successfully!\n');
      } catch (error) {
        console.error('❌ Failed to install dependencies. Please run: npm install');
        process.exit(1);
      }
    }
    
    const { runSetup } = await import('./src/utils/setup.js');
    await runSetup(process.cwd());
    console.log('\n✅ Setup complete! Run: npm start');
    return 'setup';
  }

  await loadDotenv();
  
  // Load config with fallback to defaults
  let config;
  try {
    const configModule = await import('./config.js');
    const rawConfig = configModule.default;
    config = {
      debug: rawConfig.debug,
      enableLoop: rawConfig.enableLoop,
      loopDelay: rawConfig.loopDelayMinutes * 60 * 1000,
      retry: rawConfig.retry,
      fallback: rawConfig.fallback,
      delays: {
        betweenAccounts: rawConfig.delays.betweenAccountsMin * 1000,
        betweenAccountsMax: rawConfig.delays.betweenAccountsMax * 1000,
        afterTaskComplete: rawConfig.delays.afterTaskComplete * 1000,
        afterError: rawConfig.delays.afterError * 1000,
        betweenHumanRequests: rawConfig.delays.betweenRequestsMin * 1000,
        betweenHumanRequestsMax: rawConfig.delays.betweenRequestsMax * 1000,
      },
      transactions: rawConfig.transactions,
      onchain: rawConfig.onchain,
      quantumCrates: rawConfig.quantumCrates,
    };
  } catch (error) {
    console.warn('⚠️  config.js not found, using default configuration');
    config = {
      debug: false,
      enableLoop: true,
      loopDelay: 28800000,
      retry: { maxProxyRetries: 3, maxApiRetries: 2 },
      fallback: { noProxyOnExhausted: false },
      delays: {
        betweenAccounts: 3000,
        betweenAccountsMax: 10000,
        afterTaskComplete: 1500,
        afterError: 5000,
        betweenHumanRequests: 1200,
        betweenHumanRequestsMax: 4500,
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
        minGasBuffer: 0.01,
      },
      quantumCrates: {
        enabled: false,
        maxOpensPerRun: 5,
      },
    };
  }
  
  const { runBot } = await import('./src/app.js');
  const { ProxyPool, loadPrivateKeysFromEnv, loadProxiesFromFile } = await import('./src/utils/helper.js');
  
  const deps = { config, runBot, ProxyPool, clearAccounts, loadAccounts, loadPrivateKeysFromEnv, loadProxiesFromFile, checkLog, clearLog, ...overrides };
  
  const privateKeys = deps.loadPrivateKeysFromEnv();
  if (!privateKeys.length) throw new Error('No private key values found in PK_N environment variables.');
  const proxies = await deps.loadProxiesFromFile();
  const proxyPool = new deps.ProxyPool(proxies);
  
  let runCount = 0;
  while (true) {
    runCount++;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Run #${runCount} - ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));
    
    const result = await deps.runBot(privateKeys, proxyPool, { dependencies: deps });
    
    if (result && result.dashboard) {
      if (result.dashboard.renderTimeout) {
        clearTimeout(result.dashboard.renderTimeout);
      }
      if (result.dashboard._loopTimer) {
        clearInterval(result.dashboard._loopTimer);
      }
    }
    
    console.log(`\nLoop mode: ${config.enableLoop ? 'ENABLED' : 'DISABLED'}`);
    console.log(`Loop delay: ${config.loopDelay}ms (${Math.floor(config.loopDelay / 3600000)}h ${Math.floor((config.loopDelay % 3600000) / 60000)}m)`);
    
    if (!config.enableLoop) {
      console.log('\nLoop mode disabled. Exiting...');
      break;
    }
    
    const delayMs = config.loopDelay;
    const delayHours = Math.floor(delayMs / 3600000);
    const delayMinutes = Math.floor((delayMs % 3600000) / 60000);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Run #${runCount} completed. Next run in ${delayHours}h ${delayMinutes}m`);
    console.log(`Next run at: ${new Date(Date.now() + delayMs).toLocaleString()}`);
    console.log('='.repeat(60));
    console.log('Press Ctrl+C to stop\n');
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  return 'start';
}

if (isDirectExecution()) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error?.message ?? String(error));
      process.exit(1);
    });
}

export default { parseCliArgs, main };
