const { ethers } = require("hardhat");
//const { ethers } = require("ethers");

async function main() {
    const signers = await ethers.getSigners();
    const deployer = signers[0];

    let deployStore = true;
    let storeAddress = '0xD8482a7AA54061C65Af49966f2C8a99a4D4A4f5A';

    console.log('Deploying contracts with the account:', deployer.address);

    console.log('Account balance:', (await deployer.getBalance()).toString());
    let store;
    if (deployStore) {
        console.log('Deploying store. ');
        const Storage = await ethers.getContractFactory('Storage');
        store = await Storage.deploy();
        await store.deployed();
        console.log('Store deployed to:', store.address);
        storeAddress = store.address;
    }

    const Yasuke = await ethers.getContractFactory('Yasuke');
    yasuke = await Yasuke.deploy(storeAddress);
    await yasuke.deployed();
    setTimeout( async () =>  {
        console.log("parent updated");
        store.setParent(yasuke.address);
        let parent_ = await store.getParent();
        console.log('Storage.Parent is:',  parent_);
        
      }, 40000)
    //store.setParent(yasuke);
    console.log('YASUKE deployed to:', yasuke.address);
    store.setParent(yasuke.address);
    //console.log('YASUKE deployed to:', store.getParent);
    //console.log('Storage.Parent is:', await store.getParent());
}

// main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//         console.error(error)
//         process.exit(1)
//     })
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
      })