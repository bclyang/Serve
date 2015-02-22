'use strict';

// Defines the main endpoint for receiving and parsing incoming
// text messages

var twilio = require('twilio');

var User = require('../models/users');
var secrets = require('../config/secrets');
//var client = require

/*var client = new twilio.RestClient(
  secrets.twilio.twilio_account_id,
  secrets.twilio.twilio_auth_token
);*/

var texts = [];

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
      response.send(textResp.toString());
    } else {
      if(!user) {
        console.log("Unknown user detected");
        //sendUnknownNumberMsg(sendingNumber, textResp, response);
        textResp.message("Unknown number: " + sendingNumber);
        response.send(textResp.toString());
      } else {
        var parsedText = parseTextMessage(request.body.Body);
        var command = parsedText[0];
        if (isHelpRequest(command)) {
           sendHelpMessage(textResp, response, user);
        } else {

          // Otherwise must be a user command
          var userScript = findScript(user, command);

          if (!userScript) {
            console.log('Invalid command name');
            textResp.message('Invalid command');
            response.send(textResp.toString());
          } else {

            executeUserScript(userScript);

            // Just send a dummy response for now
            textResp.message('Hello, ' + user.name);
            response.send(textResp.toString());
          }
        }
      }
    }
  });
}

// Parses the given text message, extracting the command name
// and any arguments for the command
// TODO: Configure this to take in arguments w/ spaces
// Maybe use quotes as delimiters?
function parseTextMessage(textContent) {
  console.log("Parsing text message");
  if (textContent === undefined) {
    console.log("Textcontent is undefined!");
  }
  var contents = textContent.split(' ');
  console.log(contents);
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
  response.send(textResp.toString());
}

function listUserCommands(user) {
  return '';
}

function executeUserScript(script) {
  return;
}

function sendUnknownNumberMsg(sendingNumber, textResp, response) {
  textResp.message("Unknown number: " + sendingNumber);
  response.send(textResp.toString());
}
