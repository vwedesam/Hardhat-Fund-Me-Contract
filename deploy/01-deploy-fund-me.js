const { network } = require("hardhat");
const { networkConfig, developmentChains } = require('../helper-hardhat-config');
const { verify } = require("../utils/verify");

/**
 * @param {Hardhat Runtime Env} 
 */
module.exports = async (hre) => {

    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // get price feed address base on the active network
    let ethUsdPriceFeedAddress;

    if(developmentChains.includes(network.name)){
        // already deployed contract
        const ethUsdAggragator = await deployments.get('MockV3Aggregator');
        ethUsdPriceFeedAddress = ethUsdAggragator.address;
    }else{
        ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed'];
    }
    // well what happens when we want to change chains?
    // when going for localhost or hardhat network we want to use a mock

    const args = [ethUsdPriceFeedAddress];

    // deploy our FundMe coontract
    const FundMe  = await deploy('FundMe', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // verify contract
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        console.log('Verifying FundMe contract ...')
        // wait for block confirmation b4 verifying contract
        await verify(FundMe.address, args);
    }
    
    console.log('-----------------------------------------------------')

}

module.exports.tags = ['all'];
