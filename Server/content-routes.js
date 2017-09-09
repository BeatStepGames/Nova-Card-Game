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
		var p = path.join(__dirname,"views","index.html");
		console.log("Sending " + p);
		res.sendFile(p);
	}
	else{
		res.redirect("login");
	}
});
router.post("/", function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		var p = path.join(__dirname,"views","index.html");
		console.log("Sending " + p);
		res.sendFile(p);
	}
	else{
		res.redirect("login");
	}
});


router.get("/login", function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		console.log("Redirecting to /");
		res.redirect("/");
	}
	else{
		var p = path.join(__dirname,"views","login.html")
		console.log("Sending " + p);
		res.sendFile(p);
	}
});
router.post("/login", function(req,res){
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
		res.send("Access granted");
	}
	else{
		console.log("Access denied to "+req.body.username);
		res.send("Access denied");
	}
});


router.get("/logout", function(req,res){
	session.destroySession(req,res,sessionName);
	res.redirect("login");
});
router.post("/logout", function(req,res){
	session.destroySession(req,res,sessionName);
	res.redirect("login");
});


router.get("/signup", function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		console.log("Redirecting to /");
		res.redirect("/");
	}
	else{
		var p = path.join(__dirname,"views","signup.html")
		console.log("Sending " + p);
		res.sendFile(p);
	}
});
router.post("/signup", function(req,res){
	console.log("POST signup request");
	if(req[sessionName] == undefined){
		var signupResponse = UserManager.signupUser(req.body.username,req.body.password,req.body.email);
		if(signupResponse.result == 1){
			console.log("Waiting account confirmation form " + req.body.username);
			//TODO: change this to an email, and send a positive response for the page to show
			res.send("$"+req.headers.host+"/confirm_user?token="+signupResponse.token);
		}
		else if(signupResponse.result == 2){
			console.log("Username " + req.body.username + " unavailable for signup");
			res.send("Username unavailable");
		}
		else if(signupResponse.result == 3){
			console.log("Email " + req.body.email + " unavailable for signup");
			res.send("Email already used");
		}
		
	}
	else{
		console.log(req.body.username + " cannot signup");
		res.send("Already logged in");
	}
});


router.get("/confirm_user",function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		console.log("Redirecting to /");
		res.redirect("/");
	}
	else{
		var resp = UserManager.confirmUser(req.query.token);
		if(resp == 1){
			console.log("Confirmation user done, redirecting to login");
			res.redirect("/login");
		}
		else{
			var p = path.join(__dirname,"views","confirmation-denied.html");
			console.log("Confirmation denied, sending " + p);
			res.sendFile(p);
		}
	}
});
router.post("/confirm_user",function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		console.log("Redirecting to /");
		res.redirect("/");
	}
	else{
		var resp = UserManager.confirmUser(req.body.token);
		if(resp == 1){
			console.log("Confirmation user done, redirecting to login");
			res.redirect("/login");
		}
		else{
			var p = path.join(__dirname,"views","confirmation-denied.html");
			console.log("Confirmation denied, sending " + p);
			res.sendFile(p);
		}
	}
});

module.exports = router;
module.exports.session = session;