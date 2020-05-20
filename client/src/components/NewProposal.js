import React, {Component} from "react";
import { loadWeb3, loadBlockchainData } from "../init";
import { Label, Form, Input,Button, FormGroup, Col } from "reactstrap";

class NewProposal extends Component{

    state = {
        currentUser: '',
        successful: false,
        web3: null,
        contract: null,
        id: null,
        link: '',
        createdAt: '',
        status: ''
    }

    async componentDidMount(){
        try {
            let web3, contract, currentUser;
            loadWeb3();
            contract = await loadBlockchainData()
            web3 = window.web3;
            currentUser = await web3.currentProvider.selectedAddress
            this.setState({web3,contract,web3,currentUser})
  
          } catch (error) {
            console.log(error.message)
          }
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        const {contract, currentUser, title, amount, description} = this.state
        const tx = await contract.methods.createNewBounty(window.web3.utils.toWei(amount),title, description).send({from: currentUser, value:window.web3.utils.toWei(amount)});
        if(tx){
            console.log('successfull' + tx)
        }
        
    }

    handleInputChange = (event) => {
        
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    render() {
        return(
            <div className="container" >
            <div className="row row-content">
                <div className="col-12">
                    <h3> Create A New Bounty</h3>
                </div>
                    <div className="col-12 col-md-9">
                        <Form onSubmit={this.handleSubmit}>
                            <FormGroup row>
                                <Label htmlFor="amount" md={2}>Amount</Label>
                                <Col md={9}>
                                    <Input type="text"  
                                        id="amount" 
                                        name="amount" 
                                        placeholder="Amount in ETH"
                                        value={this.state.amount}
                                        onChange={this.handleInputChange} 
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label htmlFor="title" md={2}>Title</Label>
                                <Col md={9}>
                                    <Input type="text"  
                                        id="title" 
                                        name="title" 
                                        placeholder="Enter a short title for your bounty"
                                        value={this.state.title}
                                        onChange={this.handleInputChange} 
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label htmlFor="description" md={2}>Description</Label>
                                <Col md={10}>
                                    <Input type="textarea" 
                                        rows="6" 
                                        id="description" 
                                        name="description" 
                                        placeholder="Description"
                                        value={this.state.description}
                                        onChange={this.handleInputChange} 
                                    />

                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col md={{size:10, offset:2}}>
                                    <Button type="submit" color="primary" >Submit</Button>
                                </Col>
                            </FormGroup>
                        </Form>
                    </div>
                </div>
            </div>
        )
    }
    
}

export default NewProposal;