import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { isAddress, parseEther } from "ethers";
import Layout from "../../../../components/layout";
import Icon from "../../../../components/Icon";
import { getBrowserSigner, getCampaignContract } from "../../../../lib/contracts";

export default function NewRequest() {
  const router = useRouter();
  const { address } = router.query;
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault(); setLoading(true); setErrorMessage("");
    try {
      if (!isAddress(recipient)) throw new Error("Enter a valid Ethereum recipient address.");
      const signer = await getBrowserSigner();
      const campaign = getCampaignContract(address, signer);
      const tx = await campaign.createRequest(description, parseEther(value), recipient);
      await tx.wait(); await router.push(`/campaigns/${address}/requests`);
    } catch (error) { setErrorMessage(error.shortMessage || error.reason || error.message); }
    finally { setLoading(false); }
  }

  return (
    <Layout title="New spending request — CrowdCoin">
      <section className="pageHero compactPageHero"><div className="shell">{address && <Link href={`/campaigns/${address}/requests`} className="backLink"><Icon name="back" size={17}/> Back to requests</Link>}<div className="pageHeroCopy"><span className="eyebrow">Manager action</span><h1>Create a spending request</h1><p>Propose a payment from the campaign treasury. Contributors will need to approve it before funds can be released.</p></div></div></section>
      <section className="formSection shell"><div className="formLayout"><div className="formCard"><div className="formCardHeader"><div className="formIcon"><Icon name="shield" size={22}/></div><div><h2>Request details</h2><p>Make the purpose of the payment clear to contributors.</p></div></div><form onSubmit={onSubmit} className="modernForm">
        <label><span>Description</span><p className="fieldDescription">Explain what this payment is for.</p><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Pay the manufacturer for the first production run" rows="4" required/></label>
        <label><span>Payment amount</span><div className="inputSuffixWrap"><input value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.10" inputMode="decimal" required/><span className="inputSuffix">ETH</span></div></label>
        <label><span>Recipient wallet</span><p className="fieldDescription">The Ethereum address that will receive the funds if approved.</p><input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x…" required/></label>
        {errorMessage && <div className="alert error"><strong>Transaction failed</strong><span>{errorMessage}</span></div>}
        <div className="formActions"><button className="primaryButton" disabled={loading} type="submit">{loading ? <span className="spinner"/> : <Icon name="plus" size={18}/>} {loading ? "Creating request…" : "Create request"}</button>{address && <Link href={`/campaigns/${address}/requests`} className="secondaryButton">Cancel</Link>}</div>
      </form></div><aside className="formAside"><div className="asideCard accentCard"><span className="eyebrow">Approval rule</span><h3>A majority of contributors must approve.</h3><p>Once more than 50% of approvers vote yes, the manager can finalize the request and release payment.</p></div><div className="asideCard"><div className="asideSmallIcon"><Icon name="check" size={20}/></div><h4>Verify the recipient</h4><p>Blockchain transfers are irreversible. Double-check the wallet address before submitting.</p></div></aside></div></section>
    </Layout>
  );
}
