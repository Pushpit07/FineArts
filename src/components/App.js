import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import FineArts from '../abis/FineArts.json';
import Navbar from './Navbar';
import Main from './Main';

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

class App extends Component {

	constructor(props) {
		super(props)
		this.state = {
			account: '',
			anonyVerse: null,
			postCount: 0,
			posts: [],
			buffer: '',
			loading: true
		}

		this.createPost = this.createPost.bind(this)
		this.tipPost = this.tipPost.bind(this)
	}

	async componentWillMount() {
		await this.loadWeb3();
		await this.loadBlockchainData();
	}

	async loadWeb3() {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum)
			await window.ethereum.enable()
		}
		else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider)
		}
		else {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
		}
	}

	async loadBlockchainData() {
		const web3 = window.web3
		// Load account
		const accounts = await web3.eth.getAccounts()
		this.setState({ account: accounts[0] })
		// Network ID
		const networkId = await web3.eth.net.getId()
		const networkData = FineArts.networks[networkId]
		if (networkData) {
			const fineArts = web3.eth.Contract(FineArts.abi, networkData.address)
			this.setState({ fineArts })
			const postCount = await fineArts.methods.postCount().call()
			this.setState({ postCount })
			// Load Posts
			for (var i = 1; i <= postCount; i++) {
				const post = await fineArts.methods.posts(i).call()
				this.setState({
					posts: [...this.state.posts, post]
				})
			}
			// Sort posts. Show highest tipped posts first
			this.setState({
				posts: this.state.posts.sort((a, b) => b.tipAmount - a.tipAmount)
			})
			this.setState({ loading: false })
		} else {
			window.alert('FineArts contract not deployed to detected network.')
		}
	}

	captureFile = event => {
		event.preventDefault();
		const file = event.target.files[0];
		const reader = new window.FileReader();
		reader.readAsArrayBuffer(file);

		reader.onloadend = () => {
			this.setState({ buffer: Buffer(reader.result) });
			console.log('buffer', this.state.buffer);
		}
	}

	createPost(content) {
		ipfs.add(this.state.buffer, (error, result) => {
			console.log('ipfsResult', result);
			if (error) {
				console.error(error);
				return;
			}

			this.setState({ loading: true })
			this.state.fineArts.methods.createPost(result[0].hash, content).send({ from: this.state.account })
				.on('transactionHash', (hash) => {
					this.setState({ loading: false })
				})
		})
	}

	tipPost(id, tipAmount) {
		this.setState({ loading: true })
		this.state.fineArts.methods.tipPost(id).send({ from: this.state.account, value: tipAmount })
			.on('transactionHash', (hash) => {
				this.setState({ loading: false })
			})
	}


	render() {
		return (
			<div>
				<Navbar account={this.state.account} />
				<div className="container-fluid mt-5">
					<div className="row">
						<main role="main" className="col-lg-12 d-flex text-center mt-5">
							<div className="content mr-auto ml-auto mt-4">
								<h1>Fine Arts</h1>
								<p>
									A &nbsp;<code className="purple_text">decentralised</code>&nbsp; platform to get &nbsp;<code className="purple_text">value for content</code>
								</p>
							</div>
						</main>
					</div>
				</div>
				{ this.state.loading
					? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
					: <Main
						posts={this.state.posts}
						createPost={this.createPost}
						tipPost={this.tipPost}
						captureFile={this.captureFile}
					/>
				}
			</div>
		);
	}
}

export default App;
