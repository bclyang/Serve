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
  var textResp = new twilio.TwimlResponse();
  var sendingNumber = request.body.From;
  var query = {'local': { 'phone': sendingNumber } };

  User.findOne(query, function(err, user) {
    var parsedText = parseTextMessage(request.body.Body);
    var command = parsedText[0];
    var userScript = findScriptFile(user, command);

    if (!userScript) {
      textResp.message('Invalid command');
      response.writeHead(200, {
        'Content-Type': 'text/xml'
      });
      response.end(textResp.toString());
    } else {

      // Just send a dummy response for now
      textResp.message('Hello, ' + user.name);
      response.writeHead(200, {
        'Content-Type': 'text/xml'
      });
      response.end(textResp.toString());
    }

  });
}

function parseTextMessage(textContent) {
  return '';
}

function findScriptFile(user, command) {
  return '';
}
