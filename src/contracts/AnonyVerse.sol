pragma solidity ^0.5.0;

contract AnonyVerse {
    string public name;
    uint256 public postCount = 0;

    struct Post {
        uint256 id;
        string content;
        uint256 tipAmount;
        address payable author;
    }

    mapping(uint256 => Post) public posts;

    constructor() public {
        name = "AnonyVerse";
    }

    event PostCreated(
        uint256 id,
        string content,
        uint256 tipAmount,
        address payable author
    );

    event PostTipped(
        uint256 id,
        string content,
        uint256 tipAmount,
        address payable author
    );

    function createPost(string memory _content) public {
        require(bytes(_content).length > 0);
        // Increment post count
        postCount++;
        // Create post
        posts[postCount] = Post(postCount, _content, 0, msg.sender);
        // Trigger event
        emit PostCreated(postCount, _content, 0, msg.sender);
    }

    function tipPost(uint256 _id) public payable {
        require(_id > 0 && _id <= postCount);
        // Fetch the post
        Post memory _post = posts[_id];
        // Fetch the author
        address payable _author = _post.author;
        // Pay the author by sending ether
        address(_author).transfer(msg.value);
        // Increment tip amount
        _post.tipAmount = _post.tipAmount + msg.value;
        // Update the post
        posts[_id] = _post;
        // Trigger an event
        emit PostTipped(postCount, _post.content, _post.tipAmount, _author);
    }
}
