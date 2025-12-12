// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemeNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    event Minted(uint256 indexed tokenId, address indexed creator, string uri, uint256 timestamp);

    constructor() ERC721("BasedMeme", "BMEME") Ownable(msg.sender) {}

    function mint(address to, string memory uri) public {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit Minted(tokenId, msg.sender, uri, block.timestamp);
    }
}
