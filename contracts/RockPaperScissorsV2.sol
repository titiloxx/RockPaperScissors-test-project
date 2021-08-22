pragma solidity ^0.8.2;
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import './RockPaperScissors.sol';
/*
                        ROCK PAPER AND SCRISSORS GAME

*/

contract RockPaperScissorsv2ffle is  Initializable, ERC20Upgradeable,OwnableUpgradeable, UUPSUpgradeable{
    uint waitingTime;
    enum GameState{ NONE,CREATED, STARTED, FINISHED }
    enum Move{ NONE,ROCK, PAPER, SCISORS }
     struct Game {
        uint256 timeStamp;
        uint256 tokenAmount;
        GameState state;
        //Addresses
        address payable winner;
        address opponent;
        //Moves
        Move heroMove;
        Move opponentMove;
        }
    Game[] gameHistory;
    //Mapping for recreate old move
    mapping(address => Move) lastMove;
    mapping(address => Game) public gameList;
    Game g;
    function initialize() initializer public {
        waitingTime=60;
        __Ownable_init();
        __UUPSUpgradeable_init();
    }
    /* Creates a new game
       while freezing _tokenAmount
       and add it to the game list
    */
    function newGame() public payable returns(bool){
       privateNewGame(msg.sender,msg.value);
       return true;
    }

    function joinGame(address _gameOwner) public payable returns(bool){
       privateJoinGame(_gameOwner,msg.sender,msg.value);
       return true;
    }

    function newFeature(address _gameOwner) public payable returns(bool){
       privateJoinGame(_gameOwner,msg.sender,msg.value);
       return true;
    }
    function privateNewGame(address _gameOwner,uint256 _tokenAmount) private returns(bool){
        require(
        (gameList[_gameOwner].timeStamp+waitingTime<block.timestamp),"You have already a game initialized");
        g=Game(block.timestamp,_tokenAmount,GameState.CREATED,payable(0x0),address(0x0),Move.NONE,Move.NONE);
        gameList[_gameOwner]=g;

        return true;
    }
    function privateJoinGame(address _gameOwner, address _opponent,uint256 _tokenAmount) private returns(bool){
        require(g.state==GameState.CREATED,"There is no game to join");
        require(
        (_tokenAmount>=gameList[_gameOwner].tokenAmount),"You have to send more tokens if you want to play");
        require(
        (_gameOwner!=_opponent),"You can not join a game if you are the owner");
        require(
        (gameList[_gameOwner].opponent==address(0x0)||gameList[_gameOwner].opponent==_opponent),"You are not allowed to join the game");
        gameList[_gameOwner].state=GameState.STARTED;
        gameList[_gameOwner].opponent=_opponent;
        gameList[_opponent]=gameList[_gameOwner];
        

        return true;
    }

    function move(address _gameOwner,Move _move) public returns(bool){
        require((gameList[_gameOwner].state==GameState.STARTED),"You do not have a game started");
        require((gameList[_gameOwner].opponent==msg.sender||msg.sender==_gameOwner),"You are not playing this game");
        if (_gameOwner==msg.sender) {
            gameList[_gameOwner].heroMove=_move;
        } else {
            gameList[_gameOwner].opponentMove=_move;
        }

        Move hMove=gameList[_gameOwner].heroMove;
        Move oMove=gameList[_gameOwner].opponentMove;
        address oAddress=gameList[_gameOwner].opponent;
        //If two moves are saved lets see the winner!
        if (hMove!=Move.NONE&&
            oMove!=Move.NONE) {
            address payable r=payable(result(_gameOwner,oAddress,hMove,oMove));
            gameList[_gameOwner].state=GameState.FINISHED;
            if (r!=address(0x0)){
                gameList[_gameOwner].winner=r;
                releaseTokens(r,gameList[_gameOwner].tokenAmount*2);
            }
            else{
                releaseTokens(payable(_gameOwner),gameList[_gameOwner].tokenAmount);
                releaseTokens(payable(gameList[_gameOwner].opponent),gameList[_gameOwner].tokenAmount);
            }
            //Add game to game history
            gameHistory.push(gameList[_gameOwner]);
            delete gameList[_gameOwner];
        }
        lastMove[msg.sender]=_move;
        return true;
    }

     /* ReleaseTokens*/
    function releaseTokens(address payable winner,uint256 _tokenAmount) private returns(bool){
        winner.transfer(_tokenAmount);
        return true;
    }

    //Decides who wins
    function result(address p1,address p2,Move m1,Move m2) private pure returns(address){
        if(m1==m2){
            return address(0x0);
        }
        else if(m1==Move.ROCK&&
            m2==Move.SCISORS){
            return p1;
        }
        else if(m1==Move.PAPER&&
            m2==Move.ROCK){
            return p1;
        }
        else if(m1==Move.SCISORS&&
            m2==Move.PAPER){
            return p1;
        }
        else{
            return p2;
        }
        
    }

    //Extras
    function playEachOther(address _gameOwner,address _opponent) public payable returns (bool){
        privateNewGame(_gameOwner,msg.value);
        gameList[_gameOwner].opponent=_opponent;
        return true;
    }

    function betLastMove(address _gameOwner) public returns (bool){
        require(lastMove[msg.sender]!=Move.NONE,"You do not have any last move done");
        move(_gameOwner,lastMove[msg.sender]);
        return true;
    }

    //Proxy
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}