import React from "react";
import metamask_logo from "./metamask_logo.png";

function MetamaskAlert() {
    return (
        <div className="my-5 text-center">
            <h1>Please Install Metamask</h1>
            <img src={metamask_logo} className='mb-4' style={{width:'250'}} alt="Metamask logo"/>
            <a>Download here</a>
        </div>
    )
}

export default MetamaskAlert;