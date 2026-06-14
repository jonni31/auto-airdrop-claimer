const { ethers } = require("ethers");

const ABI = ["function claim(address,uint256,bytes32[]) external","function isClaimed(address) view returns (bool)"];
const CHAINS = {ethereum:{rpc:process.env.ETH_RPC,id:1},arbitrum:{rpc:process.env.ARB_RPC,id:42161},base:{rpc:process.env.BASE_RPC,id:8453},optimism:{rpc:process.env.OP_RPC,id:10},polygon:{rpc:process.env.POLYGON_RPC,id:137}};

async function claim(pk, chain, contract) {
  const provider = new ethers.JsonRpcProvider(chain.rpc, chain.id);
  const signer = new ethers.Wallet(pk, provider);
  const c = new ethers.Contract(contract, ABI, signer);
  const addr = await signer.getAddress();
  if (await c.isClaimed(addr)) return console.log("  [~] Already claimed");
  try {
    const tx = await c.claim(addr, 0, [], {gasLimit: 200000n});
    console.log(`  [TX] ${tx.hash}`);
    await tx.wait();
    console.log("  [+] Claimed!");
  } catch(e) { console.log(`  [!] ${e.message}`); }
}

async function main() {
  const wallets = (process.env.PRIVATE_KEYS||"").split(",").filter(Boolean);
  const contract = process.env.AIRDROP_CONTRACT;
  if (!contract) { console.error("Set AIRDROP_CONTRACT"); process.exit(1); }
  for (const pk of wallets)
    for (const [name, chain] of Object.entries(CHAINS))
      if (chain.rpc) { console.log(`\n--- ${name} ---`); await claim(pk, chain, contract); }
}

main().catch(console.error);
