# Crowd Coin — Modernized Ethereum Crowdfunding dApp

This is an updated version of the original Kickstarter-on-Ethereum project. The legacy Rinkeby, Web3.js, `next-routes`, `ganache-cli`, `solc@0.4`, and hard-coded wallet mnemonic setup have been removed.

## Stack

- Next.js 14 + React 18
- ethers v6
- Hardhat
- Solidity 0.8.24
- MetaMask or another injected browser wallet
- Local Hardhat network or Sepolia
- Semantic UI React

## Requirements

- Node.js 18.18+ (Node 20 LTS recommended)
- npm
- MetaMask for browser transactions

## Install

```bash
npm install
```

## Fastest way to run locally

Open **three terminals** in this project folder.

### Terminal 1 — start a local Ethereum network

```bash
npm run node
```

Keep this running. Hardhat prints funded local test accounts and private keys.

### Terminal 2 — deploy the factory contract

```bash
npm run deploy:local
```

This compiles the contracts, deploys `CampaignFactory`, and automatically writes `.env.local` containing the local RPC URL and deployed factory address.

### Configure MetaMask for the local network

Add a custom network:

- Network name: Hardhat Local
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency symbol: ETH

Import one of the private keys printed by `npm run node`. These keys are public development keys. **Never use them for real funds.**

### Terminal 3 — start Next.js

```bash
npm run dev
```

Open http://localhost:3000.

## Run tests

```bash
npm test
```

## Deploy to Sepolia

1. Copy `.env.example` to `.env.local`.
2. Set `SEPOLIA_RPC_URL` to your Alchemy/Infura Sepolia RPC endpoint.
3. Set `DEPLOYER_PRIVATE_KEY` to a dedicated test-wallet private key that has Sepolia ETH.
4. Set `NEXT_PUBLIC_RPC_URL` to the same Sepolia RPC endpoint.
5. Run:

```bash
npm run deploy:sepolia
```

The deploy script updates `.env.local` with the new factory address. Restart `npm run dev` after deployment.

> Use a dedicated test wallet. Do not use the mnemonic/private key from the original repository; it was committed in source code and must be considered compromised.

## Main changes from the original project

- Rinkeby -> local Hardhat / Sepolia
- Solidity 0.4.17 -> Solidity 0.8.24
- Web3.js -> ethers v6
- `ganache-cli` -> Hardhat network
- `truffle-hdwallet-provider` -> Hardhat/ethers deployment
- custom `next-routes` server -> native Next.js dynamic routes
- hard-coded blockchain secrets -> environment variables
- modern Solidity constructors, payable handling, events, revert messages and safe external transfer pattern
- modern automated tests

## Project structure

```text
components/                  Shared React UI
contracts/Campaign.sol       CampaignFactory + Campaign contracts
lib/contracts.js             ethers providers, ABI and contract helpers
pages/                       Next.js frontend routes
scripts/deploy.js            Hardhat deployment script
test/Campaign.test.js        Hardhat test suite
hardhat.config.js            Solidity/network configuration
.env.example                 Environment template
```


## UI refresh

This version includes a custom responsive interface (no Semantic UI dependency), wallet/network status, campaign dashboards, polished empty states, and mobile layouts.
