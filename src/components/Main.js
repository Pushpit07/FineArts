import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Main extends Component {

    render() {
        return (
            <div className="container-fluid mt-2">
                <div className="row">
                    <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '700px' }}>
                        <div className="content mr-auto ml-auto">
                            <p>&nbsp;</p>
                            <form onSubmit={(event) => {
                                event.preventDefault();
                                const content = this.postContent.value;
                                this.props.createPost(content);
                            }}>
                                <div className="form-group mr-sm-2">
                                    <input
                                        id="postContent"
                                        type="text"
                                        ref={(input) => { this.postContent = input }}
                                        className="form-control input_box shadow-sm"
                                        placeholder="What do you want to share today?"
                                        autoComplete="off"
                                        required />
                                </div>
                                <input type="file" accept=".jpg, .jpeg, .png, .bmp, .gif, .mp4, .mkv, .ogg, .wmv" onChange={this.props.captureFile} className="upload mb-5 shadow" />
                                <button type="submit" className="btn btn-primary btn-block m-auto share_button shadow-sm" style={{ maxWidth: '300px' }}>Share</button>
                            </form>
                            <p className="mt-5">&nbsp;</p>
                            {this.props.posts.map((post, key) => {
                                return (
                                    <div className="card mb-4 background_dark p-2" key={key} >
                                        <div className="card-header">
                                            <img
                                                className='mr-2 identicon'
                                                width='21'
                                                height='21'
                                                src={`data:image/png;base64,${new Identicon(post.author.substr(5, 24), 20).toString()}`}
                                            />
                                            <small className="text_color">&nbsp;{post.author}</small>
                                        </div>
                                        <ul id="postList" className="list-group list-group-flush">
                                            <li className="list-group-item background_dark text_color">
                                                <p className="text-center">
                                                    <a href={`https://ipfs.infura.io/ipfs/${post.imgHash}`} target="_blank">
                                                        <img src={`https://ipfs.infura.io/ipfs/${post.imgHash}`} className="image" />
                                                    </a>
                                                    {/* <video src={`https://ipfs.infura.io/ipfs/${post.imgHash}`} className="image" controls /> */}
                                                </p>
                                                <p>{post.content}</p>
                                            </li>
                                            <li key={key} className="list-group-item py-2 background_dark">
                                                <small className="float-left mt-1 text-muted">
                                                    TIPS: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')} ETH
                                                </small>
                                                <button
                                                    className="btn btn-link btn-sm float-right pt-0 tip_btn"
                                                    name={post.id}
                                                    onClick={(event) => {
                                                        let tipAmount = window.web3.utils.toWei('0.1', 'Ether')
                                                        this.props.tipPost(event.target.name, tipAmount)
                                                    }}
                                                >
                                                    TIP 0.1 ETH
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )
                            })}
                        </div>
                    </main>
                </div>
            </div >
        );
    }
}

export default Main;
