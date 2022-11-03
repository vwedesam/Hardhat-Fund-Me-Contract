const { ethers, getNamedAccounts } = require("hardhat")

async function main(){

    const { deployer } = await getNamedAccounts();

    const FundMe = await ethers.getContract('FundMe', deployer);

    await FundMe.withdraw();

    console.log('withdraw from contract')
    console.log('---------------------------------------------')

}

main()
.catch(err=>{
    console.log(err)
})
