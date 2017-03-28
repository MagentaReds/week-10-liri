var Twitter = require("twitter");  //twitter api helper module
var spotify = require("spotify");   //silly spotify module.  Could be easily replaced with request calls
var request = require("request");   //web request module
var moment = require("moment");     //used for timestamps for logs
var fs = require("fs");             //used to read random.txt and read/write to log.txt

var twitterKeys = require("./keys.js"); //import values found in keys.js


//my-tweets, spotify-this-song, movie-this, do-what-it-says
//starts the program
doAction(process.argv[2], process.argv[3]);


//Main function
//Takes two passed str's ans parameters, and does one of the 4 functions of this node.js app.
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
      logs("Invalid Parameter");
      break;
  }
}


//Using the keys from keys.js, this function gets the latest 20 tweets from @UTBCWeek10, displays them and logs them.
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

    //this is used for seeing the response object in a file for later/easier viewing
    // fs.writeFile("tweets.json", JSON.stringify(tweets,null,2), function(err){
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

//this function takes the name parameter and uses the spotify module to request more details of the song name.
//spotify will return 20 results, I just take the first one as that is probably the best match and the one we are interested in.
//I have not handled if spotify cannot find the song.
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

    //this is used for seeing the response object in a file for later/easier viewing
    // fs.writeFile("songs.json", JSON.stringify(data,null,2), function(err){
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


  //Startings of some code for using request instead of the spotify module
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

//This function calls the omdb api via request to search for the movie named passed.
//Output's the movie details to the console and the log file
function getMovie(name) {
  var search;
  if(name===undefined || name==="") {
    logs("Error: Missing Movie Name\nDefaulting to: Mr. Nobody");
    search="Mr. Nobody";
  } else {
    logs("Searching OMDB for: "+name);
    search=name;
  }

  var url="http://www.omdbapi.com/?t="+search+"&tomatoes=true";  //need this optional paramter to get rotten tomatoe related info in the response json
  request(url, function(err, response, body){
    if(err)
      return logs(err);
    if(response.statusCode!==200)
      return logs(response);
    
    //this is used for seeing the response object in a file for later/easier viewing
    // fs.writeFile("movie.json", JSON.stringify(JSON.parse(body),null,2), function(err){
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

      //it looks like the rotten tomatoes is not updated, so we check the ratings object for a rotten tomatoe score there, if it exists.
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

//this function reads random.txt
//the text in random.txt must be in the following format with no extra whitespaces outside the param2's quotation marks
//param1,"parameter 2"
//the function then calls doAction() with the parameters read.
function getCommandFromFile() {
  logs("Reading command from file");
  fs.readFile("random.txt", "utf8", function(err, data){
    if(err)
      return logs(err);

    var split=data.split(',');
    var action=split[0];
    var param="";

    if(split[1]!==undefined)
      param=split[1].substring(1,split[1].length-1);  //removes the " " as read from the file.

    return doAction(action, param);
  });

}

//function that appends the str to log.txt and if con_out is true (true by default) also console.logs str
function logs(str, con_out=true) {
  if(con_out)
    console.log(str);

  var logStr="\n("+moment().format()+")\n"+str;
  fs.appendFile("log.txt", logStr, function(err){if(err) console.log(err);});
}