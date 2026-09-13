import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";

export const factoryAbi = [
  "function createCampaign(uint256 minimum)",
  "function getDeployedCampaigns() view returns (address[])",
];

export const campaignAbi = [
  "function manager() view returns (address)",
  "function minimumContribution() view returns (uint256)",
  "function approversCount() view returns (uint256)",
  "function contribute() payable",
  "function createRequest(string description,uint256 value,address recipient)",
  "function approveRequest(uint256 index)",
  "function finalizeRequest(uint256 index)",
  "function getSummary() view returns (uint256 minimum,uint256 balance,uint256 requestsCount,uint256 contributorsCount,address campaignManager)",
  "function getRequestsCount() view returns (uint256)",
  "function getRequest(uint256 index) view returns (string description,uint256 value,address recipient,bool complete,uint256 approvalCount)",
];

export function getReadProvider() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  if (!rpcUrl) {
    throw new Error("NEXT_PUBLIC_RPC_URL is missing. Copy .env.example to .env.local and add your RPC URL.");
  }
  return new JsonRpcProvider(rpcUrl);
}

export async function getBrowserSigner() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask or another injected Ethereum wallet is required.");
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}

export function getFactoryContract(runner = getReadProvider()) {
  const address = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
  if (!address) {
    throw new Error("NEXT_PUBLIC_FACTORY_ADDRESS is missing. Deploy the factory contract first.");
  }
  return new Contract(address, factoryAbi, runner);
}

export function getCampaignContract(address, runner = getReadProvider()) {
  return new Contract(address, campaignAbi, runner);
}
