const { network } = require("hardhat");
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");

module.exports = async (hre) => {

    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        console.log("Local network detected! Deploying Mockd ...");
        // deploy mock contract
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        });
        console.log('Mocks deployed!')
        console.log(
            " _________________________________________________________ "
        );
    }
};

module.exports.tags = ["all", "mocks"];
