/*
 * GET home page.
*/

exports.login = function(req, res){ 
	res.render('sign_in', { title: 'TwitChat', body: "Please Sign in with Twitter" });
};

exports.index = function(req, res, nowjs, users){
  
  nowjs.on('connect', function(usr){ console.log(users); });
  nowjs.on('disconnect', function(){ });
  
	res.render('index', { title: 'TwitChat', body: "hai there!", user: req.session.user });
}