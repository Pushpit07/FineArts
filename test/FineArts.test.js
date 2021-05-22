const { assert } = require("chai");

const FineArts = artifacts.require("FineArts");

require("chai").use(require("chai-as-promised")).should();

contract('FineArts', ([deployer, author, tipper]) => {
    let fineArts;

    before(async () => {
        fineArts = await FineArts.deployed();
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await fineArts.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })

        it('has a name', async () => {
            const name = await fineArts.name();
            assert.equal(name, 'FineArts');
        })
    })

    describe('posts', async () => {
        let result, postCount;
        const imgHash = 'QmcCsWPtYEEsVtQ58FSiKwuVk3JHDefJ3XNrAbfVUF9y7A';

        before(async () => {
            result = await fineArts.createPost(imgHash, 'This is my first post', { from: author });
            postCount = await fineArts.postCount();
        })

        it('creates posts', async () => {
            // Success
            assert.equal(postCount, 1);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(event.imgHash, imgHash, 'hash is correct');
            assert.equal(event.content, 'This is my first post', 'content is correct');
            assert.equal(event.tipAmount, '0', 'tip amount is correct');
            assert.equal(event.author, author, 'author is correct');
            // Failure: Post must have hash
            await fineArts.createPost('', 'Content', { from: author }).should.be.rejected;
            // Failure: Post must have content
            await fineArts.createPost('sample123hash', '', { from: author }).should.be.rejected;
        })

        it('lists posts', async () => {
            const post = await fineArts.posts(postCount);
            assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(post.imgHash, imgHash, 'hash is correct');
            assert.equal(post.content, 'This is my first post', 'content is correct');
            assert.equal(post.tipAmount, '0', 'tip amount is correct');
            assert.equal(post.author, author, 'author is correct');
        })

        it('allows users to tip posts', async () => {
            let oldAuthorBalance
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

            result = await fineArts.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') });

            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(event.imgHash, imgHash, 'hash is correct');
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
            await fineArts.tipPost(99, { from: tipper, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
        })
    })
});