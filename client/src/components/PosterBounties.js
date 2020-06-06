import React, {Component} from "react";
import { loadWeb3, loadBlockchainData } from "../init";
import { Table, Button,} from "reactstrap";
import RenderMyBounties from "./RenderMyBounties";
import { Link } from "react-router-dom";
import BountyFactory from "../contracts/BountyFactory.json";

const deployedRinkebyAddress = "0x250D129F8b7037C0bf10fC44bff295C6e927b5d1";

class PosterBounties extends Component{

    state = {
        currentUser:'',
        userBounties:[],
        loading: false,
        isOwner:false,
        web3: null,
        instance: null,
    }

    async componentDidMount(){
            let web3, instance, currentUser;
            try {
                loadWeb3();
                this.setState({loading:true})
                web3 = window.web3;
                const networkId = await web3.eth.net.getId();
                const deployedNetwork = BountyFactory.networks[networkId];

                instance = new web3.eth.Contract(
                    BountyFactory.abi,
                    deployedNetwork && deployedNetwork.address
                );
                //instance = new web3.eth.Contract(BountyFactory.abi, deployedRinkebyAddress)
                currentUser = await web3.currentProvider.selectedAddress
                this.setState({currentUser,web3, instance});
                let userBounties = await instance.methods.getMyBounties().call({from: currentUser})
                if(userBounties){
                    this.setState({loading:false, userBounties})
                }
            } catch (error) {
               console.log(error) 
            }
    }

    getIsOwner = async () =>{
        try {
            const isOwner = await this.state.instance.methods.isBountyOwner(this.state.currentUser).call({from:this.state.currentUser}) 
            if(!isOwner) return false;
        } catch (error) {
            console.log(error.message)
            this.setState({errMessage: 'You do not have any bounties created yet'});
        }
    }

    render = () => {
        if(this.state.loading){
            return(
                 <div className="container text-center">
                    <div className="row">
                        <div className="col col-md-4 offset-4">
                            <h2>Loading . . .</h2>
                        </div>
                </div>
                </div>
            )
        }else if(this.state.userBounties.length === 0 && !this.state.loading){
            return(
                <div className="container">
                    <div className="row">
                        <div className="col col-md-5 offset-4">
                            <h3>You do not have any bounties yet</h3>
                            <br /> <br />
                            <Link to="/new">
                                <Button className="btn btn-small" color="success">Create New Bounty</Button> 
                            </Link>
                        </div>
                    </div>
                </div>
            )
        }else{
            return(
            
            <div className="container" >
            <div className="row row-content">
                <div className="col-12">
                    <h3>Your Bounties</h3>
                </div>
                    <div className="col-12 col-md-9">
                    <Table>
                      <thead>
                        <tr>
                        <th>Title</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th># Proposals</th>
                        <th>Winner </th>
                        </tr>
                        </thead>
                    
                        <tbody>
                            
                            {
                                this.state.userBounties.map(bounty =>{
                                return (
                                        <RenderMyBounties 
                                            bounty={bounty} 
                                            key={bounty} 
                                            user={this.state.currentUser}
                                            isOwner={this.state.isOwner}
                                        />  
                                    )
                                })
                            }
                            
                        </tbody>
                    </Table>
                    </div>
                </div>
            </div>
        )} 
    } 
}

export default PosterBounties;