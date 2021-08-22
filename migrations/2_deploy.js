const RockPaperScissors = artifacts.require("RockPaperScissors");
//const RockPaperScissors = artifacts.require("RockPaperScissors");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer) {
  //const existing = await Box.deployed();
  //Deploy main contract with proxy
  const instance = await deployProxy(RockPaperScissors,{kind:'uups'});
};
