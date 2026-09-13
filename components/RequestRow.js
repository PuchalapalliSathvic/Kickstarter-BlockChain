import { useState } from "react";
import { useRouter } from "next/router";
import { formatEther } from "ethers";
import Icon from "./Icon";
import Address from "./Address";
import { getBrowserSigner, getCampaignContract } from "../lib/contracts";

export default function RequestRow({ id, request, address, approversCount }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState("");
  const readyToFinalize = BigInt(request.approvalCount) > BigInt(approversCount) / 2n;
  const approvalPercent = Number(approversCount) ? Math.min(100, Math.round((Number(request.approvalCount) / Number(approversCount)) * 100)) : 0;

  async function runTransaction(method) {
    setLoadingAction(method);
    try {
      const signer = await getBrowserSigner();
      const campaign = getCampaignContract(address, signer);
      const tx = await campaign[method](id);
      await tx.wait();
      router.replace(router.asPath);
    } catch (error) {
      window.alert(error.shortMessage || error.reason || error.message);
    } finally {
      setLoadingAction("");
    }
  }

  return (
    <tr className={request.complete ? "requestComplete" : ""}>
      <td><span className="requestId">#{String(id + 1).padStart(2, "0")}</span></td>
      <td><div className="requestDescription">{request.description}</div><div className="mobileMeta">{formatEther(request.value)} ETH</div></td>
      <td className="desktopCell"><strong>{formatEther(request.value)} ETH</strong></td>
      <td className="desktopCell"><Address value={request.recipient} /></td>
      <td>
        <div className="approvalCell">
          <span>{request.approvalCount}/{approversCount}</span>
          <div className="miniProgress"><span style={{ width: `${approvalPercent}%` }} /></div>
        </div>
      </td>
      <td>
        {request.complete ? (
          <span className="statusBadge success"><Icon name="check" size={14} /> Paid</span>
        ) : (
          <div className="requestActions">
            <button className="smallButton ghost" disabled={Boolean(loadingAction)} onClick={() => runTransaction("approveRequest")}>
              {loadingAction === "approveRequest" ? "Approving…" : "Approve"}
            </button>
            <button className="smallButton primary" disabled={!readyToFinalize || Boolean(loadingAction)} onClick={() => runTransaction("finalizeRequest")}>
              {loadingAction === "finalizeRequest" ? "Finalizing…" : "Finalize"}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
