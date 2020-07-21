pragma solidity ^0.6.5;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Bounty is Ownable, ReentrancyGuard, Pausable{

    using SafeMath for uint256;

    address payable public winner;

    uint public proposalsCount;
    uint public amount;
    string public description;
    string public title;
    uint public createdAt;

    mapping(uint => Proposal) proposals;
    Proposal[] private proposalsCollection;

    struct Proposal{
        uint id;
        address payable submitter;
        string linkedIn;
        string message;
        uint createdAt;
        ProposalStatus status;
    }

    enum Status{ Open, Closed, Cancelled}
    Status public bountyStatus;

    enum ProposalStatus{ Pending, Accepted, Rejected}

    event ProposalSubmitted( uint proposalId);
    event ProposalAccepted(address bounty, uint proposalId, address indexed _winner, uint amountToWithdraw);
    event BountyClosed(address bounty, string message);
    event BountyCancelled(address bounty);
    event BountyRejected(address bounty);
    event BountyAmountUpdated(address bounty, uint newAmount);
    event BountyDetailsUpdated(address bounty);

    modifier whenBountyOpen(){ require(bountyStatus == Status.Open, "bounty is closed"); _;}

    constructor(uint _amount, string memory _title, string memory _desc) public payable { 
        transferOwnership(tx.origin);
        winner = address(0);
        amount = _amount;
        description = _desc;
        title = _title;
        createdAt = now;
        proposalsCount = 0;
    }
    
    receive() external payable {}

    fallback() external payable {}

    function makeProposal(string memory link, string memory message) 
        public 
        whenBountyOpen()
        whenNotPaused() 
    {
        require(winner == address(0), " Winner already declared");
        proposalsCount++;
        uint _proposalId = proposalsCount;
        Proposal storage proposal = proposals[_proposalId];
        proposal.id = _proposalId;
        proposal.linkedIn = link;
        proposal.message = message;
        proposal.submitter = msg.sender;
        proposal.status = ProposalStatus.Pending;
        proposal.createdAt = now;
        proposalsCollection.push(proposal);
        emit ProposalSubmitted(_proposalId);
    }

    function getProposals() public view onlyOwner() returns(Proposal[] memory _proposals){
         _proposals = proposalsCollection;
    }

    function acceptProposal(uint proposalId)
        public 
        payable 
        onlyOwner() 
        whenBountyOpen()
        whenNotPaused()
    {
        require(proposals[proposalId].submitter != address(0), "You must provide a valid address");        
        require(winner == address(0), "A winner already declared");
        Proposal storage proposal = proposals[proposalId];
        proposals[proposalId].status = ProposalStatus.Accepted;
        winner = proposals[proposalId].submitter;
        for(uint i = 0; i < proposalsCollection.length; i++){
            if(proposalsCollection[i].id == proposals[proposalId].id){
                proposalsCollection[i] = proposal;
            }
        }
        bountyStatus = Status.Closed;
        proposals[proposalId].submitter.transfer(amount);
        emit ProposalAccepted(address(this), proposalId,proposals[proposalId].submitter,amount);
    }

    function closeBounty() public onlyOwner() whenNotPaused() {
        require(bountyStatus == Status.Open, 'Bounty already closed');
        bountyStatus = Status.Closed;
        emit BountyClosed(address(this), "Bounty was closed");
    }

    function cancelBounty() public onlyOwner() whenNotPaused() {
        require(bountyStatus == Status.Open, 'Bounty already closed');
        bountyStatus = Status.Cancelled;
        address payable ownerAddress = payable(owner());
        ownerAddress.transfer(address(this).balance);
        emit BountyCancelled(address(this));
    }

    function rejectProposal(uint proposalId) 
        public 
        onlyOwner()
        whenBountyOpen()
        whenNotPaused()
    {
        require(proposals[proposalId].status == ProposalStatus.Pending, "You can only cancel pending proposals");
        Proposal storage proposal = proposals[proposalId];
        proposal.status = ProposalStatus.Rejected;
        for(uint i = 0; i < proposalsCollection.length; i++){
            if(proposalsCollection[i].id == proposals[proposalId].id){
                proposalsCollection[i] = proposal;
            }
        }

    }
    
    function getProposal(uint proposalId) 
        public 
        view 
        returns(
            uint _id,
            address _submitter,
            string memory _linkedIn,
            string memory _message,
            ProposalStatus _status
        )
    {
            Proposal storage proposal =  proposals[proposalId];
            _id = proposal.id;
            _submitter = proposal.submitter;
            _linkedIn = proposal.linkedIn;
            _message = proposal.message;
            _status = proposal.status;
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }
}