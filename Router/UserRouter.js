
const express = require('express')
const Router = express.Router()
const { RegisterUser, LogInUser } = require('../Controllers/UserController')
const { LoginValidation, Validation ,Register} = require('../Middleware/Validation')

Router.post('/signup',Register,RegisterUser)
Router.post('/login',LoginValidation,LogInUser)

module.exports = Router
