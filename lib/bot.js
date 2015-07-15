'use strict';

var SlackClient = require('slack-client'),
  introject = require('introject');

var constants = require('./constants'),
  Response = require('./response').Response;


var Bot = function Bot(options) {
  this.client = new SlackClient(options.token);

  this.commands = {};
};

Bot.prototype.on = function on(type, cb) {
  // build a context. We will use this to inject dependencies.
  // bootstrap context with non event specific resources. can be injected
  // into any event.
  var context = {
    bot: this,
    client: this.client,
    channels: this.client.channels,
    dms: this.client.dms,
    groups: this.client.groups,
    users: this.client.users,
    bots: this.client.bots
  };
  var response;

  this.client.on(type, function() {
    // build an array out of the arguments to this callback
    var args = Array.apply(null, arguments);

    // match up the arguments to constants.eventArgs, and then add to context
    constants.eventArgs[type].forEach(function(argName) {
      var arg = args.shift();
      context[argName] = arg;
    });

    // do some sort of seminonunintelligent context inference here
    if (context.message) {
      context.channel = context.client.getChannelGroupOrDMByID(context.message.channel);
      context.user = context.client.getUserByID(context.message.user);

      // TODO: don't construct response inside this if-block.
      response = new Response(context.channel);
    }

    // now, add our own deps
    context.response = response;

    // add the context itself as a dependency!
    context.context = context;

    // finally, inject stuff from our context to the callback, and run it
    introject.injectDeps(cb, context)();

    // if the callback put data into the response, send it.
    // TODO: somehow try to fix this for async callbacks.
    context.response.data && context.response.end();
  });
};

Bot.prototype.onMessage = function onMessage(subtype, cb) {
  if (typeof subtype === 'function') {
    cb = subtype;
    subtype = null;
  };

  this.on('message', function(context, message) {
    if (message.subtype === subtype || !subtype) {
      introject.injectDeps(cb, context)();
    }
  });
};

Bot.prototype.command = function command(name, cb) {
  // construct a hashset of the command names.
  var names = Array.isArray(name) ? name : [name];
  var commands = this.commands;
  names.forEach(function(name) {
    commands[name] = cb;
  });


  this.onMessage(function(context, message) {
    if (message.text && message.text.startsWith('!')) {
      message.text = message.text.slice(1);
    }
    else {
      return;
    }

    var words = message.text.split(' ');
    message.argv = context.argv = words;
    commands[words[0]] && introject.injectDeps(commands[words[0]], context)();
  });
};

Bot.prototype.start = function start() {
  this.client.login();
};

Bot.prototype.importBundle = function importBundle(bundle) {
  (typeof bundle === 'string') && (bundle = require(string));
  bundle(this);
};

module.exports = Bot;