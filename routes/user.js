var express = require('express');
var router = express.Router();
const request = require('request')
var Movie = require('../db/models/movie.js')
var User = require('../db/models/user.js')
const jwt = require('jsonwebtoken')
const path = require('path')
const bcrypt = require('bcryptjs')


//ROUTES::::::


//Login page rendering
router.get('/login', async (req, res, next) => {
  res.render('form', {title: "Login here:", redirect: "/user/signup", sign: "Don't have an existing account?", submit:'/user/login'})
})


//Signup page rendering
router.get('/signup', (req, res, next) => {
  res.render('form', {title: "New account info:", redirect: "/user/login", sign: "Already have an existing account?", submit:'/user/signup'})
})


//Signing up the user
router.post('/signup', async (req, res, next) => {

  try {
    req.body.password = await bcrypt.hash(req.body.password, 8)
    const user = new User(req.body)
    await user.save()
    const token = await user.GenerateAuthToken()
    res.cookie('token', token)
    res.redirect(`${process.env.STAGE}/`)
  } catch (e) {
    res.status(400).send(e)
  }
  
})


//Posting login data
router.post('/login', async (req, res, next) => {

    try{
      const user = await User.authenticateByCredentials(req.body.username, req.body.password)
      const token = await user.GenerateAuthToken()
      res.cookie('token', token)
      res.redirect(`${process.env.STAGE}/`)
    } catch(e){
        res.send(`<h2>${e.message}<h2>`)
    }
    
})


//Logging out
router.get('/logout', async (req, res, next) => {
  try{
    res.clearCookie('token')
    res.redirect(`${process.env.STAGE}/`)
  } catch(e){
    res.status(400).send(e)
  }
})


module.exports = router