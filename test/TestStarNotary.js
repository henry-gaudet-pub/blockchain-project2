const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;
var starId = 0;
var contractName = 'StarNotary';

contract(contractName, (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', starId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(starId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    starId++;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    starId++;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    starId++;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    starId++;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    starId++;
    await instance.createStar(`Star ${starId}`, starId, {from: accounts[1]});

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let name = await instance.name();
    assert.equal(name, contractName);
    let symbol = await instance.symbol();
    assert.equal(symbol, 'STAR')
});


it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let instance = await StarNotary.deployed();
    let star1 = ++starId;
    await instance.createStar(`Star ${star1}`, star1, {from: accounts[1]});
    let star2 = ++starId;
    await instance.createStar(`Star ${star2}`, star2, {from: accounts[2]});
    let owner1 = await instance.ownerOf.call(star1);
    let owner2 = await instance.ownerOf.call(star2);

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    var result = await instance.exchangeStars(star1, star2, {from: accounts[1]});

    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(star1), owner2);
    assert.equal(await instance.ownerOf.call(star2), owner1);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    starId++;
    await instance.createStar(`Star ${starId}`, starId, {from: accounts[1]});
    
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(accounts[2], starId, {from: accounts[1]});
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(starId), accounts[2]);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    starId++;
    await instance.createStar(`Star ${starId}`, starId, {from: accounts[1]});

    // 2. Call your method lookUptokenIdToStarInfo
    let starName = await instance.lookUptokenIdToStarInfo(starId);

    // 3. Verify if you Star name is the same
    assert.equal(starName, `Star ${starId}`)
});