# CrowdCoin quick start

Use Node 20 LTS.

## 1. Install dependencies

```bash
npm install
```

## 2. Start the local blockchain

Terminal 1:

```bash
npm run node
```

Leave it running.

## 3. Deploy the contracts

Terminal 2:

```bash
npm run deploy:local
```

The deployment script writes the local RPC URL and factory address to `.env.local`.

## 4. Start the website

Terminal 3:

```bash
npm run dev
```

Open http://localhost:3000.

## 5. Connect MetaMask

Add a network with:

- Network name: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency symbol: ETH

Import one of the development-only private keys printed by `npm run node`. Never use those accounts with real funds.

## If localhost shows an old cached UI

Stop `npm run dev`, then run:

```bash
rm -rf .next
npm run dev
```

This build pins `@opentelemetry/api` to 1.9.0 to avoid the `trace.getSpanContext is not a function` error seen with some dependency resolutions.
