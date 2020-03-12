const request = require('request')
const util = require('util')

const requestPromise = util.promisify(request)

async function asyncGetMovieData(url) {
 const {body: data} = await requestPromise(url)
 const parsedData = JSON.parse(data)
 return parsedData
}

module.exports = asyncGetMovieData
