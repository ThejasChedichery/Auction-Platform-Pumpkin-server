
const express = require('express')
const Router = express.Router()
const { Validation } = require('../Middleware/Validation')
const { CreateAuctionItem, GetAuctionItems ,PlaceBid} = require('../Controllers/AuctionController');

Router.post('', Validation, CreateAuctionItem);
Router.get('', Validation, GetAuctionItems)
Router.post('/:id/bid',Validation,PlaceBid)

module.exports = Router