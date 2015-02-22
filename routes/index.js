module.exports = function(passport) {

	var express = require('express');
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

	router.get('/main',function(req,res) {
		res.render('main');
	});

	router.get('/login',function(req,res) {
		res.render('login');
	});

	router.get('/register',function(req,res) {
		res.render('register');
	});

	router.get('/create',function(req,res) {
		res.render('create');
	});

	router.get('/design',function(req,res) {
		res.render('design');
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
