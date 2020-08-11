import React, {Component  } from "react";
import {Navbar, NavbarBrand, Nav, NavbarToggler, NavItem, Collapse, Jumbotron} from "reactstrap";
import { NavLink } from "react-router-dom";

class Header extends Component{

    state = {
        navbarIsOpen: false,
    }

    toggleNavbar = () => {
        this.setState({navbarIsOpen: !this.state.navbarIsOpen} )
    }

    render(){
        return(
            <React.Fragment>
                <Navbar dark expand="md">
                    <div className="container">
                        <NavbarToggler onClick={this.toggleNavbar} />
                        <Collapse navbar isOpen={this.state.navbarIsOpen}>
                        <Nav navbar >
                            <NavItem>
                                <NavLink className="nav-link" to="/home">
                                    Home
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/mybounties" >
                                    My Bounties
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/new" >
                                    New Bounty
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                    </div>
                </Navbar>
                <Jumbotron className="jumbotron">
                    <div className="container" >
                        <div className="row row-header">
                            <div className="col-12 col-sm-6">
                                <h1>DAPPY BOUNTIES</h1>
                                <p>Work on bounties and get paid in cryptocurrencies</p>
                            </div>
                        </div>
                    </div>
                </Jumbotron>
                
            </React.Fragment>
        )
    }
}

export default Header;