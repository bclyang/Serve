'use strict';

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var mongoose = require('mongoose');
var settings = require('./config/settings');
var sendgrid  = require('sendgrid')('treehackssms', 'Treehacksrocks15');


require('./config/passport')(passport); // pass passport for configuration

var routes = require('./routes/index')(passport);
var users = require('./routes/users');
var texts = require('./routes/texts');

var app = express();

var port = process.env.PORT || 3000;

// connect to database
mongoose.connect(settings.mongoUrl);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'treehacks' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use('/', routes);
app.use('/users', users);
app.use('/texts', texts);

//require('./app/routes.js')(app, passport);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/*
app.listen(port);
console.log('The magic happens on port ' + port);
*/
module.exports = app;
