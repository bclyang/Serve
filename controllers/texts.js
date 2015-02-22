'use strict';

// Defines the main endpoint for receiving and parsing incoming
// text messages

var twilio = require('twilio');

var User = require('../models/users');
var secrets = require('../config/secrets');
var fs = require('fs');
var spawn = require('child_process').spawn;

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
      response.send(textResp.toString());
    } else {
      if(!user) {
        console.log("Unknown user detected");
        textResp.message("Unknown number: " + sendingNumber);
        response.send(textResp.toString());
      } else {
        var parsedText = parseTextMessage(request.body.Body);
        var command = parsedText[0];
        if (isHelpRequest(command)) {
          var commandsList = listUserCommands(user);
          textResp.message('You have configured the following commands: ' + commandsList);
          response.send(textResp.toString());
        } else {

          // Otherwise must be a user command
          var userScript = findScript(user, command);

          if (!userScript) {
            console.log('Invalid command name');
            textResp.message('Invalid command');
            response.send(textResp.toString());
          } else {

            var args = parsedText;
            args.shift() // Shift array to get only arguments

            console.log('Executing user command: ' + userScript.name);
            fs.writeFile('../tmp/' + userScript.name + '.py', userScript.code, function(err) {
              if (err){
                textResp.message('Error occurred running the command.');
                response.send(textResp.toString());
              } else {
                args.unshift('../tmp/' + userScript.name + '.py');
                var process = spawn('python', args);
                process.stdout.setEncoding('utf8');

                // Set up callback to catch all script output
                var output = '';
                process.stdout.on('data', function (data) {
                  output += data.toString();
                });

                // Send text response once script is done
                process.on('close', function (code) {
                  if (output) {
                    textResp.message('Result: ' + output);
                    response.send(textResp.toString());
                  } else {
                    textResp.message('Script done, exitted with code ' + code);
                    response.send(textResp.toString());
                  }
                });
              }

            });
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
  for(var scriptIndex in user.programs){
    var script = user.programs[scriptIndex];
    if (script.name === command) {
      return script;
    }
  }
  return null;
}

function isHelpRequest(command) {
  console.log('Checking if command ' + command + ' is a help request');
  return command === '.help';
}

function sendHelpMessage(textResp, response, user) {
  var commandsList = listUserCommands(user);
  textResp.message('You have configured the following commands: ' + commandsList);
  response.send(textResp.toString());
}

function listUserCommands(user) {
  var result = [];
  for (scriptIndex in user.programs) {
    var script = user.programs[scriptIndex];
    result.append([script.name, script.description].join(': '));
  }
  return result.join('\n');
}

/*
function executeUserScript(script, args) {
  console.log('Executing user command: ' + script.name);
  var spawn = require('child_process').spawn;
  var process = spawn(script.filepath, args);
  process.stdout.setEncoding('utf8');

  // Set up callback to catch all script output
  var output = '';
  process.stdout.on('data', function (data) {
    var output += data.toString();
  });

  process.on('close', function (code) {
    
  });
  return;
}*/

function sendUnknownNumberMsg(sendingNumber, textResp, response) {
  textResp.message("Unknown number: " + sendingNumber);
  response.send(textResp.toString());
}
