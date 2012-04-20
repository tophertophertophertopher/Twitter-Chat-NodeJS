/* GET home page. */
// login view render method 
exports.login = function(req, res){ 
	res.render('sign_in', { title: 'TwitChat', body: "Please Sign in with Twitter" });
};

// index view render method 
///  recieves the nowjs module, and connected users group
exports.index = function(req, res, nowjs, users){
  // setup nowJS socket connect and disconnect event methods
  nowjs.on('connect', function(){ this.now.name = req.session.user});
  nowjs.on('disconnect', function(){ });
  
  //Now namespace method to send a message to all users
  users.now.sendMsg = function(msg){
    //distribute message to all users;
    
    msg = msg.replace(/(<([^>]+)>)/ig,"");
    
    users.now.receiveMsg(this.now.name, escape(msg));
  };
  
  /// render view
	res.render('index', { title: 'TwitChat', body: "Hi there!", user: req.session.user });
}