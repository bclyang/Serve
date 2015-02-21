'use strict';

// Defines the main endpoint for receiving and parsing incoming
// text messages

var twilio = require('twilio');

var User = require('../models/users');
var secrets = require('../config/secrets');

var client = new twilio.RestClient(
  secrets.twilio.twilio_account_id,
  secrets.twilio.twilio_auth_token
);


// Called by twilio upon receiving text messages to user's
// API number
exports.receiveText = function(request, response) {
  // TODO: Add check to make sure this is actually from a text
  var textResp = new twilio.TwimlResponse();
  var sendingNumber = request.body.From;
  var query = {'local.phone': sendingNumber};

  User.findOne(query, function(err, user) {
    if(err) {
      textResp.message('Error occurred. Please try again.');
      response.writeHead(500, {
        'Content-Type': 'text/xml'
      });
      response.end(textResp.toString());
      return;
    }

    if(!user) {
      console.log("Unknown user detected");
      sendUnknownNumberMsg(sendingNumber, textResp, response);
      return;
    }

    var parsedText = parseTextMessage(request.body.Body);
    var command = parsedText[0];
    if (isHelpRequest(command)) {
      sendHelpMessage(textResp, response, user);
      return;
    }

    // Otherwise must be a user command
    var userScript = findScript(user, command);

    if (!userScript) {
      textResp.message('Invalid command');
      response.writeHead(200, {
        'Content-Type': 'text/xml'
      });
      response.end(textResp.toString());
    } else {

      executeUserScript(userScript);

      // Just send a dummy response for now
      textResp.message('Hello, ' + user.name);
      response.writeHead(200, {
        'Content-Type': 'text/xml'
      });
      response.end(textResp.toString());
    }

  });
}

// Parses the given text message, extracting the command name
// and any arguments for the command
// TODO: Configure this to take in arguments w/ spaces
// Maybe use quotes as delimiters?
function parseTextMessage(textContent) {
  var contents = textContent.split(' ');
  return contents;
}

function findScript(user, command) {
  return '';
}

function isHelpRequest(command) {
  return command === '\help'
}

function sendHelpMessage(textResp, response, user) {
  var commandsList = listUserCommands(user);
  textResp.message('You have configured the following commands: ' + commandsList);
  response.writeHead(200, {
    'Content-Type': 'text/xml'
  });
  response.end(textResp.toString());
}

function listUserCommands(user) {
  return '';
}

function executeUserScript(script) {
  return;
}

function sendUnknownNumberMsg(sendingNumber, textResp, response) {
  textResp.message("Unknown number: " + sendingNumber);
  response.writeHead(500, {
    'Content-Type': 'text/xml'
  });
  response.send(textResp.toString());
}
