const RockPaperScissors = artifacts.require("RockPaperScissors");
const Token = artifacts.require("Token");

module.exports = async function (deployer) {

  //Deploy main contract
  await deployer.deploy(RockPaperScissors);

};
