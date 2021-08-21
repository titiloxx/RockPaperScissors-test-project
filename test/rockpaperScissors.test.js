const { assert, expect } = require('chai');

const Token = artifacts.require('Token')
const RPS = artifacts.require('RockPaperScissors')

require('chai')
  .use(require('chai-as-promised'))
  .should()

const initialToken=1*10e17;
const MOVE = {
	ROCK: "1",
	PAPER: "2",
	SCISORS: "3"
}
const STATE = {
	CREATED: "1",
	STARTED: "2",
	FINISHED: "3"
}
contract('RPC', ([hero, opponent]) => {
  let token,rockpapers;
  before(async ()=>{
    token = await Token.new("Token", "TKN",100);
    rockpapers = await RPS.new(token.address);
    await token.approve(opponent,30);
    await token.transfer(opponent,30);
    await token.approve(rockpapers.address,10);
  })

  describe("Game instance",()=>{

    it('Create new game and check if tokens are freezed',async ()=>{
        await rockpapers.newGame({value:initialToken})
        //Check if tokens are freezed
        let balance=(await rockpapers.gameList(hero)).tokenAmount.toString();
        assert.equal(balance,"1000000000000000000")
    })

    it('Check if game is initialized',async ()=>{
        const currentGame=await rockpapers.gameList(hero)
        assert.equal(STATE.CREATED,currentGame.state.toString())
    })

    it('Join game and checks if game is started with 10 tokens',async ()=>{
        let currentGame=await rockpapers.gameList(hero)
        await rockpapers.joinGame(hero,{from:opponent,value:currentGame.tokenAmount})

        currentGame=await rockpapers.gameList(hero)
        assert.equal(STATE.STARTED,currentGame.state.toString())
    })

    it('hero move rock and opponent scisors, check if winner has their tokens and game is finished',async ()=>{
       await rockpapers.move(hero,MOVE.SCISORS)
       await rockpapers.move(hero,MOVE.PAPER,{from:opponent})
       let heroBalance = await web3.eth.getBalance(hero);
       let opponentBalance=await web3.eth.getBalance(opponent);

       console.log(heroBalance.toString(),opponentBalance.toString())
       expect(parseInt(heroBalance)).to.be.gt(10e17*100)
       expect(parseInt(opponentBalance)).to.be.lt(10e17*100)
       
    })

    it('Play against each other',async ()=>{
      let heroBalance = await web3.eth.getBalance(hero);
      let opponentBalance=await web3.eth.getBalance(opponent);

      console.log(heroBalance.toString(),opponentBalance.toString())
        //Create game
        await rockpapers.playEachOther(hero,opponent,{value:20*10e17});

        //Join game
        await rockpapers.joinGame(hero,{from:opponent,value:20*10e17})


        //Move
        await rockpapers.betLastMove(hero)
        await rockpapers.move(hero,MOVE.SCISORS,{from:opponent})
        
        heroBalance = await web3.eth.getBalance(hero);
        opponentBalance=await web3.eth.getBalance(opponent);
 
        console.log(heroBalance.toString(),opponentBalance.toString())
    })

  })

    
})