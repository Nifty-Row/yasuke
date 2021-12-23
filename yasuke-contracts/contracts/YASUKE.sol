//SPDX-License-Identifier: MIT-0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/math/SafeMath.sol';
import './library/console.sol';
import './library/models.sol';
import './interfaces/StorageInterface.sol';
import './interfaces/YasukeInterface.sol';

// TODO: Calculate Fees
contract Yasuke is YasukeInterface {
    using SafeMath for uint256;
    address internal minter;

    StorageInterface internal store;

    constructor(address storeAddress) {
        minter = msg.sender;
        store = StorageInterface(storeAddress);
        store.setAdmin(address(this), msg.sender);
    }

    function upgrade(address storeAddress) public {
        store = StorageInterface(storeAddress);
        store.setAdmin(address(this), msg.sender);
    }

    function testUpgrade() public view returns (address, address) {
        require(store.echo(), 'UF');
        return (store.getAdmin(), store.getParent());
    }

    function startAuction(
        uint256 tokenId,
        uint256 auctionId,
        uint256 startBlock,
        uint256 endBlock,
        uint256 currentBlock,
        uint256 sellNowPrice,
        uint256 minimumBid
    ) public override {
        require(!store.isInAuction(tokenId), 'AIP');
        require(!store.isStarted(tokenId, auctionId), 'AAS');
        Models.AuctionInfo memory ai = Models.AuctionInfo(
            auctionId,
            tokenId,
            msg.sender,
            startBlock,
            endBlock,
            currentBlock,
            sellNowPrice,
            address(0),
            0,
            false,
            minimumBid,
            store.getBidders(tokenId, auctionId),
            store.getBids(tokenId, auctionId),
            true,
            false,
            false
        );
        store.startAuction(ai, msg.sender);
    }

    function issueToken(
        uint256 tokenId,
        address payable owner,
        string memory _uri,
        string memory _name,
        string memory _symbol
    ) public override {
        store.addToken(tokenId, owner, _uri, _name, _symbol);
        store.setOwner(tokenId, owner);
    }

    function endBid(uint256 tokenId, uint256 auctionId) public {
        shouldBeStarted(tokenId, auctionId);
        store.setEndBlock(tokenId, auctionId, block.number); // forces the auction to end
    }

    function placeBid(uint256 tokenId, uint256 auctionId) public payable override {
        shouldBeStarted(tokenId, auctionId);
        require(msg.value > 0, 'CNB0');
        require(msg.sender != store.getOwner(tokenId), 'OCB');

        uint256 sellNowPrice = store.getSellNowPrice(tokenId, auctionId);

        uint256 newBid = msg.value;

        /**
            TODO: The frontend needs to know about this.  
            1. Add a new field to AuctionInfo that is set to true when the newBid >= sellNowPrice
            2. Set  highest bidder and highest bid  
         */
        if (newBid >= sellNowPrice && sellNowPrice != 0) {
            store.setEndBlock(tokenId, auctionId, block.number - 1); // forces the auction to end

            // refund bidder the difference if any
            uint256 difference = newBid.sub(sellNowPrice);
            if (difference > 0) {
                (bool sent, ) = payable(msg.sender).call{value: difference}('');
                require(sent, 'BFMB');
            }

            // bid should now be max bid
            newBid = sellNowPrice;
            store.setSellNowTriggered(tokenId, auctionId, true);
        } else {
            require(newBid > store.getHighestBid(tokenId, auctionId), 'BTL');
        }

        // get current highest bidder and highest bid
        address payable highestBidder = payable(store.getHighestBidder(tokenId, auctionId));
        uint256 highestBid = store.getHighestBid(tokenId, auctionId);

        // refund highest bidder their bid
        if (highestBidder != address(0)) {
            // this is the not first bid
            (bool sent, ) = payable(highestBidder).call{value: highestBid}('');
            require(sent, 'HBRF');
        }

        store.setHighestBidder(tokenId, auctionId, msg.sender);
        store.setHighestBid(tokenId, auctionId, newBid);
        store.addBidder(tokenId, auctionId, msg.sender);
        store.addBid(tokenId, auctionId, newBid);

        emit LogBid(msg.sender, newBid);

        if (newBid >= sellNowPrice && sellNowPrice != 0) {
            _withdrawal(tokenId, auctionId, true);
        }
    }

    function _withdrawal(uint256 tokenId, uint256 auctionId, bool withdrawOwner) internal {
        require(store.isStarted(tokenId, auctionId), 'BANS');
        require(block.number > store.getEndBlock(tokenId, auctionId) || store.isCancelled(tokenId, auctionId), 'ANE');
        bool cancelled = store.isCancelled(tokenId, auctionId);
        address owner = store.getOwner(tokenId);
        address highestBidder = store.getHighestBidder(tokenId, auctionId);

        if (cancelled) {
            // owner can not withdraw anything
            require(msg.sender != owner, 'AWC');
        }

        if (msg.sender == owner) {
            // withdraw funds from highest bidder
            _withdrawOwner(tokenId, auctionId);
        } else if (msg.sender == highestBidder) {
            // transfer the token from owner to highest bidder
            store.changeTokenOwner(tokenId, owner, highestBidder);

            // withdraw owner
            if(withdrawOwner) {
                _withdrawOwner(tokenId, auctionId);
            }
            store.setInAuction(tokenId, false); // we can create new auction
            store.setOwner(tokenId, highestBidder);
            store.setFinished(tokenId, auctionId, true);
            store.setStarted(tokenId, auctionId, false);
            store.setHighestBidder(tokenId, auctionId, address(0));
            store.setHighestBid(tokenId, auctionId, 0);
        }

        emit LogWithdrawal(msg.sender, tokenId, auctionId);
    }

    function _withdrawOwner(uint256 tokenId, uint256 auctionId) internal {
        address payable owner = payable(store.getOwner(tokenId));

        uint256 withdrawalAmount = store.getHighestBid(tokenId, auctionId);

        if (withdrawalAmount == 0) {
            return;
        }

        store.setHighestBid(tokenId, auctionId, 0);

        // we have to take fees
        uint256 xfp = store.getXendFeesPercentage();
        uint256 ifp = store.getIssuerFeesPercentage();

        if (store.getIssuer(tokenId) == owner) {
            // owner is issuer, xendFees is xendFees + issuerFees
            xfp = store.getXendFeesPercentage().add(store.getIssuerFeesPercentage());
            ifp = 0;
        }

        uint256 xendFees = (xfp.mul(withdrawalAmount)).div(100);
        uint256 issuerFees = (ifp.mul(withdrawalAmount)).div(100);

        withdrawalAmount = withdrawalAmount.sub(xendFees).sub(issuerFees);

        if (issuerFees > 0) {
            (bool sent, ) = payable(store.getIssuer(tokenId)).call{value: issuerFees}('');
            require(sent, 'CNSTI');
        }

        if (xendFees > 0) {
            (bool sent, ) = payable(store.getXendFeesAddress()).call{value: xendFees}('');
            require(sent, 'CNSTXND');
        }

        (bool sent, ) = payable(owner).call{value: withdrawalAmount}('');
        require(sent, 'WF');
    }

    function withdraw(uint256 tokenId, uint256 auctionId) public override {
        _withdrawal(tokenId, auctionId, true);
    }

    // TODO: Check if there are no bids before cancelling.
    function cancelAuction(uint256 tokenId, uint256 auctionId) public override {
        shouldBeStarted(tokenId, auctionId);
        require(store.getBids(tokenId, auctionId).length > 0);
        store.setCancelled(tokenId, auctionId, true);
        emit LogCanceled();
    }

    function getTokenInfo(uint256 tokenId) public view override returns (Models.Asset memory) {        
        Models.Asset memory a = Models.Asset(tokenId, store.getOwner(tokenId), store.getIssuer(tokenId), store.getAddress(tokenId), store.getName(tokenId), store.getSymbol(tokenId));
        return a;
    }

    function getAuctionInfo(uint256 tokenId, uint256 auctionId) public view override returns (Models.AuctionInfo memory) {
        Models.AuctionInfo memory b = store.getAuction(tokenId, auctionId);
        return b;
    }

    function shouldBeStarted(uint256 tokenId, uint256 auctionId) public view {
        require(block.number >= store.getStartBlock(tokenId, auctionId), 'ANC');
        require(block.number <= store.getEndBlock(tokenId, auctionId), 'AE');
        require(!store.isCancelled(tokenId, auctionId), 'AC');
        require(store.isStarted(tokenId, auctionId), 'ANS');
        require(store.isInAuction(tokenId), 'ANIP');
    }
}
