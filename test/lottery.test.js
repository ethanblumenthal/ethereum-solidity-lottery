const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const { abi, evm } = require("../compile");
const bytecode = evm.bytecode.object;

const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts = [];
let lottery = null;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.00002", "ether"),
    });

    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[0] });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it("allows multiple accounts to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.00002", "ether"),
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.00002", "ether"),
    });

    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[0] });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(2, players.length);
  });

  it("requires a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0,
      });
      assert.fail("Entered with invalid amount of ether...");
    } catch (error) {
      assert.ok(error);
    }
  });

  it("allows only the manager to pick a winner", async () => {
    try {
      await lottery.methods.pickWinner().send({ from: account[1] });
      assert.fail("Non manager picked a winner...");
    } catch (error) {
      assert.ok(error);
    }
  });

  it("sends money to the winner and resets players", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.00002", "ether"),
    });

    const origBalance = await web3.eth.getBalance(accounts[1]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[1]);

    const winnings = finalBalance - origBalance;
    assert.equal(web3.utils.toWei("0.00002", "ether"), winnings);

    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[0] });
    assert.equal(players.length, 0);

    const contractBalance = await web3.eth.getBalance(lottery.options.address);
    assert.equal(contractBalance, 0);
  });
});
