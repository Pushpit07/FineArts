const { assert } = require("chai");
const { default: Web3 } = require("web3");

const AnonyVerse = artifacts.require("AnonyVerse");

require("chai").use(require("chai-as-promised")).should();

contract('AnonyVerse', ([deployer, author, tipper]) => {
    let anonyVerse;

    before(async () => {
        anonyVerse = await AnonyVerse.deployed();
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await anonyVerse.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })

        it('has a name', async () => {
            const name = await anonyVerse.name();
            assert.equal(name, 'AnonyVerse');
        })
    })

    describe('posts', async () => {
        let result, postCount;

        before(async () => {
            result = await anonyVerse.createPost('This is my first post', { from: author });
            postCount = await anonyVerse.postCount();
        })

        it('creates posts', async () => {
            // Success
            assert.equal(postCount, 1);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(event.content, 'This is my first post', 'content is correct');
            assert.equal(event.tipAmount, '0', 'tip amount is correct');
            assert.equal(event.author, author, 'author is correct');
            // Failure: Post must have content
            await anonyVerse.createPost('', { from: author }).should.be.rejected;
        })

        it('lists posts', async () => {
            const post = await anonyVerse.posts(postCount);
            assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(post.content, 'This is my first post', 'content is correct');
            assert.equal(post.tipAmount, '0', 'tip amount is correct');
            assert.equal(post.author, author, 'author is correct');
        })

        it('allows users to tip posts', async () => {
            let oldAuthorBalance
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

            result = await anonyVerse.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') });

            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(event.content, 'This is my first post', 'content is correct');
            assert.equal(event.tipAmount, web3.utils.toWei('1', 'Ether'), 'tip amount is correct');
            assert.equal(event.author, author, 'author is correct');

            // Check that author received funds
            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            let tipAmount
            tipAmount = web3.utils.toWei('1', 'Ether')
            tipAmount = new web3.utils.BN(tipAmount)

            const exepectedBalance = oldAuthorBalance.add(tipAmount)

            assert.equal(newAuthorBalance.toString(), exepectedBalance.toString())

            // FAILURE: Tries to tip a post that does not exist
            await anonyVerse.tipPost(99, { from: tipper, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
        })
    })
});