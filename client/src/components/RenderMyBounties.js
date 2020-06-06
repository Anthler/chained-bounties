import React,{ Component } from "react";
import { loadWeb3, } from "../init";
import Bounty from "../contracts/Bounty.json";
import { Link } from "react-router-dom";
import { Label, Table, Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import Proposals from "./Proposals";

const deployedRinkebyAddress = "0x250D129F8b7037C0bf10fC44bff295C6e927b5d1";

class RenderMyBounties extends Component{

    state = {
        loading: false,
        description: '',
        instance: null,
        amount: null,
        status: null,
        proposalsCount: null,
        currentUser: '',
        status: '',
        winner: '',
        title: '',
        createdAt: null,
        proposals:[],
        isModalOpen: false,
    }

    componentDidMount = async () => {
        try {
            let instance, currentUser, web3;
                loadWeb3();
                web3 = window.web3;
                currentUser = await web3.currentProvider.selectedAddress
                instance = new web3.eth.Contract(
                Bounty.abi,
                this.props.bounty
                ); 
                const description = await instance.methods.description().call();
                const weiAmount = await instance.methods.amount().call();
                const createdAt = await instance.methods.createdAt().call();
                const ethAmount = window.web3.utils.fromWei(weiAmount, 'ether');
                const status = await instance.methods.bountyStatus().call();
                const winner = await instance.methods.winner().call();
                const title = await instance.methods.title().call();
                const proposals = await instance.methods.getProposals().call({from:currentUser});
                const proposalsCount = await instance.methods.proposalsCount().call();
                this.setState({currentUser,instance, proposals,title,winner,proposalsCount,description,createdAt,status, amount:ethAmount})
            } catch (error) {
            console.error(error);
            }
    }

    toggleModal = () => {
        this.setState({isModalOpen: !this.state.isModalOpen})
    }

    handleClose = async (id, e) => {
        try {
            const tx = await this.state.instance.methods.cancelBounty().send({from: this.state.currentUser});
            if(tx){
                window.location.reload()
            }
        } catch (error) {
            console.log(error)
        }
    }

    render(){
        let status,color; 
        if(Number(this.state.status) === 0){
            status = 'Open';
            color = 'green'
        }else if(Number(this.state.status) === 1){
            status = 'Closed';
            color = 'red'
        }else{
            status = 'Cancelled';
            color = 'orange'
        }
        return(
            <>
            <tr>
                {/* <th scope="row">1</th> */}
                <td>{this.state.title}</td>
                <td>{this.state.amount} ETH</td>
                <td style={{color}} >{status}</td>
                <td>{this.state.proposalsCount}</td>
                <td>{this.state.winner}</td>
                <td> 
                    <Link to={`/mybounties/${this.props.bounty}`}> 
                        <Button  color="primary"> 
                            Proposals
                        </Button> 
                    </Link>         
                </td>

                <td> 
                    <Button 
                        onClick={this.handleClose} 
                        className="btn btn-small" 
                        color="danger"
                    >
                     Close
                    </Button> 
                </td>

                 

                <Modal isOpen={this.state.descriptionModalOpen} toggle={this.toggleDescriptionModal} >
                    <ModalHeader>Bounty Description</ModalHeader>
                    <ModalBody>
                       <p> {this.state.description} </p>
                    </ModalBody>
                </Modal>
            </tr>

            <Modal isOpen={this.state.isModalOpen} toggle={this.toggleModal} >
                    <ModalHeader>Submitted Proposals</ModalHeader>
                    <ModalBody>
                    <Table>
                      <thead>
                        <tr>
                        <th>ID</th>
                        {/* <th>Submitter</th> */}
                        <th>LinkedIn</th>
                        <th>Message</th>
                        <th>Status</th>

                        </tr>
                    </thead>
                    <tbody>
                       {
                           this.state.proposals.map(proposal =>{
                              return(
                                   <tr key={proposal.id}>
                                        <td>{proposal.id}</td>
                                        <td>{proposal.linkedIn}</td>
                                        <td>{proposal.message}</td>
                                        <td>{proposal.status}</td>
                                   </tr>
                              )
                           })
                       }
                    </tbody>
                    </Table>
                    </ModalBody>
                </Modal>
                </>
        )
    }
}

export default RenderMyBounties;