import { useState } from "react";
import { useRouter } from "next/router";
import { parseEther } from "ethers";
import Layout from "../../components/layout";
import Icon from "../../components/Icon";
import { getBrowserSigner, getFactoryContract } from "../../lib/contracts";

export default function CampaignNew() {
  const router = useRouter();
  const [minimumContribution, setMinimumContribution] = useState("");
  const [unit, setUnit] = useState("ETH");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const minimumWei = unit === "ETH" ? parseEther(minimumContribution) : BigInt(minimumContribution);
      const signer = await getBrowserSigner();
      const factory = getFactoryContract(signer);
      const tx = await factory.createCampaign(minimumWei);
      await tx.wait();
      await router.push("/");
    } catch (error) {
      setErrorMessage(error.shortMessage || error.reason || error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Create campaign — CrowdCoin">
      <section className="pageHero compactPageHero">
        <div className="shell">
          <a className="backLink" onClick={() => router.push("/")}><Icon name="back" size={17}/> Back to campaigns</a>
          <div className="pageHeroCopy">
            <span className="eyebrow">Launch on-chain</span>
            <h1>Create a campaign</h1>
            <p>Set the minimum amount someone must contribute to become an approver. Your campaign contract is deployed from the CrowdCoin factory.</p>
          </div>
        </div>
      </section>

      <section className="formSection shell">
        <div className="formLayout">
          <div className="formCard">
            <div className="formCardHeader"><div className="formIcon"><Icon name="spark" size={22}/></div><div><h2>Campaign settings</h2><p>One transaction creates your campaign.</p></div></div>
            <form onSubmit={onSubmit} className="modernForm">
              <label>
                <span>Minimum contribution</span>
                <p className="fieldDescription">Contributors must send at least this amount to become an approver.</p>
                <div className="inputSelectWrap">
                  <input
                    value={minimumContribution}
                    onChange={(event) => setMinimumContribution(event.target.value)}
                    inputMode={unit === "ETH" ? "decimal" : "numeric"}
                    placeholder={unit === "ETH" ? "0.01" : "10000000000000000"}
                    required
                  />
                  <select value={unit} onChange={(e) => setUnit(e.target.value)}><option>ETH</option><option>WEI</option></select>
                </div>
              </label>
              <div className="infoBox"><Icon name="shield" size={19}/><div><strong>Non-custodial by default</strong><span>Funds will live in your campaign smart contract, not in CrowdCoin.</span></div></div>
              {errorMessage && <div className="alert error"><strong>Transaction failed</strong><span>{errorMessage}</span></div>}
              <button className="primaryButton fullButton largeButton" disabled={loading} type="submit">
                {loading ? <span className="spinner"/> : <Icon name="plus" size={18}/>} {loading ? "Deploying campaign…" : "Deploy campaign"}
              </button>
            </form>
          </div>

          <aside className="formAside">
            <div className="asideCard accentCard"><span className="eyebrow">What happens next?</span><h3>Your campaign becomes its own smart contract.</h3><div className="asideSteps"><div><span>1</span><p><strong>Deploy</strong>Your wallet creates the campaign.</p></div><div><span>2</span><p><strong>Share</strong>Send supporters the campaign URL.</p></div><div><span>3</span><p><strong>Govern</strong>Contributors vote on spending requests.</p></div></div></div>
            <div className="asideCard"><div className="asideSmallIcon"><Icon name="wallet" size={20}/></div><h4>Wallet required</h4><p>Connect MetaMask to your local Hardhat network or Sepolia before deploying.</p></div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
