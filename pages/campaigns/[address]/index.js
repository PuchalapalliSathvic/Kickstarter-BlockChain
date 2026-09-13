import Link from "next/link";
import { formatEther } from "ethers";
import Layout from "../../../components/layout";
import ContributeForm from "../../../components/contributeForm";
import Icon from "../../../components/Icon";
import Address from "../../../components/Address";
import { getCampaignContract } from "../../../lib/contracts";

export async function getServerSideProps({ params }) {
  try {
    const campaign = getCampaignContract(params.address);
    const summary = await campaign.getSummary();
    return { props: {
      address: params.address,
      minimumContribution: summary[0].toString(),
      balance: summary[1].toString(),
      requestsCount: summary[2].toString(),
      approversCount: summary[3].toString(),
      manager: summary[4],
    }};
  } catch (error) {
    return { props: { address: params.address, loadError: error.message } };
  }
}

export default function CampaignShow(props) {
  if (props.loadError) return <Layout><section className="section shell"><div className="alert error"><strong>Could not load campaign</strong><span>{props.loadError}</span></div></section></Layout>;
  const balanceEth = formatEther(props.balance);
  const minEth = formatEther(props.minimumContribution);

  return (
    <Layout title="Campaign — CrowdCoin">
      <section className="detailHero">
        <div className="detailGlow" />
        <div className="shell">
          <Link href="/" className="backLink light"><Icon name="back" size={17}/> All campaigns</Link>
          <div className="detailHeroGrid">
            <div>
              <div className="detailBadges"><span className="statusBadge live"><span/> LIVE CAMPAIGN</span><span className="networkBadge">Ethereum</span></div>
              <h1>Community campaign</h1>
              <p className="detailLead">A transparent crowdfunding contract where contributors participate in how raised funds are spent.</p>
              <div className="managerLine"><span>Managed by</span><Address value={props.manager}/></div>
            </div>
            <div className="treasuryCard">
              <span>Campaign treasury</span>
              <strong>{Number(balanceEth).toFixed(4)} <small>ETH</small></strong>
              <div className="treasuryMeta"><span><Icon name="users" size={17}/>{props.approversCount} contributors</span><span><Icon name="clock" size={17}/>{props.requestsCount} requests</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell detailSection">
        <div className="detailLayout">
          <div className="detailMain">
            <div className="metricGrid">
              <div className="metricCard"><span className="metricIcon"><Icon name="ethereum" size={21}/></span><div><small>Current balance</small><strong>{Number(balanceEth).toFixed(4)} ETH</strong><p>Held by the campaign contract</p></div></div>
              <div className="metricCard"><span className="metricIcon"><Icon name="users" size={21}/></span><div><small>Contributors</small><strong>{props.approversCount}</strong><p>Eligible on-chain approvers</p></div></div>
              <div className="metricCard"><span className="metricIcon"><Icon name="shield" size={21}/></span><div><small>Spending requests</small><strong>{props.requestsCount}</strong><p>Created by the manager</p></div></div>
              <div className="metricCard"><span className="metricIcon"><Icon name="bolt" size={21}/></span><div><small>Minimum contribution</small><strong>{minEth} ETH</strong><p>Required to become an approver</p></div></div>
            </div>

            <div className="contentCard governanceCard">
              <div className="contentCardHeader"><div><span className="eyebrow">Governance</span><h2>Contributor-controlled spending</h2></div><Link href={`/campaigns/${props.address}/requests`} className="secondaryButton compact">View requests <Icon name="arrow" size={17}/></Link></div>
              <p>The campaign manager proposes spending requests. Contributors approve them on-chain, and a request can only be finalized after it reaches majority support.</p>
              <div className="governanceFlow"><div><span>1</span><strong>Manager proposes</strong><small>Recipient + amount</small></div><i/><div><span>2</span><strong>Contributors vote</strong><small>One approver, one vote</small></div><i/><div><span>3</span><strong>Funds release</strong><small>After majority approval</small></div></div>
            </div>

            <div className="contractCard"><div><span className="eyebrow">Smart contract</span><h3>Campaign address</h3></div><Address value={props.address} label={props.address}/></div>
          </div>
          <aside className="detailAside"><ContributeForm address={props.address} minimumEth={minEth}/><div className="asideCard safetyCard"><div className="asideSmallIcon"><Icon name="shield" size={20}/></div><h4>Know what you’re signing</h4><p>Your wallet will show the transaction before anything is submitted. Only use test ETH on local or Sepolia networks.</p></div></aside>
        </div>
      </section>
    </Layout>
  );
}
