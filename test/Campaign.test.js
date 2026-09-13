const { expect } = require("chai");
const { ethers } = require("hardhat");

async function deployFixture() {
  const [manager, contributor, recipient] = await ethers.getSigners();
  const Factory = await ethers.getContractFactory("CampaignFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  await (await factory.createCampaign(1000)).wait();
  const [campaignAddress] = await factory.getDeployedCampaigns();
  const campaign = await ethers.getContractAt("Campaign", campaignAddress);

  return { factory, campaign, manager, contributor, recipient };
}

describe("Campaigns", function () {
  it("deploys a factory and campaign", async function () {
    const { factory, campaign } = await deployFixture();
    expect(await factory.getAddress()).to.be.properAddress;
    expect(await campaign.getAddress()).to.be.properAddress;
  });

  it("sets the creator as manager", async function () {
    const { campaign, manager } = await deployFixture();
    expect(await campaign.manager()).to.equal(manager.address);
  });

  it("records a contributor as an approver", async function () {
    const { campaign, contributor } = await deployFixture();
    await campaign.connect(contributor).contribute({ value: 2000 });
    expect(await campaign.approvers(contributor.address)).to.equal(true);
    expect(await campaign.approversCount()).to.equal(1n);
  });

  it("rejects contributions below the minimum", async function () {
    const { campaign, contributor } = await deployFixture();
    await expect(campaign.connect(contributor).contribute({ value: 200 }))
      .to.be.revertedWith("Contribution is below the minimum");
  });

  it("lets the manager create a request", async function () {
    const { campaign, contributor, recipient } = await deployFixture();
    await campaign.connect(contributor).contribute({ value: ethers.parseEther("1") });
    await campaign.createRequest("Buy materials", 100, recipient.address);
    const request = await campaign.getRequest(0);
    expect(request.description).to.equal("Buy materials");
  });

  it("processes an approved spending request", async function () {
    const { campaign, contributor, recipient } = await deployFixture();
    const contribution = ethers.parseEther("1");
    const spend = ethers.parseEther("0.25");

    await campaign.connect(contributor).contribute({ value: contribution });
    await campaign.createRequest("Pay vendor", spend, recipient.address);
    await campaign.connect(contributor).approveRequest(0);

    await expect(() => campaign.finalizeRequest(0))
      .to.changeEtherBalances([campaign, recipient], [-spend, spend]);

    const request = await campaign.getRequest(0);
    expect(request.complete).to.equal(true);
  });
});
