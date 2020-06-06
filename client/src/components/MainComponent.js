import React, { Component } from "react";
import getWeb3 from "../getWeb3";
import { Route, Switch, Redirect } from "react-router-dom";
import MetamaskAlert from "./MetamaskAlert";
import Header from "./Header";
import Home from "./Home";
import NewBounty from "./NewBounty";
import PosterBounties from "./PosterBounties";
import Proposals from "./Proposals";
import {loadBlockchainData } from "../init";
import BountyFactory from "../contracts/BountyFactory.json";

const deployedRinkebyAddress = "0x250D129F8b7037C0bf10fC44bff295C6e927b5d1";

class Main extends Component {
  state = { 
    web3: null, 
    accounts: [], 
    instance: null, 
    metamaskInstalled: false,
    loading: false,
    bounties: [], 
  };

  componentDidMount = async () => {
    let instance, account, web3;
    try {
      const metamaskInstalled = typeof(window.web3) !== 'undefined' ;
      this.setState({metamaskInstalled});
      if(metamaskInstalled){
          web3 = await getWeb3();
          this.setState({web3})
          account = await window.web3.currentProvider.selectedAddress;
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = BountyFactory.networks[networkId];
          instance = new web3.eth.Contract(
            BountyFactory.abi,
            deployedNetwork && deployedNetwork.address
          );
          //instance =  new this.state.web3.eth.Contract(BountyFactory.abi,deployedRinkebyAddress);
          const bounties = await instance.methods.getBounties(10, 0).call({from: account});
          this.setState({instance,bounties,accounts:account}) 
      }
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {

    const ProposalSelected = ({match}) =>{
        return(
          <Proposals bounty={this.state.bounties.filter((address) => address === match.params.address)[0]} 
            address={match.params.address}/>
        )
    }

    let content;
    if (!this.state.metamaskInstalled) {
      return (<MetamaskAlert />)
    }else{
     
      return (
        <div className="">
          <Header />
          <Switch>
              <Route path="/home" component={Home}/>
              <Route path="/new" exact component={NewBounty} />
              <Route exact path="/mybounties" component={PosterBounties} />
              <Route path="/mybounties/:address" component={ProposalSelected} />
              <Redirect to="/home" />
          </Switch>
        </div>
      );
    }
  }
}

export default Main;
