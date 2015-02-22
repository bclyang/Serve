module.exports = function(passport) {

	var express = require('express');
	var fs = require('fs');
	var router = express.Router();

	/* GET home page. */
	router.get('/', function(req, res) {
	  res.render('home', { title: 'Express' });
	});

	// process the signup form
	router.post('/signup', passport.authenticate('local-signup', {
	    successRedirect : '/main', // redirect to the secure profile section
	    failureRedirect : '/login', // redirect back to the signup page if there is an error
	    failureFlash : true // allow flash messages
	}));

	router.post('/login', passport.authenticate('local-login', {
	    successRedirect : '/main', // redirect to the secure profile section
	    failureRedirect : '/login', // redirect back to the signup page if there is an error
	    failureFlash : true // allow flash messages
	}));

	router.post('/user/program', function(req, res) {
		var filePath = __dirname+'/../user_info/' + req.user.local.phone + '/' + req.body.name;
		req.user.programs.push({    
			name: req.body.name,
    		description: req.body.about,
    		filepath: filePath
    	});
    	req.user.save(function(err) {
    		if(err)
    			throw err;
    	});
    	fs.writeFileSync(filePath, req.body.code);
		res.redirect('/main');
	})

	router.get('/main', isLoggedIn, function(req,res) {
		res.render('main', {
			user:req.user
		});
	});

	router.get('/login', function(req,res) {
		res.render('login');
	});

	router.get('/register',function(req,res) {
		res.render('register');
	});

	router.get('/create', isLoggedIn, function(req,res) {
		res.render('create', {
			user:req.user
		});
	});

	router.get('/design', isLoggedIn, function(req,res) {
		res.render('design', {
			user:req.user
		});
	});

	function isLoggedIn(req, res, next) {
	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    res.redirect('/');
	}

	return router;
};
