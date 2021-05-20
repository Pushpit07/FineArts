import React, { Component } from 'react';
import Web3 from 'web3';
// import Identicon from 'identicon.js';
import './App.css';
import AnonyVerse from '../abis/AnonyVerse.json'
import Navbar from './Navbar'
// import Main from './Main'

class App extends Component {

	constructor(props) {
		super(props)
		this.state = {
			account: '',
			anonyVerse: null,
			postCount: 0,
			posts: [],
			loading: true
		}

		this.createPost = this.createPost.bind(this)
		this.tipPost = this.tipPost.bind(this)
	}

	async componentWillMount() {
		await this.loadWeb3()
		await this.loadBlockchainData()
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
		const networkData = AnonyVerse.networks[networkId]
		if (networkData) {
			const anonyVerse = web3.eth.Contract(AnonyVerse.abi, networkData.address)
			this.setState({ anonyVerse })
			const postCount = await anonyVerse.methods.postCount().call()
			this.setState({ postCount })
			// Load Posts
			for (var i = 1; i <= postCount; i++) {
				const post = await anonyVerse.methods.posts(i).call()
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
			window.alert('AnonyVerse contract not deployed to detected network.')
		}
	}

	createPost(content) {
		this.setState({ loading: true })
		this.state.socialNetwork.methods.createPost(content).send({ from: this.state.account })
			.once('receipt', (receipt) => {
				this.setState({ loading: false })
			})
	}

	tipPost(id, tipAmount) {
		this.setState({ loading: true })
		this.state.socialNetwork.methods.tipPost(id).send({ from: this.state.account, value: tipAmount })
			.once('receipt', (receipt) => {
				this.setState({ loading: false })
			})
	}


	render() {
		return (
			<div>
				<Navbar account={this.state.account} />
				<div className="container-fluid mt-5">
					<div className="row">
						<main role="main" className="col-lg-12 d-flex text-center">
							<div className="content mr-auto ml-auto">
								<h1>AnonyVerse</h1>
								<p>
									A <code>decentralised social media</code> platform
                				</p>
							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
