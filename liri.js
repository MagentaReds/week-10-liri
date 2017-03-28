var twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");
var fs = require("fs");

var twitterKeys = require("./keys.js");


//my-tweets, spotify-this-song, movie-this, do-what-it-says

var parameter = process.argv[2];

switch(parameter){
  case "my-tweets":
    getTweets();
    break;
  case "spotify-this-song":
    getSong(process.argv[3]);
    break;
  case "movie-this":
    getMovie(process.argv[3]);
    break;
  case "do-what-it-says":
    getCommandFromFile();
    break;
  default:
    console.log("Invalid Paramter");
    break;
}


function getTweet() {

}

function getSong(name) {
  if(name===undefined)
    return console.log("Error: Missing Song Name");
}

function getMovie(name) {
  if(name===undefined)
    return console.log("Error: Missing Movie Name");

}

function getCommandFromFile() {

}