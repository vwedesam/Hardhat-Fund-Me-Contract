const { getNamedAccounts, ethers } = require("hardhat")

async function main(){

    const sendValue = ethers.utils.parseEther('1');

    const { deployer } = await getNamedAccounts();

    const FundMe = await ethers.getContract('FundMe', deployer);

    const transactionResponse = await FundMe.fund({ value: sendValue});

    await transactionResponse.wait(1)

    console.log('Funded contract')
    console.log('-----------------------------------------')

}

main()
.catch(err=>{
    console.log(err)
})