var path = require("path");
var express = require('express');
var UserManager = require("./user-manager");
var session = require("./beat-session");
var router = express.Router();

var sessionName = 'session';

//Setting user session
router.use(session({
	cookieName: sessionName
}));


router.get("/", function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		console.log("Redirecting to match");
		res.redirect("match");
	}
	else{
		console.log("Sending " + path.join(__dirname,"views","index.html"));
		res.sendFile(path.join(__dirname,"views","index.html"));
	}
});
router.post("/", function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		console.log("Redirecting to match");
		res.redirect("match");
	}
	else{
		console.log("Sending " + path.join(__dirname,"views","index.html"));
		res.sendFile(path.join(__dirname,"views","index.html"));
	}
});


router.get("/login",function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		console.log("Redirecting to match");
		res.redirect("match");
	}
	else{
		console.log("Redirecting to index");
		res.redirect("/");
	}
});
router.post("/login",function(req,res){
	console.log("POST login request");
	if(req[sessionName] == undefined && UserManager.authUser(req.body.username,req.body.password)){
		console.log("Access granted to "+req.body.username);
		var options = {
			cookieName: [sessionName],
			salt: req.body.username,
			maxAge: (req.body.rememberMe == "on" ? (60*60*24*365*5) : (60*60*10) ) // 5 years if rememberMe is checked, 10 hours otherwise
		};
		req = session.createSession(req,res,options);
		req = session.setSessionData(req,[sessionName],"logged",true);
		req = session.setSessionData(req,[sessionName],"username",req.body.username);
		//res.redirect("match");
		res.send("Access granted");
	}
	else{
		console.log("Access denied to "+req.body.username);
		//res.redirect("/");
		res.send("Access denied");
	}
});

router.get("/logout",function(req,res){
	session.destroySession(req,res,sessionName);
	res.redirect("/");
});
router.post("/logout",function(req,res){
	session.destroySession(req,res,sessionName);
	res.redirect("/");
});


router.get("/match",function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		console.log("Sending " + path.join(__dirname,"views","match.html"));
	res.sendFile(path.join(__dirname,"views","match.html"));
	}
	else{
		res.redirect("/");
	}
});
router.post("/match",function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		console.log("Sending " + path.join(__dirname,"views","match.html"));
	res.sendFile(path.join(__dirname,"views","match.html"));
	}
	else{
		res.redirect("/");
	}
});



module.exports = router;
module.exports.session = session;