const { getNamedAccounts, ethers } = require("hardhat")

async function main(){

    const sendValue = ethers.utils.parseEther('1');

    const { deployer } = await getNamedAccounts();

    const FundMe = await ethers.getContract('FundMe', deployer);

    const balance = await ethers.provider.getBalance(
        FundMe.address
    );

    console.log('contract balance', (balance/10**18), 'ETH')
    console.log('-----------------------------------------')

}

main()
.catch(err=>{
    console.log(err)
})
