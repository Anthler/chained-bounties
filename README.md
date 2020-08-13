# Chained Bounties
A decentralized application that facilitate bounties and payment rewards using cryptocurrencies.

## What it does

 Chained Bounties is solution is a platform that leverages Blockchain technology, to enable developers, testers, pentesters, to post their bounties and works. People who work on these bounties are paid in cryptocurrencies.


## How to use the platform 

Simple walkthrough:

 1. This dapp is a deployed instance of a bounty factory contract. A poster can create a new bounty contract by providing the title, description and reward amount in ether which is sent to the newly created bounty contract address.

 2. Once the bounty is successfully created, the workers, developers or testers can submit a proposal which includes a short description and a link to their work done.

 3. The poster can then manage his bounties by navigating to "my bounties" and see proposals submitted to each bounty created.

 4. The poster can then choose the winner. Once a winner is chosen, the bounty contract balance is transfer to the winner's account.
 
 5. The bounty will status will be closed after winner is declared.
 
Join me in a walk around the platform in this demo video:


## Project Setup
> Alert: only techies are allowed after this point

To setup this project in a local environment you need to have:
- Node v10.19.0
- npm
- Truffle 
- git
- Metamask extension

To play with this project you have the following networks and two front-end servers to choose from:
-	Local development network with front-end served by a local server
-	Rinkeby network with front-end served by a local server
-	Rinkeby network with front-end served by netlify

 The logical order is to setup the network -> connect Metamask -> serve client 
1.	Local development network:
```sh
        $ git clone https://github.com/Anthler/chained-bounties.git
        $ cd chained-bounties
        $ npm install
        $ truffle develop
        $ compile
        $ migrate
        $ test
        Connect Metamask to a funded account on the localhost network
```
2.	**Rinkeby** network: 
```
        Just connect Metamask to a funded account on the Rinkeby network
```
3.	Front-end served by a local server:
```sh
        $ cd client
        $ npm install
        $ npm start
```

>Note on networks: As mentioned the contract is deployed on Rinkeby, so if you also setup your local network with truffle develop like above, it's all up to Metamask on which network you are interacting with.

**Ropsten** Contract is also deployed on Ropsten testnet, you can play with it using Remix IDE. Check the deployment address at deployed_addresses.txt.
