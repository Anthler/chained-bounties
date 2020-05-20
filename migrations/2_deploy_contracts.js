var BountyFactory = artifacts.require("./BountyFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(BountyFactory);
};

