/*
These are all the events that can be fired by the slack-client EventEmitter.
The values of each pair are the semantic names of the corresponding argument
in the event callback. These names will be used to inject the argument into the
context.
*/

var eventArgs = {
  'error': ['error'],
  'loggedIn': ['self', 'team'],
  'error': ['error'],
  'star_added': ['message'],
  'star_removed': ['message'],
  'raw_message': ['message'],
  'presenceChange': ['user', 'presence'],
  'statusChange': ['user', 'status'],
  'message': ['message'],
  'channelMarked': ['channel', 'ts'],
  'userTyping': ['user', 'channel'],
  'userChange': ['user'],
  'botRemoved': ['bot'],
  'messageSent': ['message'],
  'throw': ['error']
};

var errMsgs = {
  'err_plugin_type': 'Plugin type {{type}} does not exist!',
  'err_token': 'No token found!'
};

exports = {
  eventArgs: eventArgs,
  errMsgs: errMsgs
};
