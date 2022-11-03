const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require('../../helper-hardhat-config');

!developmentChains.includes(network.name) ? describe.skip :
describe("FundMe", async () => {

    let FundMe, deployer, mockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1"); // 1 * 10 ** 18 // 1 ETH
    before(async ()=> {
        // deploy contract with hardhat-deploy 
        // const accounts = await ethers.getSigner(); // get all available accounts
        // const accountZero = accounts[0];
        deployer = (await getNamedAccounts()).deployer;
        // run deloyment script(deploy folder) with all tags
        // deploy all contracts
        await deployments.fixture(['all']);
        // get deployed contract by name
        FundMe = await ethers.getContract('FundMe', deployer);
        mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer);
    })

    describe("contructor", async ()=> {

        it("sets the aggregator address correctly", async () =>{
            const response =  await FundMe.getPriceFeed();
            assert.equal(response, mockV3Aggregator.address);
        })

    })

    describe('fund', async ()=> {

        it('it fails if you don"t send enough ETH ', async ()=>{
            // use waffle
            await expect(
                FundMe.fund()
            ).to.be.revertedWithCustomError(
                FundMe,
                "FundMe__NotEnoughETH"
            );
        })

        it("updated the amount funded data structure", async()=>{
            // using deployer as funder
            await FundMe.fund({ value: sendValue });

            const response = await FundMe.getAddressToAmountFunded(deployer);
            await expect(response).to.be.equal(sendValue);

        })

        it("Add funder to funders Array", async()=>{
            // using deployer as funder
            await FundMe.fund({ value: sendValue });

            const response = await FundMe.getFunder(0);
            await expect(response).to.be.equal(deployer);
            
        })

    })

    describe("Withdraw", async ()=> {

        before(async()=> {
            // using deployer as funder
            await FundMe.fund({ value: sendValue });
        })

        it("Withdraw ETH from a single funder", async function(){

            const startingFundMeBalance = await FundMe.provider.getBalance(
                FundMe.address
            );

            const startingDeployerBalance = await FundMe.provider.getBalance(
                deployer
            );

            // action
            // withdrawal all funds from the contract to the deployer
            const transactionResponse = await FundMe.withdraw();

            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            
            const gasCost =  gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await FundMe.provider.getBalance(
                FundMe.address
            );

            const endingDeployerBalance = await FundMe.provider.getBalance(
                deployer
            );

            assert.equal(endingFundMeBalance.toString(), 0); // after withdrawal contract balance should be zero

            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(), 
                endingDeployerBalance.add(gasCost).toString()
            ); // after withdrawal deployer balance should be more

        })

        it("allows us to withdraw with multiple funders", async function(){

            const accounts = await ethers.getSigners();
            const fundersLength = 6;
            // fund from different accounts
            // skip the deployer
            for(let i = 1; i < fundersLength; i++){
                // connect accounts to the contract
                const fundMeConnectedContract =  await FundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await FundMe.provider.getBalance(
                FundMe.address
            );

            const startingDeployerBalance = await FundMe.provider.getBalance(
                deployer
            );

            // action
            // withdrawal all funds from the contract to the deployer
            const transactionResponse = await FundMe.withdraw();

            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            
            const gasCost =  gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await FundMe.provider.getBalance(
                FundMe.address
            );

            const endingDeployerBalance = await FundMe.provider.getBalance(
                deployer
            );

            assert.equal(endingFundMeBalance.toString(), 0); // after withdrawal contract balance should be zero

            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(), 
                endingDeployerBalance.add(gasCost).toString()
            ); // after withdrawal deployer balance should be more

            // make sure that the funders are reset properly
            await expect(FundMe.getFunder(0)).to.be.reverted;

            // make sure none of the funder address have funds after withdrawal
            for(i = 0; i < fundersLength; i++ ){
                assert.equal(
                    await FundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }

        })

        it('Only allows the owner to withdraw', async function(){

            const attacker = (await ethers.getSigners())[1];
            const attackerConnectedContract = await FundMe.connect(attacker);

            //when attack tried to withdrawal funds
            await expect(attackerConnectedContract.withdraw()).to.be.reverted

            await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(
                attackerConnectedContract,
                "FundMe__NotOwner"
            )

        })


        it("Cheaper withdraw ... single funder", async function(){

            const startingFundMeBalance = await FundMe.provider.getBalance(
                FundMe.address
            );

            const startingDeployerBalance = await FundMe.provider.getBalance(
                deployer
            );

            // action
            // withdrawal all funds from the contract to the deployer
            const transactionResponse = await FundMe.cheaperWithdraw();

            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            
            const gasCost =  gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await FundMe.provider.getBalance(
                FundMe.address
            );

            const endingDeployerBalance = await FundMe.provider.getBalance(
                deployer
            );

            assert.equal(endingFundMeBalance.toString(), 0); // after withdrawal contract balance should be zero

            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(), 
                endingDeployerBalance.add(gasCost).toString()
            ); // after withdrawal deployer balance should be more

        })

        it("Cheaper withdraw ... multiple funders", async function(){

            const accounts = await ethers.getSigners();
            const fundersLength = 6;
            // fund from different accounts
            // skip the deployer
            for(let i = 1; i < fundersLength; i++){
                // connect accounts to the contract
                const fundMeConnectedContract =  await FundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await FundMe.provider.getBalance(
                FundMe.address
            );

            const startingDeployerBalance = await FundMe.provider.getBalance(
                deployer
            );

            // action
            // withdrawal all funds from the contract to the deployer
            const transactionResponse = await FundMe.cheaperWithdraw();

            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            
            const gasCost =  gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await FundMe.provider.getBalance(
                FundMe.address
            );

            const endingDeployerBalance = await FundMe.provider.getBalance(
                deployer
            );

            assert.equal(endingFundMeBalance.toString(), 0); // after withdrawal contract balance should be zero

            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(), 
                endingDeployerBalance.add(gasCost).toString()
            ); // after withdrawal deployer balance should be more

            // make sure that the funders are reset properly
            await expect(FundMe.getFunder(0)).to.be.reverted;

            // make sure none of the funder address have funds after withdrawal
            for(i = 0; i < fundersLength; i++ ){
                assert.equal(
                    await FundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }

        })

    })

})

