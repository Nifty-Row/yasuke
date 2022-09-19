const { ethers } = require("hardhat");
//const { ethers } = require("ethers");

async function main() {
    const signers = await ethers.getSigners();
    const deployer = signers[0];

    let deployStore = true;
    let storeAddress = '0xD8482a7AA54061C65Af49966f2C8a99a4D4A4f5A';

    console.log('Deploying contracts with the account:', deployer.address);

    console.log('Account balance:', (await deployer.getBalance()).toString());

    if (deployStore) {
        console.log('Deploying store. ');
        const Storage = await ethers.getContractFactory('Storage');
        const store = await Storage.deploy();
        await store.deployed();
        console.log('Store deployed to:', store.address);
        storeAddress = store.address;
    }

    const Yasuke = await ethers.getContractFactory('Yasuke');
    yasuke = await Yasuke.deploy(storeAddress);
    await yasuke.deployed();
    console.log('YASUKE deployed to:', yasuke.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
