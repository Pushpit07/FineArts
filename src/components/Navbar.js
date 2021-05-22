import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Navbar extends Component {

    render() {
        return (
            <nav className="navbar navbar-light fixed-top shadow-lg navbaar" style={{
                height: "60px"
            }
            }>
                <span className="navbar-brand mb-0 h1 finearts ml-3 cursor_ptr"><i className="fas fa-icons mr-3 ml-1 cursor_ptr"></i>Fine Arts</span>

                <ul className="navbar-nav px-3">
                    <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                        <small className="mr-4 text_color">
                            <small id="account">{this.props.account}</small>
                        </small>

                        {this.props.account
                            ? <img
                                className="ml-1 mr-3 identicon"
                                width='25'
                                height='25'
                                src={`data:image/png;base64,${new Identicon(this.props.account.substr(5, 24), 40).toString()}`}
                                alt=""
                            />
                            : <span></span>
                        }

                    </li>
                </ul>
            </nav >
        );
    }
}

export default Navbar;