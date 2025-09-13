
const express = require('express')
const cors = require('cors')
const UserRouter = require('./Router/UserRouter')
const AuctionRouter = require('./Router/AuctionRouter')

const app = express()
app.use(cors())
app.use(express.json())

//user router
app.use('/api/auth',UserRouter)
// Auction router
app.use('/api/auctions',AuctionRouter)

const PORT = 3000
app.listen(PORT,()=>console.log(`Server is running on ${PORT}`))