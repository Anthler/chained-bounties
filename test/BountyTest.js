const {expectRevert, expectEvent, BN} = require("@openzeppelin/test-helpers");
// const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const Bounty = artifacts.require('Bounty');

contract("Bounty", (accounts) => {
    let bounty;
    const [admin, account2, account3, account4, account5] = accounts;

    beforeEach(async () => {

        const amount = web3.utils.toWei("1");
        const title = "Title 1";
        const description = "Description 1"
        bounty = await Bounty.new(amount, title, description, {from: admin, value:amount});
    })

    describe("Initialization", () => {
        it("Should return first account as owner", async () => {
            const actualOwner = await bounty.owner();
            assert.equal(actualOwner.toLowerCase(), admin.toLowerCase());
        })
    
        it("Should test for contract balance", async () => {
            const balance = await bounty.getBalance();
            assert(balance.toString() === web3.utils.toWei("1").toString())
        })
    
        it("Winner address should be empty", async () => {
            const winner = await bounty.winner();
            assert.equal(winner.toLowerCase(), "0x0000000000000000000000000000000000000000")
        })
    
        it("Proposals count should be 0", async () => {
            const proposalsCount = await bounty.proposalsCount();
            assert.equal(proposalsCount, 0);
        })
    
        it("Should test for amount, title, description", async () => {
            const [amount, title, desc] = await Promise.all([
                bounty.amount(),
                bounty.title(),
                bounty.description()
            ])
            assert(amount.toString() === web3.utils.toWei("1"))
            assert(title === "Title 1")
            assert(desc === "Description 1")
        })

        it("Tests for bounty status", async () => {
            const bountyStatus = await bounty.bountyStatus();
            assert(parseInt(bountyStatus) === 0)
        })
    })

    describe("closeBounty ", () => {

        it("should revert for non owner account", async () => {
            await expectRevert(
                bounty.closeBounty({from: account2}),
                "Ownable: caller is not the owner"
            )
        })

        it("should emit bounty closed event", async () =>{
            const receipt = await bounty.closeBounty();
            expectEvent(
                receipt, "BountyClosed", 
                {
                    bounty: bounty.address, 
                    message:"Bounty was closed" 
                })
        })

        it("should change bounty status to closed", async () => {
            await bounty.closeBounty();
            const status = await bounty.bountyStatus();
            assert(parseInt(status) === 1)
        })

        it("should revert if bounty already closed", async () => {
            await bounty.closeBounty();
            await expectRevert(
                bounty.closeBounty(),
                "Bounty already closed"
            )
        })
    })

    describe("makeProposal function", () => {
        const link = "wwww.google.com";
        const message = "This is my message";
    
        it("Should revert when bounty is closed", async () => {
            await bounty.makeProposal(link, message, {from: account2});
            const proposalsCountBefore = await bounty.proposalsCount()
            await bounty.closeBounty();
            await expectRevert(
                bounty.makeProposal("anotherlink.com", "new message", {from:account3}),
                "bounty is closed"
            )
            const proposalsCountAfter = await bounty.proposalsCount();
            assert(proposalsCountAfter-proposalsCountBefore === 0)

        })

        it("Should emit ProposalSubmitted event", async () => {
            const receipt = await bounty.makeProposal("link3.com", "message 3", {from: account2});
            expectEvent(receipt,"ProposalSubmitted",
                {proposalId: String(1)}
            )
        })

        it("Should revert if winner already declared", async () => {
            await bounty.makeProposal("link4", "message 4", {from: account2})
            await bounty.acceptProposal(1);
            const winner = await bounty.winner();
            await expectRevert(
                bounty.makeProposal("link5", "message 5"),
                "bounty is closed"
            )
            const winnerAfter = await bounty.winner();
            assert(account2.toLowerCase() === winner.toLowerCase())
            assert(account2.toLowerCase() === winnerAfter.toLowerCase())
        })

        it("Should make a proposal with correct information", async () => {
            const link = "correct.link";
            const message = "correct message";
            await bounty.makeProposal(link, message, {from:account2})
            const proposal =  await bounty.getProposal(1)
            assert.equal(1, proposal._id)
            assert.equal(link, proposal._linkedIn)
            assert.equal(message, proposal._message)
            assert.equal(account2.toLowerCase(), proposal._submitter.toLowerCase())
        })

        it("Should increase proposals collection count", async () => {
            const proposals = await bounty.getProposals();
            await bounty.makeProposal("correct.link", "correct message", {from:account2})
            await bounty.makeProposal("another.link", "another pessage", {from:account2})
            const proposalsAfter = await bounty.getProposals();
            assert(proposalsAfter.length - proposals.length === 2)
        })
    })

    describe("acceptProposal() ", () =>{
        beforeEach(async () =>{
            await bounty.makeProposal("correct.link", "correct message", {from:account2})
            await bounty.makeProposal("another.link", "another pessage", {from:account3})
        });

        it("Should return the correct proposals count", async () => {
            const count = await bounty.proposalsCount();
            assert(parseInt(count) === 2)
        })

        it("should revert for non owner account", async () => {
            await expectRevert(
                bounty.acceptProposal(1, {from: account2}),
                "Ownable: caller is not the owner"
            )
        })

        it("should revert if a proposal was already accepted", async () => {
            await bounty.acceptProposal(1)
            expectRevert(
                bounty.acceptProposal(2),
                "bounty is closed"
            )
        })

        it("Should send balance to winner", async () =>{
            const balanceBefore = new BN(await web3.eth.getBalance(account4))
            const proposalReceipt = await bounty.makeProposal("last.link", "last message", {from:account4})
            const proposalTx = await web3.eth.getTransaction(proposalReceipt.tx)
            const makeProposalTxCost = Number(proposalTx.gasPrice) * proposalReceipt.receipt.gasUsed;
            const amount = new BN(await bounty.amount());
            await bounty.acceptProposal(3)
            const balanceAfter = new BN(await web3.eth.getBalance(account4))
            const difference = balanceAfter.sub(balanceBefore).add(new BN(makeProposalTxCost));
            assert.equal(difference.toString(), amount.toString())
        })

        it("Should return bounty status closed after accepted", async () =>{
            await bounty.acceptProposal(1)
            const status = await bounty.bountyStatus();
            assert(parseInt(status) === 1)

        } )

        it("Should return amount 0 after accepting proposal", async () =>{
            const amount = await bounty.getBalance();
            await bounty.acceptProposal(1)
            const amountAfter = await bounty.getBalance();
            assert(amountAfter.toString() === web3.utils.toWei("0"))
        } )

        it("Should emit event ", async () =>{
            const amount = await bounty.getBalance();
            const receipt = await bounty.acceptProposal(1)
            expectEvent(receipt, "ProposalAccepted", 
            {
            bounty: bounty.address,
            proposalId: new BN(1), 
            _winner: account2, 
            amountToWithdraw:amount.toString()
            })
        })

    })

    describe("rejectProposal()", async () => {
        it("Should revert if caller not owner", async () =>{
            await bounty.makeProposal("last.link", "last message", {from:account4})
            await expectRevert(
                bounty.rejectProposal(1, {from: account2}),
                "Ownable: caller is not the owner"
            )
        })

        it("Should revert if bounty already closed", async () =>{
            await bounty.closeBounty();
            await expectRevert(
                bounty.rejectProposal(1, {from: admin}),
                "bounty is closed"
            )
        })

        it("Should revert if a proposal was already accepted", async () =>{
            await bounty.makeProposal("link", "message", {from:account3})
            await bounty.makeProposal("link2", "message 2", {from:account4})
            await bounty.acceptProposal(1);
            await expectRevert(
                bounty.rejectProposal(1),
                "bounty is closed"
            )
        })

        it("Should revert if bounty already closed", async () =>{
            await bounty.makeProposal("last.link", "last message", {from:account4})
            await bounty.closeBounty();
            await expectRevert(
                bounty.rejectProposal(1, {from: admin}),
                "bounty is closed"
            )
        })

        it("Should return proposal status rejected ", async () =>{
            await bounty.makeProposal("last.link", "last message", {from:account4})
            await bounty.rejectProposal(1, {from: admin})
            const proposal = await bounty.getProposal(1)
            assert(parseInt(proposal._status) === 2)
        })
    })

    describe("getProposal() ",()=>{
        it("Should return correct proposal link, message, submitter", async () => {
            await bounty.makeProposal("test1.link", "test message", {from: account2})
            await bounty.makeProposal("test1.link2", "test message2", {from: account3})
            const {_id, _submitter, _linkedIn, _message, _status} = await bounty.getProposal(1);
            assert(parseInt(_id) === 1)
            assert(_submitter.toLowerCase() === account2.toLowerCase())
            assert(_linkedIn === "test1.link")
            assert(_message === "test message")
            assert(parseInt(_status) === 0)  
        })
    })

    describe("getProposals() ", () => {
        it("Should return correct proposals information in collection", async () => {
            await bounty.makeProposal("test1.link", "test message", {from: account2})
            await bounty.makeProposal("test1.link2", "test message2", {from: account3})
            const proposals = await bounty.getProposals();
            assert(parseInt(proposals[0].id) === 1)
            assert(proposals[0].submitter.toLowerCase() === account2.toLowerCase())
            assert(proposals[0].linkedIn === "test1.link")
            assert(proposals[0].message === "test message")
            assert(parseInt(proposals[0].status) === 0)
            assert(parseInt(proposals[1].id) === 2)
            assert(proposals[1].submitter.toLowerCase() === account3.toLowerCase())
            assert(proposals[1].linkedIn === "test1.link2")
            assert(proposals[1].message === "test message2")
            assert(parseInt(proposals[1].status) === 0)
        })

        it("Should return size of proposals collection", async () =>{
            await bounty.makeProposal("test1.link", "test message", {from: account2})
            await bounty.makeProposal("test1.link2", "test message2", {from: account3})
            await bounty.makeProposal("test1.link2", "test message2", {from: account3})
            const proposals = await bounty.getProposals();
            assert.equal(proposals.length, 3)
        })
    })

    describe("getBalance() ", () => {
        it("bounty amount should be equal to bounty contract balance", async () => {
            const bountyBalance = await bounty.getBalance();
            const contractAddress = await web3.eth.getBalance(bounty.address)
            assert.equal(bountyBalance.toString(), contractAddress.toString())
        })
    })

    describe("cancelBounty() ", async () =>{

        it("should revert for non owner account", async () => {
            await expectRevert(
                bounty.cancelBounty({from: account2}),
                "Ownable: caller is not the owner"
            )
        })

        it("should revert when bounty is already closed", async () => {
            await bounty.closeBounty();
            await expectRevert(
                bounty.cancelBounty({from: admin}),
                "Bounty already closed"
            )
        })

        it("Should return bounty status cancelled", async () => {
            await bounty.cancelBounty();
            const status = await bounty.bountyStatus();
            assert(parseInt(status) === 2)
        })

        it(" Should transfer contract balance to owner of bounty", async () => {
            const balanceBefore = new BN(await web3.eth.getBalance(admin))
            const receipt = await bounty.cancelBounty();
            const cancelBountyTx = await web3.eth.getTransaction(receipt.tx)
            const cancelBountyTxCost = Number(cancelBountyTx.gasPrice) * receipt.receipt.gasUsed;
            const amount = new BN(await bounty.amount());
            const balanceAfter = new BN(await web3.eth.getBalance(admin))
            const difference = balanceAfter.sub(balanceBefore).add(new BN(cancelBountyTxCost));
            assert.equal(difference.toString(), amount.toString())
        })

        it("should emit BountyCancelled event", async () => {
            const receipt = await bounty.cancelBounty();
            expectEvent(receipt, "BountyCancelled", {bounty: bounty.address})
        })
    })

})