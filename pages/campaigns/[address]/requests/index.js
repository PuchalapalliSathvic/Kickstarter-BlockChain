import Link from "next/link";
import Layout from "../../../../components/layout";
import RequestRow from "../../../../components/RequestRow";
import Icon from "../../../../components/Icon";
import Address from "../../../../components/Address";
import { getCampaignContract } from "../../../../lib/contracts";

export async function getServerSideProps({ params }) {
  try {
    const campaign = getCampaignContract(params.address);
    const [requestCount, approversCount] = await Promise.all([campaign.getRequestsCount(), campaign.approversCount()]);
    const requests = await Promise.all(Array.from({ length: Number(requestCount) }, async (_, index) => {
      const request = await campaign.getRequest(index);
      return { description: request[0], value: request[1].toString(), recipient: request[2], complete: request[3], approvalCount: request[4].toString() };
    }));
    return { props: { address: params.address, requests, requestCount: requestCount.toString(), approversCount: approversCount.toString() } };
  } catch (error) {
    return { props: { address: params.address, requests: [], loadError: error.message } };
  }
}

export default function RequestIndex({ address, requests, requestCount, approversCount, loadError }) {
  const completed = requests.filter((r) => r.complete).length;
  return (
    <Layout title="Spending requests — CrowdCoin">
      <section className="pageHero requestsHero"><div className="shell"><Link href={`/campaigns/${address}`} className="backLink"><Icon name="back" size={17}/> Campaign overview</Link><div className="requestHeroRow"><div><span className="eyebrow">Governance dashboard</span><h1>Spending requests</h1><p>Review, approve, and finalize how campaign funds are used.</p></div><Link href={`/campaigns/${address}/requests/new`} className="primaryButton"><Icon name="plus" size={18}/> New request</Link></div></div></section>
      <section className="section shell requestSection">
        <div className="requestSummary"><div><strong>{requestCount || "0"}</strong><span>Total requests</span></div><div><strong>{approversCount || "0"}</strong><span>Eligible approvers</span></div><div><strong>{completed}</strong><span>Finalized</span></div><div className="summaryAddress"><span>Campaign</span><Address value={address}/></div></div>
        {loadError ? <div className="alert error"><strong>Could not load requests</strong><span>{loadError}</span></div> : requests.length ? (
          <div className="tableCard"><div className="tableScroll"><table className="requestsTable"><thead><tr><th>ID</th><th>Description</th><th className="desktopCell">Amount</th><th className="desktopCell">Recipient</th><th>Approvals</th><th>Action</th></tr></thead><tbody>{requests.map((request, index) => <RequestRow key={index} id={index} request={request} address={address} approversCount={approversCount}/>)}</tbody></table></div></div>
        ) : (
          <div className="emptyState compactEmpty"><div className="emptyVisual"><span/><span/><div><Icon name="shield" size={30}/></div></div><h3>No spending requests yet.</h3><p>The campaign manager can create a request when funds need to be paid to a recipient.</p><Link href={`/campaigns/${address}/requests/new`} className="primaryButton"><Icon name="plus" size={18}/> Create first request</Link></div>
        )}
      </section>
    </Layout>
  );
}
