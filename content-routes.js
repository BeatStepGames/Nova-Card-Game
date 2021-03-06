var path = require("path");
var fs = require("fs");
var express = require('express');
var sendMail = require("sendmail")({silent: false}); //https://github.com/guileen/node-sendmail
var userManager = require("./user-manager");
var session = require("./beat-session");
var router = express.Router();

var sessionName = 'session';

//Setting user session
router.use(session({
	cookieName: sessionName
}));


router.get("/", function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		// var p = path.join(__dirname,"views","index.html");
		// console.log("Sending " + p);
		// res.sendFile(p);
		res.render("index", {username: req[sessionName].username});
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
	if(req[sessionName] == undefined && userManager.authUser(req.body.username,req.body.password)){
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
		var signupResponse = userManager.signupUser(req.body.username,req.body.password,req.body.email);
		if(signupResponse.result == 1){
			console.log("Waiting account confirmation for " + req.body.username);
			res.send("$Confirm account");
			sendMail({	
				from: '"Nova Cards Game" <no-replay@nova.io>',
				to: req.body.email,
				subject: 'Confirm your Nova account',
				html: `Hi ${req.body.username}, thank you for joining the <i>Nova Cards Game</i> community<br/>To confirm your account, click on the link below<br/><a href="${req.headers.host+"/confirm_user?token="+signupResponse.token}">${req.headers.host+"/confirm_user?token="+signupResponse.token}</a><br/>If your email client doesn't support links, copy and paste the link in the address bar`
				}, function (err, reply) {
					if(err == null){
						console.log("Confirmation email sent to " + req.body.email);
						console.dir(reply);
					}
					else{
						console.log("ERROR sending confirmation email");
						console.log(err && err.stack);
					}
				}
			);
			
		}
		else{
			console.log("Signup error for" + req.body.username + "/" + req.body.email + " - " + signupResponse.message);
			res.send(signupResponse.message);
		}
	}
	else{
		console.log(req.body.username + " cannot signup, already logged in");
		res.send("Already logged in");
	}
});


router.get("/confirm_user",function(req,res){
	if(req[sessionName] != undefined && req[sessionName].logged == true){
		console.log("Redirecting to /");
		res.redirect("/");
	}
	else{
		var resp = userManager.confirmUser(req.query.token);
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
		var resp = userManager.confirmUser(req.body.token);
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

router.get("/create_card",function(req,res){
	var p = path.join(__dirname,"views","create-card.html");
	console.log("Confirmation denied, sending " + p);
	res.sendFile(p);
});
router.post("/create_card",function(req,res){
	var card = {
		name: req.body.name,
		level: req.body.level,
		comment: req.body.comment,
		atk: req.body.atk,
		def: req.body.def,
	};
	var cardData = JSON.stringify(card);
	var p = path.join(__dirname, "server resources","cards",card.name+".json");
	fs.writeFileSync(p,cardData);
	
	console.log("Card created: "+card.name);
	res.end("card created");
});

module.exports = router;
module.exports.session = session;
module.exports.userManager = userManager;