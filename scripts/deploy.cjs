const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying MemeNFT...");

    const MemeNFT = await hre.ethers.getContractFactory("MemeNFT");
    const memeNFT = await MemeNFT.deploy();
    await memeNFT.waitForDeployment();

    const address = await memeNFT.getAddress();
    console.log(`MemeNFT deployed to: ${address}`);

    // Export ABI and Address for Frontend
    const contractData = {
        address: address,
        abi: JSON.parse(MemeNFT.interface.format('json')),
    };

    const outputDir = path.join(__dirname, "../src/constants");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "contract.ts");
    const content = `export const CONTRACT_ADDRESS = "${address}";\nexport const CONTRACT_ABI = ${JSON.stringify(contractData.abi, null, 2)} as const;`;

    fs.writeFileSync(outputPath, content);
    console.log(`Contract data saved to ${outputPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
