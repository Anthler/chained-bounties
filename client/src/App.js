import React, { Component } from "react";
//import BountyFactory from "./contracts/BountyFactory.json";
//import getWeb3 from "./getWeb3";
import { BrowserRouter} from "react-router-dom";
//import Web3 from "web3";
import MetamaskAlert from "./components/MetamaskAlert";
import Main from './components/MainComponent'

import "./App.css";

class App extends Component {

  render() {

    return (

        <BrowserRouter>
        <div className="App">
          <Main />
        </div>
      </BrowserRouter>

    );
  }
}

export default App;
