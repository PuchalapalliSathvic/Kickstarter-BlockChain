import { useState } from "react";
import { useRouter } from "next/router";
import { parseEther } from "ethers";
import Icon from "./Icon";
import { getBrowserSigner, getCampaignContract } from "../lib/contracts";

export default function ContributeForm({ address, minimumEth }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const signer = await getBrowserSigner();
      const campaign = getCampaignContract(address, signer);
      const tx = await campaign.contribute({ value: parseEther(value) });
      await tx.wait();
      setValue("");
      router.replace(router.asPath);
    } catch (error) {
      setErrorMessage(error.shortMessage || error.reason || error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fundPanel">
      <div className="fundPanelHead">
        <span className="eyebrow">Support this campaign</span>
        <h2>Make a contribution</h2>
        <p>Your ETH goes directly to the campaign smart contract.</p>
      </div>
      <form onSubmit={onSubmit} className="modernForm compactForm">
        <label>
          <span>Contribution amount</span>
          <div className="inputSuffixWrap">
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={minimumEth && minimumEth !== "0.0" ? minimumEth : "0.05"}
              inputMode="decimal"
              required
            />
            <span className="inputSuffix">ETH</span>
          </div>
        </label>
        {minimumEth && <p className="formHint">Minimum: {minimumEth} ETH</p>}
        {errorMessage && <div className="alert error">{errorMessage}</div>}
        <button className="primaryButton fullButton" disabled={loading} type="submit">
          {loading ? <span className="spinner" /> : <Icon name="bolt" size={18} />}
          {loading ? "Waiting for confirmation…" : "Fund this campaign"}
        </button>
        <div className="secureNote"><Icon name="shield" size={16} /> Transaction secured by your connected wallet</div>
      </form>
    </div>
  );
}
