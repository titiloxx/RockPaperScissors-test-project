const { assert } = require('chai');

const Token = artifacts.require('Token')
const RPS = artifacts.require('RockPaperScissors')

require('chai')
  .use(require('chai-as-promised'))
  .should()

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
        await rockpapers.newGame(10)
        //Check if tokens are freezed
        let balance=(await token.balanceOf(rockpapers.address)).toString();
        assert.equal(balance,"10")
    })

    it('Check if game is initialized',async ()=>{
        const currentGame=await rockpapers.gameList(hero)
        assert.equal(STATE.CREATED,currentGame.state.toString())
    })

    it('Check if game is started with 10 tokens',async ()=>{
        let currentGame=await rockpapers.gameList(hero)
        assert.equal("10",currentGame.tokenAmount.toString())

        await token.approve(rockpapers.address,currentGame.tokenAmount,{from:opponent});
        await rockpapers.joinGame(hero,{from:opponent})

        currentGame=await rockpapers.gameList(hero)
        assert.equal(STATE.STARTED,currentGame.state.toString())
    })

    it('hero move rock and opponent scisors, check if winner has their tokens and game is finished',async ()=>{
       await rockpapers.move(hero,MOVE.SCISORS)
       await rockpapers.move(hero,MOVE.PAPER,{from:opponent})
       let balance=(await token.balanceOf(hero)).toString();
       assert.equal("80",balance)
       balance=(await token.balanceOf(opponent)).toString();
       assert.equal("20",balance)
    })

    it('Play against each other',async ()=>{
        //Increase allowance
        await token.approve(rockpapers.address,20);
        //Create game
        await rockpapers.playEachOther(hero,opponent,20);

        //Join game
        await rockpapers.gameList.call(hero)
        await token.approve(rockpapers.address,"20",{from:opponent});
        await rockpapers.joinGame(hero,{from:opponent})


        //Move
        await rockpapers.betLastMove(hero)
        await rockpapers.move(hero,MOVE.ROCK,{from:opponent})
        
        let balance=(await token.balanceOf(opponent)).toString();
        assert.equal("40",balance)
    })

  })

    
})