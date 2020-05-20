import React, {Component} from "react";
import { Breadcrumb, Button, BreadcrumbItem, Table} from "reactstrap";
import Bounty from "../contracts/Bounty.json";
import { loadWeb3 } from "../init";
import { Link } from "react-router-dom";

class Proposals extends Component{

    state = {
        bounty: null,
        proposals: [],
        loading:false,
        address: '',
        instance: null,
        bountyPoster: '',
        currentUser:'',
    }

    componentDidMount = async () => {
        this.setState({loading:true})
        const {bounty, address} = this.props;
        let instance, currentUser, web3;
            loadWeb3();
            web3 = window.web3;
            currentUser = await web3.currentProvider.selectedAddress;
        instance = new web3.eth.Contract(Bounty.abi,address);
        const proposals = await instance.methods.getProposals().call({from:currentUser});
        const proposal = await instance.methods.getProposal(1).call({from:currentUser});
        const bountyPoster = await instance.methods.poster().call();

       this.setState({proposals,bounty,currentUser, bountyPoster ,instance, loading:false})   
    }

    handleAccept = async (id, e) => {
        try {
            const tx = await this.state.instance.methods.acceptProposal(id).send({from: this.state.currentUser});
            if(tx){
                window.location.reload()
            }
        } catch (error) {
            console.log(error)
        }
    }

    handleReject = async (id, e) => {
        try {
            const tx = await this.state.instance.methods.rejectProposal(id).send({from: this.state.currentUser});
            if(tx){
                window.location.reload()
            }
        } catch (error) {
            console.log(error)
        }
    }

    render(){

        const {loading, Proposals} = this.state;

        let content ;

        if(!loading){
            content =<Table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            {/* <th>Submitter</th> */}
                            <th>LinkedIn</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Actions</th>

                        </tr>
                    </thead>
                    <tbody>
                       {
                           this.state.proposals.map(proposal =>{
                              return(
                                   <tr key={proposal.id}>
                                        <td>{proposal.id}</td>
                                        {/* <td>{proposal.submitter}</td> */}
                                        <td>{proposal.linkedIn}</td>
                                        <td>{proposal.message}</td>
                                        <td>{Number(proposal.status) === 0 ? 'Pending': Number(proposal.status) === 1 ? 'Accepted': Number(proposal.status) === 2 ? 'Rejected': 'Unknown'  }</td>
                                        <td><Button 
                                            onClick={(e) => this.handleAccept(proposal.id, e)} 
                                            className="btn btn-small" 
                                            color="primary"
                                        >Accept</Button></td>
                                        <td><Button 
                                            onClick={(e) => this.handleReject(proposal.id, e)} 
                                            className="btn btn-small" 
                                            color="danger"
                                        >
                                            Reject
                                        </Button></td>
                                   </tr>
                              )
                           })
                       }
                    </tbody>
                    </Table>
            
        }
        else if(this.props.bounty){
            content = <div>There's proposals</div>
        }
        return(
            <div className="container">
                <div className="row">
                    <Breadcrumb>
                            <BreadcrumbItem> <Link to="/mybounties" > Go Back </Link> </BreadcrumbItem>
                            <BreadcrumbItem active> Proposals</BreadcrumbItem>
                        </Breadcrumb>
                </div>
                <div className="row">
                    <h4> Sumitted Proposals for Bounty : {this.props.bounty} </h4>
                </div>
                <div className="row">
                    {content}
                </div>
            </div>
        )
    }

}

export default Proposals;