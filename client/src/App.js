import React, { Component } from "react";
import web3 from "./web3";
import lottery from "./lottery";

class App extends Component {
  state = {
    manager: "",
    players: [],
    balance: "",
    value: "",
    message: "",
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
  }

  onSubmit = async (event) => {
    event.preventDefault();

    if (this.state.value > 0) {
      this.setState({
        message:
          "Please enter the amount of Ether you wish to send. (Must be more than 0.)",
      });
      return;
    }

    const accounts = await web3.eth.getAccounts();
    this.setState({ message: "Waiting on transaction..." });

    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, "ether"),
      });

      this.setState({ message: "You're now entered!" });
    } catch (error) {
      this.setState({ message: "You declined to enter. Please try again." });
    }
  };

  onClick = async () => {
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: "Picking a winner..." });

    try {
      await lottery.methods.pickWinner().send({ from: accounts[0] });
    } catch (error) {
      this.setState({
        message:
          "Either you aren't the manager, or you declined the transaction.",
      });
    }
  };

  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}.</p>
        <p>
          There are currently {this.state.players.length} people competing to
          win {web3.utils.fromWei(this.state.balance, "ether")} Ether.
        </p>
        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of Ether to enter: </label>
            <input
              type="number"
              value={this.state.value}
              onChange={(event) => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr />
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>
        <hr />
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
