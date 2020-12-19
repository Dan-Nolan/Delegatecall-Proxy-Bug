# Delegatecall Proxy Bug

This repository focused on the vulnerability discovered by [Trail of Bits](https://blog.trailofbits.com/2020/12/16/breaking-aave-upgradeability/) on December 3rd in the AAVE V2 Contracts. We'll focus on this vulnerability by writing a contract that would have exploited it!

To successfully pull off the attack we'll fork the mainnet at a block before AAVE initialized their contracts [here](https://etherscan.io/tx/0x98089120cd9b1a83a8c5233f6773ff9c12b7451a12532b7ef103d0a85419aa4e) and [here](https://etherscan.io/tx/0x5e7b4c263d3f764583bd9fbd39bd7276295f033bf42bbcd97bc0e4d8f7d22ed2).

Fortunately [Hardhat](https://hardhat.org/) makes it super easy to [fork mainnet](https://hardhat.org/guides/mainnet-forking.html)!

## Getting Setup

There are a few steps to get setup here:

 - Install [install Node.js](https://nodejs.org/en/)
 - Download this repository locally
 - Open the command line and navigate to your local copy of this repository
 - Run `npm install` to download all the dependencies

Once you've successfully downloaded the dependencies, we'll need to setup our repository fork the mainnet!

## Forking Mainnet

In order to fork mainnet, we'll be pointing this repository at an [Alchemy API](https://alchemyapi.io/) endpoint. To do this, you'll need to sign up for Alchemy, create a mainnet project and get your HTTP endpoint.

Once you've done this we'll use [dotenv](https://www.npmjs.com/package/dotenv) to store the endpoint in a local `.env` file that won't accidentally get committed! Since this package is already in your dependencies all you'll need to do is create a new `.env` file and add the following entry into it:

```
FORKING_URL=https://eth-mainnet.alchemyapi.io/v2/<YOUR_API_KEY>
```

Replacing `<YOUR_API_KEY>` with the API key from Alchemy.

## Running Tests

The `hardhat.config.js` is already set up to point to a block before the vulnerability was fixed. All we'll need to do to run the exploit is run `npx hardhat test`. This will compile your `contracts/Contract.sol` file and provide it to our `test/test.js` file for testing!

You'll see in the `test.js` file we are deploying the `Contract` as well as the `Destructor`. The `Contract` will use the `Destructor` to self-destruct the lending pool and then return a successful return code on the lending pool delegate call.

If the test cases pass when you run `npx hardhat test`, then you've successfully destroyed the lending pool!

Check out the [Trail of Bits Article](https://blog.trailofbits.com/2020/12/16/breaking-aave-upgradeability/) to understand the rammifications of this attack, and what could have happened if it was exploited before they found it.

Thanks Trail of Bits!
