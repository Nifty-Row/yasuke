
/** @type import('hardhat/config').HardhatUserConfig */
/** @type import '@nomiclabs/hardhat-waffle';  */
/** @type import '@nomiclabs/hardhat-ethers'; */
/** @type import 'hardhat-contract-sizer'; */
/** @type import '@nomiclabs/hardhat-etherscan'; */

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async () => {
//   const accounts = await ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

require ('@nomiclabs/hardhat-waffle');
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "M8W4UQJ3AE2XYK5R8VIDV9HRX4387M4BBX"
  },  
  bscscan: {
    apiKey:"M8W4UQJ3AE2XYK5R8VIDV9HRX4387M4BBX"
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
    contractSizer: {
      alphaSort: true,
      runOnCompile: true,
      disambiguatePaths: false,
      allowUnlimitedContractSize: true,
    }
  },
  networks: {
    // Mainnet reef network configuration
    reef_mainnet: {
      url: "wss://rpc.reefscan.com/ws",
      scanUrl: "https://reefscan.com",
      seeds: {
        "one": "soft pear father suit there now spider expose buffalo auction pottery horse"
      },      
    },
    // Testnet reef network configuration
    reef_testnet: {
      url: "wss://rpc-testnet.reefscan.com/ws",
      scanUrl: "https://reefscan.com",
      seeds: {
        "one": "soft pear father suit there now spider expose buffalo auction pottery horse"
      },            
    },
    //     
    tbsc: {
      url: "https://data-seed-prebsc-1-s3.binance.org:8545/",
      accounts: ["498ea38b2b6408be76d6c45b2939c2f195a16ac4bca7e62772fc549c7a798176"],
    },    
    // bsc: {
    //   url: "https://bsc-dataseed.binance.org/",
    //   accounts: [""],
    // },
    // tpolygon: {
    //   url: "https://matic-testnet-archive-rpc.bwarelabs.com",
    //   accounts: [""]
    // },
    // polygon: {
    //   url: "https://polygon-rpc.com",
    //   accounts: [""]
    // },    
    // tharmony: {
    //   url: "",
    //   accounts: [""]
    // },
    // harmony: {
    //   url: "https://api.harmony.one",
    //   accounts: [""]
    // },    
    // taurora: {
    //   url: "https://testnet.aurora.dev",
    //   accounts: [""]
    // },
    // aurora: {
    //   url: "https://mainnet.aurora.dev",
    //   accounts: [""]//private key needed here
    // },
    // tklaytn: {
    //   url: "https://api.baobab.klaytn.net:8651",
    //   accounts: [""]//private key needed here
    // },    
  },    
  
  mocha: {
    timeout: 120000
  },
};


// M8W4UQJ3AE2XYK5R8VIDV9HRX4387M4BBX

// Store deployed to: 0x961DF5777a70Ce13BEA9b9FEd94F71cCB9E1d4dC
// YASUKE deployed to: 0xAeBCf9f55D996e201e545C9795363b4Be9BDb548