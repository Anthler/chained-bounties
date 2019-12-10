pragma solidity 0.5.12;

contract BountyV1{

    address payable owner;

    uint private bountiesCount;
    uint private proposalsCount;

    mapping(address => uint) posterBountyCount;
    mapping(address => uint) posterPendingBountiesCount;
    mapping(uint => Proposal) proposals;
    mapping(address => uint[]) submitterProposals;
    mapping(address => uint) submitterProposalsCount;
    mapping(uint => Bounty) bounties;
    mapping(address => uint[]) posterBounties;

    struct Bounty{
        uint id;
        address payable poster;
        uint amount;
        string description;
        uint deadLine;
        uint[] proposals;
        uint proposalsCount;
        address payable winner;
        BountyStatus status;
    }

    struct Proposal{
        uint id;
        uint bountyId;
        address payable submitter;
        string proposalLink;
        ProposalStatus status;
    }

    enum BountyStatus{ Open, Completed, Cancelled, Challenge, Resolved,Expired}
    enum ProposalStatus{ Pending, Accepted, Rejected}

    event BountyCreated(uint bountyId);
    event BountyResolved(uint bountyId);
    event ProposalSubmitted( uint proposalId);
    event ProposalAccepted(uint bountyId, uint proposalId, address indexed _winner, address indexed _poster, uint amountToWithdraw);
    event BountyCancelled(uint bountyId);
    event BountyAmountUpdated(uint bountyId, uint newAmount);
    event BountyDetailsUpdated(uint bountyId);
    
    modifier onlyOwner(){ require(msg.sender == owner); _;}

    modifier whenBountyOpen(uint bountyId){ require(bounties[bountyId].status == BountyStatus.Open); _;}

    modifier verifyCaller (address _address) { require (msg.sender == _address); _; }

    modifier paidEnough(uint _amount) { require(msg.value >= _amount); _; }

    constructor() public { owner = msg.sender; }
    
    function () external{ revert(); }

    function createNewBounty(uint amount, uint deadLine, string memory description) 
        public 
        payable 
        paidEnough(amount)
        returns(uint bountyId)
    {
       bountyId = bountiesCount;
       Bounty storage bounty = bounties[bountyId];
       bounty.id = bountyId;
       bounty.poster = msg.sender;
       bounty.deadLine = deadLine;
       bounty.description = description;
       bounty.amount = amount;
       bounty.proposalsCount = 0;
       bounty.winner = address(0);
       bounty.status = BountyStatus.Open;
       posterBounties[msg.sender].push(bountyId);
       posterBountyCount[msg.sender] += 1;
       bountiesCount += 1;
       uint amountToRefund = msg.value - bounty.amount;
       if(amountToRefund > 0) msg.sender.transfer(amountToRefund);

       emit BountyCreated(bountyId);
    }

    function updateBountyAmount(uint bountyId, uint newAmount) 
        public 
        verifyCaller(bounties[bountyId].poster) 
        whenBountyOpen(bountyId)
    { 
        bounties[bountyId].amount = newAmount;
    }

    function createNewProposal(uint bountyId, string memory link) 
        public 
        whenBountyOpen(bountyId) 
        returns(uint _proposalId)
    {
        require(msg.sender != bounties[bountyId].poster, "You cannot create proposals on your own bounty");
        _proposalId = proposalsCount;
        Proposal storage proposal = proposals[_proposalId];
        proposal.id = _proposalId;
        proposal.bountyId = bountyId;
        proposal.proposalLink = link;
        proposal.submitter = msg.sender;
        proposal.status = ProposalStatus.Pending;
        bounties[bountyId].proposalsCount += 1;
        bounties[bountyId].proposals.push(_proposalId);
        proposalsCount += 1;
        submitterProposals[msg.sender].push(proposal.id);
        submitterProposalsCount[msg.sender] += 1;
        emit ProposalSubmitted(_proposalId);
    }

    function acceptProposal(uint bountyId, uint proposalId)
        public 
        payable 
        verifyCaller(bounties[bountyId].poster) 
        whenBountyOpen(bountyId)
        returns(bool)
    {
        require(proposals[proposalId].submitter != address(0), "You must provide a valid address");
        require(proposals[proposalId].bountyId == bountyId, "You must provide a correct bounty ID");
        require(bounties[bountyId].winner == address(0), "A winner already declared");
        uint amountToWithdraw = bounties[bountyId].amount;
        require(amountToWithdraw <= address(this).balance, "Insufficient funds available");
        posterPendingBountiesCount[msg.sender] -= 1;
        bounties[bountyId].winner = proposals[proposalId].submitter;
        bounties[bountyId].status = BountyStatus.Completed;
        proposals[proposalId].status = ProposalStatus.Accepted;
        bounties[bountyId].winner.transfer(amountToWithdraw);
        emit ProposalAccepted(bountyId,  proposalId , bounties[bountyId].winner,  bounties[bountyId].poster, amountToWithdraw);
        return true;
    }

    function rejectProposal(uint bountyId, uint proposalId) 
        public 
        verifyCaller(bounties[bountyId].poster)
        whenBountyOpen(bountyId)
    {
        
        require(proposals[proposalId].bountyId == bountyId, "You must provide a valid bounty ID");
        require(proposals[proposalId].status == ProposalStatus.Pending, "You can only cancel pending proposals");
        proposals[proposalId].status = ProposalStatus.Rejected;
    }
    
    function markBountyAsResolved(uint bountyId) 
        public 
        verifyCaller(bounties[bountyId].poster) 
        whenBountyOpen(bountyId)
    {
        require(bounties[bountyId].status == BountyStatus.Challenge, "you can only marked challenged bounties as resolved");
        posterPendingBountiesCount[msg.sender] -= 1;
        bounties[bountyId].status = BountyStatus.Resolved;
    }
    
    function cancelBounty(uint bountyId) 
        public 
        payable 
        verifyCaller(bounties[bountyId].poster) 
        whenBountyOpen(bountyId) 
        returns(bool)
    {
        uint amountToRefund = bounties[bountyId].amount;
        if(amountToRefund > 0) {
            bounties[bountyId].amount = 0;
            msg.sender.transfer(amountToRefund);
        }
        bounties[bountyId].status = BountyStatus.Cancelled;
        posterPendingBountiesCount[msg.sender] -= 1;
        return true;
    }

    function getBounty(uint bountyId) 
        public 
        view 
        returns(
            uint _id,
            address _poster,
            uint _deadLine,
            string memory _desc,
            address _winner,
            uint _proposalsCount,
            uint _amount,
            BountyStatus _status
    )
    {
       Bounty storage bounty = bounties[bountyId];
        _id = bounty.id ;
       _poster = bounty.poster;
       _deadLine = bounty.deadLine;
       _desc = bounty.description;
       _winner = bounty.winner ;
       _proposalsCount = bounty.proposalsCount;
       _amount = bounty.amount;
       _status = bounty.status;  
    }

    function getProposal(uint proposalId) 
        public 
        view 
        returns(
            uint _id,
            uint _bountyId,
            address _submitter,
            string memory _proposalLink,
            ProposalStatus _status
        )
    {
            Proposal storage proposal =  proposals[proposalId];
            _id = proposal.id;
            _bountyId = proposal.bountyId;
            _submitter = proposal.submitter;
            _proposalLink = proposal.proposalLink;
            _status = proposal.status;
    }

    function getAllBountiesCount() public view returns(uint){
        return bountiesCount;
    }

    function getProposalsCount() public view returns(uint){
        return proposalsCount;
    }

    function getPosterBountiesCount(address _poster) public view returns(uint){
        return posterBountyCount[_poster];
    }

    function getPosterPendingBountiesCount( address _poster) public view returns(uint){
        return posterPendingBountiesCount[_poster];
    }

    function getBountyProposalCount(uint bountyId) public view returns(uint){
        return bounties[bountyId].proposalsCount;
    }

    function getBountyProposals(uint bountyId) public view returns(uint[] memory){
        return bounties[bountyId].proposals;
    }

    

    function getBountyStatus(uint bountyId) public view returns(BountyStatus _status){
       _status =  bounties[bountyId].status;
    }
    
    function getBountyWinner(uint bountyId) public view returns(address){
        return bounties[bountyId].winner;
    }
}