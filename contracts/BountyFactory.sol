pragma solidity ^0.5.16;

import "./BountyV2.sol";

contract BountyFactory{

    uint public MAXLIMIT = 20;

    address payable admin;
    mapping(address => bool) public isBountyOwner;
    mapping(address => Bounty[]) public ownerBounties;
    Bounty[] private bounties;

    event BountyCreated(address indexed bountyAddress);

    modifier paidEnough(uint _amount) { 

        require(msg.value >= _amount);
        _;
    }

    modifier checkValue(uint _amount) {
    _;
    uint amountToRefund = msg.value - _amount;
    if(amountToRefund > 0) msg.sender.transfer(amountToRefund);
  }

  modifier verifyIsBountyOwner(){
      require(isBountyOwner[msg.sender], 'You have not created any bounty yet' );
      _;
  }

    function createNewBounty(
        uint _amount,
        string memory _title, 
        string memory _desc
    )   public 
        payable 
        // paidEnough(_amount)
        // checkValue(_amount)
    {
        
        //address bountyAddress = (bounty).value(_amount)( _amount, _title, _desc);
        Bounty bounty = new Bounty( _amount, _title, _desc);
        ownerBounties[msg.sender].push(bounty);
        isBountyOwner[msg.sender] = true;
        bounties.push(bounty);
        emit BountyCreated(address(bounty));
    }

    function getBounties(uint _limit, uint _offset)
         public 
         view 
         returns(Bounty[] memory _bounties)
        {
        require(_offset <= bountiesCount(), 'Bounties should be more than offset');

        uint size = bountiesCount() - _offset;
            size = size < _limit ? size : _limit;
            size = size < MAXLIMIT ? size : MAXLIMIT;
            _bounties = new Bounty[](size);

            for(uint i = 0; i < size; i++){
                _bounties[i] = bounties[_offset + i];
            }
        return _bounties;
    }

    function getMyBounties() public view returns(Bounty[] memory _ownerBounties){
        _ownerBounties = ownerBounties[msg.sender];
    }

    function getMyBountiesCount() public view returns(uint _count){
        _count = ownerBounties[msg.sender].length;
    }

    function bountiesCount() public view returns(uint){
        return bounties.length;
    }
}
