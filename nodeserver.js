'use strict';

const fs = require('fs');
const markdown = require('markdown').markdown;
const Polyglot = require('polyinterface');

// Those are the node definitions that our nodeserver uses.
// You will need to edit those files.
const ControllerNode = require('./Nodes/ControllerNode.js'); // Controller node
const MyNode = require('./Nodes/MyNode.js'); // This is an example node

// Utility function provided to facilitate logging.
// Use logger.<debug|info|warn|error>()
// Logs to <home>/.polyglot/nodeservers/<your node server>/logs/<date>.log
// To watch logs: tail -f ~/.polyglot/nodeservers/<NodeServer>/logs/<date>.log
// All log entries prefixed with NS: Comes from your NodeServer.
// All log entries prefixed with POLY: Comes from the Polyglot interface
const logger = Polyglot.logger;

// Custom parameters definitions in front end UI configuration screen
// Accepts list of objects with the following properties:
// name - used as a key when data is sent from UI
// title - displayed in UI
// defaultValue - optional
// type - optional, can be 'NUMBER', 'STRING' or 'BOOLEAN'. Defaults to 'STRING'
// desc - optional, shown in tooltip in UI
// isRequired - optional, true/false
// isList - optional, true/false, if set this will be treated as list of values
//    or objects by UI
// params - optional, can contain a list of objects.
// 	 If present, then this (parent) is treated as object /
// 	 list of objects by UI, otherwise, it's treated as a
// 	 single / list of single values

const typedParams = [
  {name: 'host', title: 'Host', isRequired: true},
  {name: 'port', title: 'Port', isRequired: true, type: 'NUMBER'},
  {name: 'user', title: 'User', isRequired: true},
  {name: 'password', title: 'Password', isRequired: true},
  // { name: 'list', title: 'List of values', isList:true }
];

// Help file shown in the UI
const configurationHelp = './configdoc.md';


logger.info('-------------------------------------------------------');
logger.info('Starting Node Server');

// Create an instance of the Polyglot interface. We need pass in parameter all
// the Node classes that we will be using.
const poly = new Polyglot.Interface([ControllerNode, MyNode]);

// Connected to MQTT, but config has not yet arrived.
poly.on('mqttConnected', function() {
  logger.info('MQTT Connection started');
});

// Config has been received
poly.on('config', function(config) {
  const nodesCount = Object.keys(config.nodes).length;

  logger.info('Config received has %d nodes', nodesCount);

  // If we want to see the config content (Without the long nodes array):
  // logger.info('Received config: %o',
  //    Object.assign({}, config, { nodes: '<nodes>' }));

  // Important config options:
  // config.nodes: Our nodes, with the node class applied
  // config.typedCustomData: Configuration parameters from the UI

  // If this is the first config after a node server restart
  if (config.isInitialConfig) {

    // Removes all existing notices on startup, if any.
    poly.removeNoticesAll();

    // Sets the configuration fields in the UI
    poly.saveTypedParams(typedParams);

    // Sets the configuration doc shown in the UI
    const md = fs.readFileSync(configurationHelp);
    poly.setCustomParamsDoc(markdown.toHTML(md.toString()));

    // If we have no nodes yet, we add the first node: a controller node which
    // holds the node server status and control buttons The first device to
    // create is always the nodeserver controller.
    if (!nodesCount) {
      try {
        autoCreateController();
      } catch (err) {
        logger.error('Error while auto-creating controller node');
      }
    }
  }
});

// This is triggered every x seconds. Frequency is configured in the UI.
poly.on('poll', function(longPoll) {
  logger.info('%s', longPoll ? 'Long poll' : 'Short poll');
});

// Received a 'stop' message from Polyglot. This NodeServer is shutting down
poly.on('stop', function() {
  logger.info('Graceful stop');
});

// Received a 'delete' message from Polyglot. This NodeServer is being removed
poly.on('delete', function() {
  logger.info('Nodeserver is being deleted');
});

// MQTT connection ended
poly.on('mqttEnd', function() {
  logger.info('MQTT connection ended.'); // May be graceful or not.
});

// Triggered for every message received from polyglot.
// Can be used for troubleshooting.
poly.on('message', function(message) {
  // logger.debug('Message: %o', message);
});


// If we get an uncaugthException...
process.on('uncaughtException', function(err) {
  console.error(`uncaughtException REPORT THIS!: ${err.stack}`);
});


async function autoCreateController() {
  await poly.addNode(
    new ControllerNode(poly, 'controller', 'controller', 'NodeServer'));

  // Add a notice in the UI, remove it after 5 seconds;
  poly.addNotice('newController', 'Controller node initialized');

  // Waits 5 seconds, then delete the notice
  setTimeout(function() {
    poly.removeNotice('newController');
  }, 5000);
}


// Starts the NodeServer!
poly.start();
