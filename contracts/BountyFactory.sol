pragma solidity ^0.6.5;

import "./BountyV2.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract BountyFactory is Ownable, Pausable{

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

  constructor() public {
      admin = msg.sender;
      transferOwnership(admin);
  }

    function createNewBounty(
        uint _amount,
        string memory _title, 
        string memory _desc
    )   public 
        payable 
        whenNotPaused()
        paidEnough(_amount)
        checkValue(_amount)
    {
        Bounty bounty = new Bounty( _amount, _title, _desc);
        address payable bountyAddress = payable(address(bounty));
        bountyAddress.transfer(_amount);
        isBountyOwner[msg.sender] = true;
        ownerBounties[msg.sender].push(bounty);
        bounties.push(bounty);
        emit BountyCreated(address(bounty));
    }

    function getBounties(uint _limit, uint _offset)
         public 
         view
         whenNotPaused() 
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