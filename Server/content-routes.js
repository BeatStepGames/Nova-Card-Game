var path = require("path");
var express = require('express');
var router = express.Router();

router.get("/", function(req,res){
	if(req.session.logged == true){
		console.log("Redirecting to match");
		res.redirect("match");
	}
	else{
		console.log("Sending " + path.join(__dirname,"views","index.html"));
		res.sendFile(path.join(__dirname,"views","index.html"));
	}
});
router.post("/", function(req,res){
	if(req.session.logged == true){
		console.log("Redirecting to match");
		res.redirect("match");
	}
	else{
		console.log("Sending " + path.join(__dirname,"views","index.html"));
		res.sendFile(path.join(__dirname,"views","index.html"));
	}
});

router.get("/login",function(req,res){
	if(req.session.logged == true){
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
	if(req.body.username == "Admin" && req.body.password == "password"){
		console.log("Access granted");
		req.session.logged = true;
		res.redirect("match");
	}
	else{
		console.log("Access denied, redirecting to index.html");
		res.redirect("/");
	}
});

router.get("/logout",function(req,res){
	req.session.reset();
	res.redirect("/");
});
router.post("/logout",function(req,res){
	req.session.reset();
	res.redirect("/");
});


router.get("/match",function(req,res){
	if(req.session.logged == true){
		console.log("Sending " + path.join(__dirname,"views","match.html"));
	res.sendFile(path.join(__dirname,"views","match.html"));
	}
	else{
		res.redirect("/");
	}
});
router.post("/match",function(req,res){
	if(req.session.logged == true){
		console.log("Sending " + path.join(__dirname,"views","match.html"));
	res.sendFile(path.join(__dirname,"views","match.html"));
	}
	else{
		res.redirect("/");
	}
});

module.exports = router;