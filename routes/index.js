module.exports = function(passport) {

	var express = require('express');
	var router = express.Router();

	/* GET home page. */
	router.get('/', function(req, res) {
	  res.render('index', { title: 'Express' });
	});

	// process the signup form
	router.post('/signup', passport.authenticate('local-signup', {
	    successRedirect : '/', // redirect to the secure profile section
	    failureRedirect : '/', // redirect back to the signup page if there is an error
	    failureFlash : true // allow flash messages
	}));

	router.post('/login', passport.authenticate('local-login', {
	    successRedirect : '/', // redirect to the secure profile section
	    failureRedirect : '/', // redirect back to the signup page if there is an error
	    failureFlash : true // allow flash messages
	}));

	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    res.redirect('/');
	}

	return router;
};