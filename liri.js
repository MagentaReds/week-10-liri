var Twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");
var moment = require("moment");
var fs = require("fs");

var twitterKeys = require("./keys.js");


//my-tweets, spotify-this-song, movie-this, do-what-it-says
doAction(process.argv[2], process.argv[3]);

function doAction(param1, param2="") {
  logs("Param: "+param1 +" "+param2, false);

  switch(param1){
    case "my-tweets":
      getTweets();
      break;
    case "spotify-this-song":  
      getSong(param2);
      break;
    case "movie-this":
      getMovie(param2);
      break;
    case "do-what-it-says":
      getCommandFromFile();
      break;
    default:
      logs("Invalid Paramter");
      break;
  }
}


function getTweets() {
  var client = new Twitter(twitterKeys.twitterKeys);

  var params = {
    q: "from:UTCBCWeek10",
    result_type: "recent",
    count: 20
  };

  client.get("search/tweets", params, function(err, tweets, response){
    //logs(JSON.stringify(err,null,2));
    //logs(JSON.stringify(response,null,2));
    //logs(JSON.stringify(tweets,null,2));
    if(err)
      return logs(err);

    // fs.writeFile("tweets.txt", JSON.stringify(tweets,null,2), function(err){
    //   if(err)
    //     consle.log(err);
    // });

    logs("Printing the most recent tweets from UTCBCWeek10");

    var output="";
    for(var i=0; i<tweets.statuses.length; ++i){
      output+="\n================================";
      output+='\n'+tweets.statuses[i].created_at+": \n"+tweets.statuses[i].text;
      output+='\n'+"================================";
    }

    logs(output);
  });

}

function getSong(name) {
  var search;
  if(name===undefined || name===""){
    logs("Error: Missing Song Name\nDefaulting to: \"All That She Wants\" by Ace of Base");
    search="All That She Wants";
  } else {
    logs("Searching Spotify for: "+name);
    search=name;
  }

  spotify.search({type:"track", query: search}, function(err, data){
    if(err)
      return logs(err);

    // fs.writeFile("songs.txt", JSON.stringify(data,null,2), function(err){
    //   if(err)
    //     logs(err);
    // });

    var firstResult=data.tracks.items[0];

    var output="";
    output+="==============================";
    output+="\nArtist(s): "+firstResult.artists[0].name;
    for(var i=1; i<firstResult.artists.length; ++i)
      output+=", "+firstResult.artists[i].name;

    output+="\nSong Name: "+firstResult.name;
    output+="\nAlbum: "+firstResult.album.name;
    output+="\nPreview URL: "+firstResult.preview_url;
    output+="\n==============================";

    logs(output);
  });


  //var requestUrl="https://api.spotify.com/v1/search?type=track&q=";
  // request(requestUrl+search, function(err, response, body){
  //   if(err)
  //     return logs(err);
  //   if(response.statusCode!==200)
  //     return logs(response);

  //   // fs.writeFile("songs.txt", JSON.stringify(JSON.parse(body),null,2), function(err){
  //   //   if(err)
  //   //     return logs(err);
  //   // });

  //   var output="";

  // });

}

function getMovie(name) {
  var search;
  if(name===undefined || name==="") {
    logs("Error: Missing Movie Name\nDefaulting to: Mr. Nobody");
    search="Mr. Nobody";
  } else {
    logs("Searching OMDB for: "+name);
    search=name;
  }

  var url="http://www.omdbapi.com/?t="+search+"&tomatoes=true";
  request(url, function(err, response, body){
    if(err)
      return logs(err);
    if(response.statusCode!==200)
      return logs(response);
    
    // fs.writeFile("movie.txt", JSON.stringify(JSON.parse(body),null,2), function(err){
    //   if(err)
    //     logs(err);
    // });

    var output="";
    var object=JSON.parse(body);
    if(object.Response==="True"){
      output+="==========================";
      output+="\nTitle: "+object.Title;
      output+="\nRelease Date: "+object.Year;
      output+="\nIMDB Rating: "+object.imdbRating;
      output+="\nLanguage: "+object.Language;
      output+="\nPlot: "+object.Plot;
      output+="\nActors: "+object.Actors;

      output+="\nRotten Tomatoes Score: ";
      if(object.tomatoMeter==="N/A" && object.Ratings!==undefined) {
        var temp=null;
        for(var i=0; i<object.Ratings.length; ++i)
          if(object.Ratings[i].Source==="Rotten Tomatoes")
            temp=object.Ratings[i].Value;
        
        if(temp===null)
          output+="N/A";
        else
          output+=temp;
      }
      else
        output+=object.tomatoMeter;

      output+="\nRotten Tomatoes URL: "+object.tomatoURL;
      output+="\n==========================";
      
    } else {
      output="Movie is not found.";
    }

    logs(output);

  });
  
}

function getCommandFromFile() {
  logs("Reading command from file");
  fs.readFile("random.txt", "utf8", function(err, data){
    if(err)
      return logs(err);

    var split=data.split(',');

    return doAction(split[0], split[1].substring(1,split[1].length-1));
  });

}

function logs(str, con_out=true) {
  if(con_out)
    console.log(str);

  var logStr="\n("+moment().format()+")\n"+str;
  fs.appendFile("log.txt", logStr, function(err){if(err) console.log(err);});
};