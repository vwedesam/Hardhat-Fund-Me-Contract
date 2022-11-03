
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL,
    GOERLI_RPC_URL = process.env.GOERLI_RPC_URL,
    PRIVATE_KEY = process.env.PRIVATE_KEY,
    ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY,
    REPORT_GAS = process.env.REPORT_GAS,
    COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [{ version: "0.6.0" }, { version: "0.8.8" }],
    },
    networks: {
        Goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 3,
        },
        Ganache: {
            url: GANACHE_RPC_URL,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: REPORT_GAS !== undefined,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
    // access from getNamedAccounts() on deploy folder
    namedAccounts: {
        deployer: {
            default: 0, // account index for all chain/network
            // chain and default account position/index
            //chainId: index
            // 4: 1,
        },
        users: {
            default: 1,
        },
    },
};
