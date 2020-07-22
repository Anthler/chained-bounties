const {expectRevert, expectEvent, BN} = require("@openzeppelin/test-helpers");
const Bounty = artifacts.require('Bounty')
const BountyFactory = artifacts.require('BountyFactory')

contract("BountyFactory", (accounts) => {
    const [admin, account1, account2, account3] = accounts;
    let factory;

    beforeEach(async () => {
        factory = await BountyFactory.new()
    })

    describe("initialization", () => {
        it("should return first account as owner", async () => {
            const owner = await factory.owner();
            assert(owner.toLowerCase() === admin.toLowerCase())
        })
    })

    describe("createNewBounty() ", async () => {
        
        it("should revert when not enough ether supplied", async ()=>{
            const amount = new BN("2");
            const title = "title 1";
            const desc = "description 1"
            await expectRevert.unspecified(
                factory.createNewBounty(amount, title, desc, {from: account2, value: new BN("1")})
            )
        })

        it("should create new bounty if enough ether supplied", async ()=>{
            const amount = new BN("2");
            const title = "title 1";
            const desc = "description 1"
            await factory.createNewBounty(amount, title, desc, {from: account2, value: amount})
        })

        it("Should return correct size of bounties collection", async ()=>{
            const amount = web3.utils.toWei("1");
            const title = "title 1";
            const desc = "description 1"
            await factory.createNewBounty(amount, title, desc, {from: account2, value: amount})
            await factory.createNewBounty(amount, "title 2", "description 2", {from: account2, value: amount})
            const bountiesCount = await factory.bountiesCount();
            const bounties = await factory.getBounties(2,0)
            
            const bounty = await Bounty.at(bounties[0])
            const balance = await web3.eth.getBalance(bounty.address)
            assert(balance.toString() === amount.toString())
            assert(parseInt(bountiesCount) === 2)
        })

        it("Should return correct size of my bounties", async () =>{
            const amount = web3.utils.toWei("1");
            const title = "title 1";
            const desc = "description 1"
            await factory.createNewBounty(amount, title, desc, {from: account2, value: amount})
            await factory.createNewBounty(amount, "title 2", "description 2", {from: account2, value: amount})
            await factory.createNewBounty(amount, "title 2", "description 2", {from: account1, value: amount})
            const account1Bounties = await factory.getMyBountiesCount({from: account1});
            const account2Bounties = await factory.getMyBountiesCount({from: account2});
            assert(parseInt(account1Bounties) === 1)
            assert(parseInt(account2Bounties) === 2)
        })
    })
})