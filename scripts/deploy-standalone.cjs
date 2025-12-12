const fs = require("fs");
const path = require("path");
const solc = require("solc");
const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    console.log("Starting Standalone Deployment (Bypassing Hardhat)...");

    // 1. Compile
    const contractPath = path.resolve(__dirname, "../contracts/MemeNFT.sol");
    const source = fs.readFileSync(contractPath, "utf8");

    // Resolver to find OpenZeppelin contracts in node_modules
    function findImports(importPath) {
        if (importPath.startsWith("@openzeppelin")) {
            const nodeModulesPath = path.resolve(__dirname, "../node_modules", importPath);
            if (fs.existsSync(nodeModulesPath)) {
                return { contents: fs.readFileSync(nodeModulesPath, "utf8") };
            } else {
                return { error: "File not found" };
            }
        }
        return { error: "File not found" };
    }

    const input = {
        language: "Solidity",
        sources: {
            "MemeNFT.sol": {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                "*": {
                    "*": ["*"],
                },
            },
        },
    };

    console.log("Compiling contracts...");
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    if (output.errors) {
        let hasError = false;
        output.errors.forEach((err) => {
            console.error(err.formattedMessage);
            if (err.severity === 'error') hasError = true;
        });
        if (hasError) throw new Error("Compilation failed");
    }

    const contractFile = output.contracts["MemeNFT.sol"]["MemeNFT"];
    const abi = contractFile.abi;
    const bytecode = contractFile.evm.bytecode.object;

    console.log("Compilation Successful!");

    // 2. Deploy
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY not found in .env");

    // Base Mainnet RPC
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Deploying from account: ${wallet.address}`);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // Deploy with gas optimization hints for Base if needed, but standard should work
    const contract = await factory.deploy();
    console.log("Deployment tx sent:", contract.deploymentTransaction().hash);

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log(`MemeNFT deployed to: ${address}`);

    // 3. Export
    const outputDir = path.join(__dirname, "../src/constants");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "contract.ts");
    const content = `export const CONTRACT_ADDRESS = "${address}";\nexport const CONTRACT_ABI = ${JSON.stringify(abi, null, 2)} as const;`;

    fs.writeFileSync(outputPath, content);
    console.log(`Contract data saved to ${outputPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
