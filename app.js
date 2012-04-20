/**
 * App.js for Twitter Chat
 * 
 * Module dependencies.
*/

//Load express, routes, HTTP, and Oauth modules
var express = require('express'),
	routes = require('./routes'),
  OAuth = require('oauth').OAuth,
  http = require('http');
  
///setup OAUTH configure for Twitter
var oa = new OAuth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  "KEY",
  "SECRET",
  "1.0",
  "oob",
  "HMAC-SHA1"
);

//create express server
var app = module.exports = express.createServer();

//run config routine
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade'); // use JADE template engine
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  //use the session handler... can I tell you my secret now?
  app.use(express.session({ secret:"I see dead people" })); //secret salt for sessions //SPOIL'D! Dr. Malcolm Crowe is dead!
  app.use(express.methodOverride()); 
  app.use(app.router); // use routes
  app.use(express.static(__dirname + '/public')); // serve statics from public folder
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); // show stack and dump ex on dev environment
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


///** Socket Handler **//

var nowjs = require('now');
var everyone = nowjs.initialize(app);

//*** Routes ***//

//main index route; handles user session state to determine whether they have logged in
//and renders the corresponding modular route. 
app.get('/',function(req, res){ 
	
	///check for user
	if(req.session.user)
	{	
		//render index route with nowJS middleware
		routes.index(req,res,nowjs,everyone);		
	}
	else
	{
		//login route
		routes.login(req,res);
	}
});

app.get('/test', function(req, res){ routes.test(req, res) });


// fake oauth login, for testing locally without reliable connection to twitter
app.get('/auth/fake', function(req, res, next){
	req.session.user = {};
	req.session.user.screen_name = 'topherbullock';
	req.session.user.image = "https://si0.twimg.com/sticky/default_profile_images/default_profile_0_normal.png";
	res.redirect('/');
});

// fake oauth login, for testing locally without reliable connection to twitter
app.get('/auth/fake/:id', function(req, res, next){
  req.session.user = {};
  req.session.user.screen_name = req.params.id;
  req.session.user.image = "https://si0.twimg.com/sticky/default_profile_images/default_profile_0_normal.png";
  res.redirect('/');
});




//Twitter authentication Oauth hook.
app.get('/auth/twitter', function(req, res, next){
  //get OA request token from twitter OA api
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
		if (error) { //something go south?		  
			console.log("Could not connect to Twitter.");/// increase verboity of internal log 
			// throw Error if something goes wrong.
			next(new Error("Could not connect to Twitter."));
		}
		else { // good to go?
			req.session.sentAuth = true; // log that a token has been received 
			req.session.oauth = {}; //instantiate oath user session hash
			req.session.oauth.token = oauth_token; // store token in user session hash
			req.session.oauth.token_secret = oauth_token_secret; // store token secret in user session hash
			res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token); // redirect to the authentication path 
		}
	});
});

// Callback point for Twitter auth. 
app.get('/auth/twitter/callback', function(req, res, next){  
	if (req.session.oauth){ // check that user has requested OAuth token
	  
	  // verifier passed as query to the callback url
	  req.session.oauth.verifier = req.query.oauth_verifier;
		var oauth = req.session.oauth;
		
		/// Authenticate with the Access Token
		oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier,		
		function(error, oauth_access_token, oauth_access_token_secret, results){
			if (error){			  
			  // log and throw error if Auth did not complete
			  /// (may want to log and redirect instead)
				console.log(error);
				next(new Error("Could not connect to Twitter."));
			} else {			  
				req.session.oauth.access_token = oauth_access_token;
				req.session.oauth.access_token_secret = oauth_access_token_secret;
				req.session.user = results;
				
				///GET request params to grab the user image path 
				var options = {
				  host: 'api.twitter.com',
				  port: 80,
				  path: '/1/users/profile_image?screen_name='+req.session.user.screen_name,
				  method: 'GET'
				};
				
				//Perform HTTP Req to get the user's profile image.
			 	http.get(options, function(response) {
				  req.session.user.image = response.headers.location; //response sends a redirect to the image URL, we can just grab that.
				  res.redirect('/');
				}).on('error', function(e) {
				  //if the get request fails just use a default image
				  //// (shouldn't fail if the user is able to log in, but JIC')
				  req.session.user.image = "https://si0.twimg.com/sticky/default_profile_images/default_profile_0_normal.png";
				  res.redirect('/');
				});
			}
		}
		);
	}else // hasn't attempted connect and got here by accident
		next(new Error("Could not connect to Twitter."));
});

//Authentication logout
app.get('/auth/logout', function(req, res){
  //clear out the user hash by re-initializing.
  req.session.user = false;
  res.redirect('/');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
