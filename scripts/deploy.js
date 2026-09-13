const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function upsertEnvValue(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  return pattern.test(content)
    ? content.replace(pattern, line)
    : `${content.trimEnd()}\n${line}\n`;
}

async function main() {
  const Factory = await hre.ethers.getContractFactory("CampaignFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log(`CampaignFactory deployed to: ${address}`);

  const envPath = path.join(__dirname, "..", ".env.local");
  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  if (hre.network.name === "localhost") {
    env = upsertEnvValue(env, "NEXT_PUBLIC_RPC_URL", "http://127.0.0.1:8545");
  } else if (!process.env.NEXT_PUBLIC_RPC_URL && process.env.SEPOLIA_RPC_URL) {
    env = upsertEnvValue(env, "NEXT_PUBLIC_RPC_URL", process.env.SEPOLIA_RPC_URL);
  }

  env = upsertEnvValue(env, "NEXT_PUBLIC_FACTORY_ADDRESS", address);
  fs.writeFileSync(envPath, env, "utf8");
  console.log(`Updated ${envPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
