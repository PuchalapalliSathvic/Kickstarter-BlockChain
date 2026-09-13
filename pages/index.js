import Link from "next/link";
import { formatEther } from "ethers";
import Layout from "../components/layout";
import Icon from "../components/Icon";
import Address from "../components/Address";
import { getCampaignContract, getFactoryContract } from "../lib/contracts";

export async function getServerSideProps() {
  try {
    const factory = getFactoryContract();
    const addresses = await factory.getDeployedCampaigns();
    const campaigns = await Promise.all(addresses.map(async (address) => {
      try {
        const summary = await getCampaignContract(address).getSummary();
        return {
          address,
          minimumContribution: summary[0].toString(),
          balance: summary[1].toString(),
          requestsCount: summary[2].toString(),
          approversCount: summary[3].toString(),
          manager: summary[4],
        };
      } catch {
        return { address, minimumContribution: "0", balance: "0", requestsCount: "0", approversCount: "0", manager: "" };
      }
    }));
    return { props: { campaigns } };
  } catch (error) {
    return { props: { campaigns: [], loadError: error.message } };
  }
}

export default function CampaignIndex({ campaigns, loadError }) {
  const totalEth = campaigns.reduce((sum, item) => sum + Number(formatEther(item.balance || "0")), 0);
  const totalBackers = campaigns.reduce((sum, item) => sum + Number(item.approversCount || 0), 0);

  return (
    <Layout>
      <section className="hero">
        <div className="heroGlow heroGlowOne" />
        <div className="heroGlow heroGlowTwo" />
        <div className="shell heroGrid">
          <div className="heroCopy">
            <div className="eyebrowTag"><Icon name="spark" size={16} /> Crowdfunding, rebuilt on-chain</div>
            <h1>Back bold ideas.<br/><span>See where every coin goes.</span></h1>
            <p>CrowdCoin gives creators a transparent way to raise funds while contributors approve how campaign money is spent.</p>
            <div className="heroActions">
              <a href="#campaigns" className="primaryButton">Explore campaigns <Icon name="arrow" size={18} /></a>
              <Link href="/campaigns/new" className="secondaryButton"><Icon name="plus" size={18} /> Start a campaign</Link>
            </div>
            <div className="trustRow">
              <span><Icon name="shield" size={17} /> Smart-contract secured</span>
              <span><Icon name="users" size={17} /> Community governed</span>
            </div>
          </div>
          <div className="heroVisual" aria-hidden="true">
            <div className="orbitalCard mainOrbital">
              <div className="orbitalTop"><span className="chainIcon"><Icon name="ethereum" size={26} /></span><span className="statusBadge live"><span/> LIVE ON-CHAIN</span></div>
              <div className="mockBalance"><small>Campaign treasury</small><strong>{totalEth.toFixed(3)} ETH</strong><span>Verified by Ethereum</span></div>
              <div className="mockBars"><span/><span/><span/><span/><span/></div>
              <div className="mockFooter"><div><small>Campaigns</small><b>{campaigns.length}</b></div><div><small>Contributors</small><b>{totalBackers}</b></div><div><small>Network</small><b>Ethereum</b></div></div>
            </div>
            <div className="floatingCard floatA"><span className="floatIcon"><Icon name="check" size={18} /></span><div><small>Request approved</small><strong>Community consensus</strong></div></div>
            <div className="floatingCard floatB"><span className="floatIcon purple"><Icon name="users" size={18} /></span><div><small>Transparent by design</small><strong>Every vote is on-chain</strong></div></div>
          </div>
        </div>
      </section>

      <section className="statsStrip">
        <div className="shell statsGrid">
          <div><strong>{campaigns.length}</strong><span>Live campaigns</span></div>
          <div><strong>{totalEth.toFixed(3)}</strong><span>ETH in campaign treasuries</span></div>
          <div><strong>{totalBackers}</strong><span>On-chain contributors</span></div>
          <div><strong>100%</strong><span>Transparent transactions</span></div>
        </div>
      </section>

      <section className="section shell" id="campaigns">
        <div className="sectionHeading splitHeading">
          <div><span className="eyebrow">Discover</span><h2>Open campaigns</h2><p>Explore campaigns deployed through the CrowdCoin factory.</p></div>
          <Link href="/campaigns/new" className="secondaryButton compact"><Icon name="plus" size={17} /> Create campaign</Link>
        </div>

        {loadError && <div className="alert warning"><strong>Blockchain connection needs attention.</strong><span>{loadError}</span></div>}

        {!loadError && campaigns.length > 0 && (
          <div className="campaignGrid">
            {campaigns.map((campaign, index) => (
              <Link href={`/campaigns/${campaign.address}`} className="campaignCard" key={campaign.address}>
                <div className={`campaignArt art${(index % 4) + 1}`}>
                  <span className="campaignNumber">0{index + 1}</span>
                  <span className="artCoin"><Icon name="ethereum" size={30} /></span>
                  <span className="onchainBadge"><span/> ON-CHAIN</span>
                </div>
                <div className="campaignBody">
                  <div className="campaignTopline"><span>Campaign</span><Icon name="arrow" size={18} /></div>
                  <h3>{`Community campaign #${index + 1}`}</h3>
                  <div className="campaignAddress"><Address value={campaign.address} copy={false} /></div>
                  <div className="campaignMetrics">
                    <div><strong>{Number(formatEther(campaign.balance)).toFixed(4)}</strong><span>ETH balance</span></div>
                    <div><strong>{campaign.approversCount}</strong><span>Contributors</span></div>
                    <div><strong>{campaign.requestsCount}</strong><span>Requests</span></div>
                  </div>
                  <div className="campaignFooter"><span>Min. {formatEther(campaign.minimumContribution)} ETH</span><span>View details <Icon name="chevron" size={15} /></span></div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loadError && campaigns.length === 0 && (
          <div className="emptyState">
            <div className="emptyVisual"><span/><span/><div><Icon name="spark" size={30} /></div></div>
            <span className="eyebrow">Be the first</span>
            <h3>No campaigns yet — start something worth backing.</h3>
            <p>Your local factory contract is connected and ready. Create the first campaign to see it appear here instantly.</p>
            <Link href="/campaigns/new" className="primaryButton"><Icon name="plus" size={18} /> Create the first campaign</Link>
          </div>
        )}
      </section>

      <section className="howSection">
        <div className="shell">
          <div className="sectionHeading centered"><span className="eyebrow">How it works</span><h2>Trust the code, not a promise.</h2><p>CrowdCoin uses a simple on-chain governance flow for every campaign.</p></div>
          <div className="stepsGrid">
            <div className="stepCard"><span className="stepNumber">01</span><div className="stepIcon"><Icon name="plus" size={23} /></div><h3>Launch</h3><p>Create a campaign with a minimum contribution. The smart contract becomes the treasury.</p></div>
            <div className="stepCard"><span className="stepNumber">02</span><div className="stepIcon"><Icon name="users" size={23} /></div><h3>Contribute</h3><p>Supporters fund the contract directly and become eligible to approve spending requests.</p></div>
            <div className="stepCard"><span className="stepNumber">03</span><div className="stepIcon"><Icon name="shield" size={23} /></div><h3>Approve & release</h3><p>Funds can only be released after a request earns majority approval from contributors.</p></div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
