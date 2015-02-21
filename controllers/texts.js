'use strict';

// Defines the main endpoint for receiving and parsing incoming
// text messages

var twilio = require('twilio');

var User = require('../models/user');
var secrets = require('../config/secrets');

var client = new twilio.RestClient(
  secrets.twilio.twilio_account_id,
  secrets.twilio.twilio_auth_token
);


// Called by twilio upon receiving text messages to user's
// API number
exports.receiveText = function(request, response) {

  // Just send a dummy response for now
  var resp = new twilio.TwimlResponse();
  resp.message('Hello!');
  resp.writeHead(200, {
    'Content-Type': 'text/xml'
  });
  resp.end(resp.toString());

}
