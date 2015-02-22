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
          textResp.message('You have configured the following commands:\n' + commandsList);
          response.send(textResp.toString());
        } else {
          if(isTranslateRequest(command)) {
            // Handle translation
            // TODO: Get this working lol
            console.log("Translating given string");

            var language = '';
            if (parsedText.length >= 3) {
              language = parsedText[2];
            }
            text = parsedText[1];
           // var translation = translate(language, parsedText[1]);

            var transStr="mt-";
            transStr+=langMatch("english")+"-";
            transStr+=langMatch(language);

            request.post(
              'https://gateway.watsonplatform.net/machine-translation-beta/api',
              {"sid":transStr,"txt":text},
              function (error, response, body) {
              if (!error && response.statusCode == 200) {
                textResp.message(translation);
                response.send(textResp.toString());
              } else {
                textResp.message('Translation failed.');
                response.send(textResp.toString());
              }
            });
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
                console.log(userScript.code);
                if (err){
                  textResp.message('Error occurred running the command.');
                  response.send(textResp.toString());
                } else {
                  args.unshift('../tmp/' + userScript.name + '.py');
                  console.log('Passing in the following args: ' + args.join(' '));
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
                      forwardToOtherRecipients(user.name, userScript, output);
                      textResp.message('Result: ' + output);
                      response.send(textResp.toString());
                    } else {
                      textResp.message('Script done, exited with code ' + code);
                      response.send(textResp.toString());
                    }
                  });
                }
              });
            }
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
  for(var i = 0; i < user.programs.length; i++){
    var script = user.programs[i];
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

function isTranslateRequest(command) {
  return command === '.translate'
}

function sendHelpMessage(textResp, response, user) {
  var commandsList = listUserCommands(user);
  textResp.message('You have configured the following commands: ' + commandsList);
  response.send(textResp.toString());
}

function listUserCommands(user) {
  var result = [];
  for (var i = 0; i < user.programs.length; i++) {
    var script = user.programs[i];
    var entry = script.name + ': ' + script.description;
    result.push(entry);
  }
  return result.join('\n');
}

function sendUnknownNumberMsg(sendingNumber, textResp, response) {
  textResp.message("Unknown number: " + sendingNumber);
  response.send(textResp.toString());
}

function forwardToOtherRecipients(creatorName, script, output) {
  for(var i = 0; i < script.recipients.length; i++){
    var recipientNumber = script.recipients[i];
    var message = 'The following was generated and sent to you by ' + creatorName + '\n\n';
    message += output;
    console.log('Sending to the following number: ' + recipientNumber);
    console.log('Sending the message: ' + message);
    client.sendSms({
      to: recipientNumber,
      from: secrets.twilio.twilio_phone_number,
      body: message
    }, function(err, message) {
      if (err) {
        console.log("An error occurred sending the message to other recipients.");
      } else {
        console.log("Message successfully forwarded to recipient");
      }
    });
  }
  return;
}


// Translation Functions

var request = require('request');

function translate(lang, text) {
  var transStr="mt-";
  transStr+=langMatch("english")+"-";
  transStr+=langMatch(lang);

  request.post(
    'https://gateway.watsonplatform.net/machine-translation-beta/api',
    {"sid":transStr,"txt":text },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        return body;
      } else {
        return '';
      }
    });
}

function langMatch(lang) {
  switch(lang) {
  case "english":
    return "enus";
  case "Portuguese":
    return "ptbr";
  case "Spanish":
    return "eses";
  case "french":
    return "frfr";
  default:
    return "";
  }
}
