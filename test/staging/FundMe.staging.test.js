// run on testnet not local environment
const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require('../../helper-hardhat-config');

developmentChains.includes(network.name) ? describe.skip :

describe("FundMe", async () => {

    let FundMe, deployer;
    const sendValue = ethers.utils.parseEther("1"); // 1 * 10 ** 18 // 1 ETH
    before(async ()=> {
        // deploy contract with hardhat-deploy 
        // const accountZero = accounts[0];
        deployer = (await getNamedAccounts()).deployer;
        // deploy contract
        await deployments.fixture(['all']);
        // get deployed contract by name
        FundMe = await ethers.getContract('FundMe', deployer);
    })

    it("allows people to fund and withdraw", async function(){

        await FundMe.fund({ value: sendValue });
        await FundMe.withdraw();

        const endingFundMeBalance = await FundMe.provider.getBalance(
            FundMe.address
        );

        assert.equal(endingFundMeBalance.toString(), "0");

    })

})
