const RockPaperScissors = artifacts.require("RockPaperScissors");
const Token = artifacts.require("Token");

module.exports = async function (deployer) {
  //Deploy contract token and mint 100 tokens
  await deployer.deploy(Token,"Token", "TKN",100);

  const erc20=await Token.deployed();

  //Deploy main contract
  await deployer.deploy(RockPaperScissors,erc20.address);
  

};
