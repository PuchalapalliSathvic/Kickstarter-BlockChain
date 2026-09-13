// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CampaignFactory {
    address[] private deployedCampaigns;

    event CampaignCreated(address indexed campaign, address indexed manager, uint256 minimumContribution);

    function createCampaign(uint256 minimum) external {
        Campaign newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(address(newCampaign));
        emit CampaignCreated(address(newCampaign), msg.sender, minimum);
    }

    function getDeployedCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint256 value;
        address payable recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    Request[] private requests;
    address public immutable manager;
    uint256 public immutable minimumContribution;
    mapping(address => bool) public approvers;
    uint256 public approversCount;

    event ContributionReceived(address indexed contributor, uint256 value);
    event RequestCreated(uint256 indexed requestId, string description, uint256 value, address indexed recipient);
    event RequestApproved(uint256 indexed requestId, address indexed approver);
    event RequestFinalized(uint256 indexed requestId, address indexed recipient, uint256 value);

    modifier restricted() {
        require(msg.sender == manager, "Only the campaign manager can do this");
        _;
    }

    constructor(uint256 minimum, address creator) {
        require(creator != address(0), "Invalid manager");
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() external payable {
        require(msg.value >= minimumContribution, "Contribution is below the minimum");

        if (!approvers[msg.sender]) {
            approvers[msg.sender] = true;
            approversCount += 1;
        }

        emit ContributionReceived(msg.sender, msg.value);
    }

    function createRequest(
        string calldata description,
        uint256 value,
        address payable recipient
    ) external restricted {
        require(recipient != address(0), "Invalid recipient");
        require(value <= address(this).balance, "Request exceeds campaign balance");

        requests.push();
        Request storage newRequest = requests[requests.length - 1];
        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = recipient;

        emit RequestCreated(requests.length - 1, description, value, recipient);
    }

    function approveRequest(uint256 index) external {
        require(index < requests.length, "Request does not exist");
        Request storage request = requests[index];

        require(approvers[msg.sender], "Only contributors can approve");
        require(!request.approvals[msg.sender], "Request already approved");
        require(!request.complete, "Request already finalized");

        request.approvals[msg.sender] = true;
        request.approvalCount += 1;

        emit RequestApproved(index, msg.sender);
    }

    function finalizeRequest(uint256 index) external restricted {
        require(index < requests.length, "Request does not exist");
        Request storage request = requests[index];

        require(!request.complete, "Request already finalized");
        require(request.approvalCount > approversCount / 2, "Not enough approvals");
        require(request.value <= address(this).balance, "Insufficient campaign balance");

        request.complete = true;
        (bool success, ) = request.recipient.call{value: request.value}("");
        require(success, "ETH transfer failed");

        emit RequestFinalized(index, request.recipient, request.value);
    }

    function getSummary()
        external
        view
        returns (
            uint256 minimum,
            uint256 balance,
            uint256 requestsCount,
            uint256 contributorsCount,
            address campaignManager
        )
    {
        return (
            minimumContribution,
            address(this).balance,
            requests.length,
            approversCount,
            manager
        );
    }

    function getRequestsCount() external view returns (uint256) {
        return requests.length;
    }

    function getRequest(uint256 index)
        external
        view
        returns (
            string memory description,
            uint256 value,
            address recipient,
            bool complete,
            uint256 approvalCount
        )
    {
        require(index < requests.length, "Request does not exist");
        Request storage request = requests[index];
        return (
            request.description,
            request.value,
            request.recipient,
            request.complete,
            request.approvalCount
        );
    }
}
