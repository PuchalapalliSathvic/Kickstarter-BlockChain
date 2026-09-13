import { useEffect, useState } from "react";
import Icon from "./Icon";

function shortAddress(address) {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
}

export default function WalletButton() {
  const [account, setAccount] = useState("");
  const [chain, setChain] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    if (typeof window === "undefined" || !window.ethereum) return;
    const [accounts, chainId] = await Promise.all([
      window.ethereum.request({ method: "eth_accounts" }),
      window.ethereum.request({ method: "eth_chainId" }),
    ]);
    setAccount(accounts?.[0] || "");
    setChain(chainId || "");
  }

  useEffect(() => {
    refresh();
    if (!window.ethereum) return;
    const onAccounts = (accounts) => setAccount(accounts?.[0] || "");
    const onChain = (chainId) => setChain(chainId);
    window.ethereum.on?.("accountsChanged", onAccounts);
    window.ethereum.on?.("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener?.("accountsChanged", onAccounts);
      window.ethereum.removeListener?.("chainChanged", onChain);
    };
  }, []);

  async function connect() {
    if (!window.ethereum) {
      window.alert("Install MetaMask or another Ethereum wallet to continue.");
      return;
    }
    setLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setAccount(accounts?.[0] || "");
      setChain(chainId || "");
    } finally {
      setLoading(false);
    }
  }

  const network = chain === "0x7a69" ? "Local" : chain === "0xaa36a7" ? "Sepolia" : chain ? "Network" : "";

  return (
    <button className={`walletButton ${account ? "connected" : ""}`} onClick={connect} type="button">
      <span className="walletDot" />
      <Icon name="wallet" size={17} />
      <span>{loading ? "Connecting…" : account ? shortAddress(account) : "Connect wallet"}</span>
      {account && network && <span className="networkPill">{network}</span>}
    </button>
  );
}
