import React, {Component} from "react";
import Bounty from "../contracts/Bounty.json";
import { loadWeb3 } from "../init";
import { Card,Button, CardText, CardTitle, Modal, ModalHeader,ModalBody,Form, FormGroup, Label, Input } from "reactstrap";

function RenderCard({amount,description,toggleModal,isModalOpen,proposalsCount,title,status,createdat, toggleDescriptionModal, descriptionModalOpen}){
        return(
            <div className="col-md-4 mb-4">
                <Card style={{maxWidth: "250px"}} body outline color="success">
                <CardTitle><strong>{title}</strong></CardTitle>
                <CardText style={{color: "#697477"}}>Amount: {amount} ETH</CardText>
                <CardText style={{color: "#697477"}}>Status: {status}</CardText>
                <CardText style={{color: "#697477"}}>Proposals Count: {proposalsCount}</CardText>
                <CardText style={{color: "green"}}>Date Created: {createdat}</CardText>
                <Button type="button" onClick={toggleDescriptionModal} style={{marginBottom:'4px'}} color="btn btn-outline-info">See Description</Button>
                <Button type="button" onClick={toggleModal} color="btn btn-success">Submit Proposal</Button>
                </Card>
            </div>
        );     
}

class BountyCard extends Component{

    state = {
        status: null,
        description: '',
        amount: '',
        isLoading: false,
        amount: '',
        createdAt: null,
        title: '',
        currentUser: '',
        proposalsCount: null,
        proposals: [],
        isModalOpen: false,
        proposallink: '',
        descriptionModalOpen:false,
    }

    componentDidMount = async () => {

        let instance, currentUser, web3;
        try {
                loadWeb3();
                web3 = window.web3;
                currentUser = await web3.currentProvider.selectedAddress

                instance = new web3.eth.Contract(Bounty.abi,this.props.bounty);

                const status = await instance.methods.bountyStatus().call();
                const description = await instance.methods.description().call();
                const weiAmount = await instance.methods.amount().call();
                const timestamp = await instance.methods.createdAt().call();
                const d = new Date(Number(timestamp)*1000);
                const toDate = d.getDate();
                const toMonth = d.getMonth();
                const toYear = d.getFullYear();
                const createdAt = toDate + ' / '+ toMonth + ' / ' + toYear
                const title = await instance.methods.title().call();
                const ethAmount = window.web3.utils.fromWei(weiAmount, 'ether');
                const proposalsCount = await instance.methods.proposalsCount().call();
                this.setState({currentUser,instance,proposalsCount, status,description,createdAt,title, amount:ethAmount})
        
            } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
            }
    }

    toggleModal = () => {
        this.setState({isModalOpen: !this.state.isModalOpen});
    }

    toggleDescriptionModal = () => {
        this.setState({descriptionModalOpen: !this.state.descriptionModalOpen});
    }

    handleModalSubmit = async (e) =>{
        this.toggleModal();
        e.preventDefault();
        const tx = await this.state.instance.methods.makeProposal(this.linkedIn.value,this.message.value).send({from:this.state.currentUser});
        if(tx){
            window.location.reload();
        }
        
    }

    render() {

        let status; 
        if(Number(this.state.status) === 0){
            status = 'Open';
        }else if(Number(this.state.status) === 1){
            status = 'Closed';
        }else{
            status = 'Cancelled';
        }

        return(
            <>
                    <RenderCard 
                        status={status}
                        description={this.state.description}
                        amount={this.state.amount}
                        createdat={this.state.createdAt}
                        proposalsCount={this.state.proposalsCount}
                        title={this.state.title}
                        toggleModal={this.toggleModal}
                        isModalOpen={this.state.isModalOpen}
                        toggleDescriptionModal={this.toggleDescriptionModal}
                        descriptionModalOpen={this.state.descriptionModalOpen}
                    />
                <Modal isOpen={this.state.isModalOpen} toggle={this.toggleModal} >

                    <ModalHeader>Submit Proposal</ModalHeader>

                    <ModalBody>
                        <Form onSubmit={this.handleModalSubmit} >
                            <FormGroup>
                                <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                                <Input name="linkedIn"
                                    type="text" 
                                    id="linkedIn"
                                    placeholder="Provide your linked in profile url"
                                    innerRef={(input) => this.linkedIn = input}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="message">Message</Label>
                                <Input name="message"
                                    type="textarea"
                                    rows="6" 
                                    id="message"
                                    placeholder="Send a short message to bounty created"
                                    innerRef={(input) => this.message = input}
                                />
                            </FormGroup>
                            <Button className="btn btn-small btn-success">Submit</Button>
                        </Form>
                    </ModalBody>
                </Modal>
                
                
                <Modal isOpen={this.state.descriptionModalOpen} toggle={this.toggleDescriptionModal} >
                    <ModalHeader>Bounty Description</ModalHeader>
                    <ModalBody>
                       <p> {this.state.description} </p>
                    </ModalBody>
                </Modal>
            </>
        )
    }
    
}

export default BountyCard;