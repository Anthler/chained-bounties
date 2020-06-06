import React, { Component } from "react";
import getWeb3 from "../getWeb3";
import { loadBlockchainData, loadWeb3 } from "../init";
import BountyFactory from "../contracts/BountyFactory.json";
import BountyCard from "./BountyCard";

const deployedRinkebyAddress = "0x250D129F8b7037C0bf10fC44bff295C6e927b5d1";

class Home extends Component{

    state = {
      currentUser: '',
      bounties: [],
      web3: null,
      instance: null,
      loading: false,
    }

    componentDidMount = async() => {
      let web3, instance, currentUser;
        try {
          this.setState({loading: true})
          loadWeb3();
          web3 = window.web3;
          this.setState({web3})
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = BountyFactory.networks[networkId];

          instance = new web3.eth.Contract(
            BountyFactory.abi,
            deployedNetwork && deployedNetwork.address
          );
          //instance = new web3.eth.Contract(BountyFactory.abi, deployedRinkebyAddress)
          currentUser = await web3.currentProvider.selectedAddress;
          const bounties = await instance.methods.getBounties(10, 0).call({from: currentUser})
          if(bounties){
            this.setState({loading: false})
          }
          this.setState({ web3, instance, bounties, currentUser})
        } catch (error) {
          console.log(error)
        }
    }

   render() {

     const bounty = this.state.bounties.map(bounty =>{
          return(<BountyCard key={bounty} bounty={bounty}/>)
      })

      if(this.state.loading){
        return (
          <div className="container d-flex flex-column justify-content-between">
            <div className="row">
               <div className="col col-md-4 offset-4"><h1> Loading . . .</h1> </div>
            </div>
         </div>
        )
      }else if(!this.state.loading && this.state.bounties.length === 0){
        return (
          <div className="container d-flex flex-column justify-content-between">
            <div className="row">
               <div className="col col-md-4 offset-4"><h1>N0 BOUNTIES</h1> </div>
            </div>
         </div>
        )
      }
      else{
        return (
        <div className="container d-flex flex-column justify-content-between">
          <div className="row">
            <div className="col-md-6 offset-3 mb-5">
              <h2>BOUNTIES</h2>
            </div>
          </div>
          <div className="row">
            { bounty }
          </div>
        </div>
    );
      }
  }
}

export default Home;