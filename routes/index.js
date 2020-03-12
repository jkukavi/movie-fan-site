var express = require('express');
var router = express.Router();
var Movie = require('../db/models/movie.js')
const auth = require('../middleware/auth.js')
const asyncGetMovieData= require('../utils/asyncGetMovieData')

const apiBaseUrl = 'http://api.themoviedb.org/3'
const apiKey = process.env.APIKEY
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

//make imageBaseUrl accessible within the viewengine
router.use((req, res, next) => {
  res.locals.imageBaseUrl = imageBaseUrl
  next()
})

//ROUTES::::::::::::::


//now-playing view (index)
router.get('/', auth, async function(req, res, next) {

  const url = `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`
  const parsedData = await asyncGetMovieData(url)
  //movies are in the .results of the received JSON
  res.render('index', {parsedData: parsedData.results})

})


//Add a movie to favorite
router.post('/favorite', auth, async (req, res, next) => {
  
  const movieAlreadySaved = await Movie.findOne({
    ...req.body,
    owner: req.user._id
  })

  if(!movieAlreadySaved) {
    const movie = new Movie({...req.body,
    owner: req.user._id})
    //is it necessary to await?
    await movie.save()
  }
 
})


//Delete a movie from favorite
router.delete('/favorite', auth, async (req, res, next) => {

  await Movie.deleteOne({
    ...req.body,
    owner: req.user._id})

})


//Get movies from favorite
router.get('/favorite', auth, async (req, res, next) => {

  const parsedData = await Movie.find({owner: req.user._id})
  res.render('index', {parsedData})

})


//Open a single page for a movie user has clicked
router.get('/movie/:id', auth, async (req, res, next) => {

  const movieId = req.params.id;
  const url = `${apiBaseUrl}/movie/${movieId}?api_key=${apiKey}`
  const parsedData = await asyncGetMovieData(url)
  res.render('single-movie', {parsedData})

})


//Search for a movie or an actor (category: movie or actor)
router.post('/search', auth, async (req, res, next) => {

  //get query data
  const userSearchTerm = encodeURI(req.body.movieSearch)
  const category = req.body.category

  //get movie data user searched for
  const url = `${apiBaseUrl}/search/${category}?query=${userSearchTerm}&api_key=${apiKey}`
  const parsedData = await asyncGetMovieData(url)

  //in case no results arrived
  if(!parsedData.results.length) {
    res.render('index', {parsedData:[]})
    return
  }
  
  //in case the category was person, movies are in .results[0].known_for
  if(category==="person"){
    parsedData.results = parsedData.results[0].known_for 
  }

  //to exclude movies without a poster: (to avoid "no image" on page)
  parsedData.results = parsedData.results.filter((data)=>data.poster_path)

  res.render('index', {parsedData: parsedData.results})

})
 

module.exports = router
