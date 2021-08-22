const RockPaperScissors = artifacts.require("RockPaperScissors");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer) {
  //const existing = await Box.deployed();
  //Deploy main contract with proxy
  const instance = await deployProxy(RockPaperScissors,{kind:'uups'});
  /*const exists= await RockPaperScissors.deployed()
  const instance = await upgradeProxy(exists.address,RockPaperScissors);*/
};
