'use strict';

// This is an example NodeServer Node definition.
// You need one per nodedefs.

// This is the Polyglot module that a node.js NodeServer needs
const PolyglotInterface = require('polyinterface');

// Utility function provided to facilitate logging.
const logger = PolyglotInterface.logger;

// nodeDefId must match the nodedef id in your nodedef
const nodeDefId = 'VNODE_DIMMER';

// This is your custom Node class, which has to be a inherited from
// PolyglotInterface.Node
module.exports = class MyNode extends PolyglotInterface.Node {
  // polyInterface: handle to the interface
  // address: Your node address, withouth the leading 'n999_'
  // primary: Same as address, if the node is a primary node
  // name: Your node name
  constructor(polyInterface, primary, address, name) {
    super(nodeDefId, polyInterface, primary, address, name);

    // Commands that this node can handle.
    // Should match the 'accepts' section of the nodedef.
    this.commands = {
      DON: this.onDON,
      DOF: this.onDOF,
      QUERY: this.onQuery,
    };

    // Status that this node has.
    // Should match the 'sts' section of the nodedef.
    this.drivers = {
      ST: {value: 0, uom: 51},
    };
  }

  onDON(message) {
    logger.info('DON (%s): %s',
      this.address,
      message.value ? message.value : 'No value');

    // setDrivers accepts string or number (message.value is a string
    this.setDriver('ST', message.value ? message.value : 100);
  }

  onDOF() {
    logger.info('DOF (%s)', this.address);

    this.setDriver('ST', 0);
  }
};

// Required, so that the interface can find this Node class using the nodeDefId
module.exports.nodeDefId = nodeDefId;

// Those are the standard properties of every nodes:
// this.id              - Nodedef ID
// this.polyInterface   - Polyglot interface
// this.primary         - Primary address
// this.address         - Node address
// this.name            - Node name
// this.timeAdded       - Time added (Date() object)
// this.enabled         - Node is enabled?
// this.added           - Node is added to ISY?
// this.commands        - List of allowed commands
//                        (You need to define them in your custom node)
// this.drivers         - List of drivers
//                        (You need to define them in your custom node)

// Those are the standard methods of every nodes:
// Get the driver object:
// this.getDriver(driver)

// Set a driver to a value (example set ST to 100)
// this.setDriver(driver, value, report=true, forceReport=false, uom=null)

// Send existing driver value to ISY
// this.reportDriver(driver, forceReport)

// Send existing driver values to ISY
// this.reportDrivers()

// When we get a query request for this node.
// Can be overridden to actually fetch values from an external API
// this.query()

// When we get a status request for this node.
// this.status()
