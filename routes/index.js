var express = require('express');
var router = express.Router();
const request = require('request')
var Movie = require('../db/models/movie.js')
var User = require('../db/models/user.js')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth.js')
var cookieParser = require('cookie-parser');


const apiKey = process.env.APIKEY
const apiBaseUrl = 'http://api.themoviedb.org/3'

const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';



router.use((req, res, next) => {
  res.locals.imageBaseUrl = imageBaseUrl
  next()
})

router.use(cookieParser())


//now-playing view (index)
router.get('/', auth, function(req, res, next) {
  const nowPlayingUrl = `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`
  
  request.get(nowPlayingUrl, (error, response, movieData) => {
    
    const parsedData = JSON.parse(movieData)

    res.render('index', {
      parsedData: parsedData.results
              })

            })
})


router.post('/movie', auth, async (req, res, next) => {
  
    const movieAlreadySaved = await Movie.findOne({...req.body,
                                      owner: req.user._id})


    if(!movieAlreadySaved) {
    const movie = new Movie({...req.body,
                              owner: req.user._id})
    await movie.save()
    }
 
})

router.delete('/movie', auth, async (req, res, next) => {
  
  await Movie.deleteOne({...req.body,
                          owner: req.user._id})
  
})

router.get('/favorite', auth, async (req, res, next) => {

  const parsedData = await Movie.find({owner: req.user._id}, (err)=> 0)
  res.render('index', {parsedData})

})
//single-page view


router.get('/movie/:id', auth, (req, res, next) => {

  const movieId = req.params.id;
  const thisMovieUrl = `${apiBaseUrl}/movie/${movieId}?api_key=${apiKey}`
  
  request.get(thisMovieUrl, (error, response, movieDetails) => {

    const parsedData = JSON.parse(movieDetails)
    res.render('single-movie', {parsedData})



  })
})

//search route
router.post('/search', auth, (req, res, next) => {
  const userSearchTerm = encodeURI(req.body.movieSearch)
  const category = req.body.category
  const movieUrl = `${apiBaseUrl}/search/${category}?query=${userSearchTerm}&api_key=${apiKey}`
  console.log(movieUrl)

  request.get(movieUrl, (error, response, movieData) => {
    
    try{
    const parsedData = JSON.parse(movieData)
    
    if(!parsedData.results.length) {
      throw new Error()
    }
    
    if(category==="person"){
      parsedData.results = parsedData.results[0].known_for 

    }

    //to exclude data without a poster:
    parsedData.results = parsedData.results.filter((data)=>data.poster_path)

    res.render('index', {
      parsedData: parsedData.results
    })} catch(e){
      res.render('index', {parsedData:[]})
    }
  })

})

module.exports = router
