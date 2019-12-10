const BountyV1 = artifacts.require("BountyV1");

module.exports = function(deployer) {
  deployer.deploy(BountyV1);
};
