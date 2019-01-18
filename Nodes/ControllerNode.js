'use strict';

// The controller node is a regular ISY node. It must be the first node created
// by the node server. It has an ST status showing the nodeserver status, and
// optionally node statuses. It usually has a few commands on the node to
// facilitate interaction with the nodeserver from the admin console or
// ISY programs.

// This is the Polyglot module that a node.js NodeServer needs
const Polyglot = require('polyinterface');

// Utility function provided to facilitate logging.
const logger = PolyglotInterface.logger;

// In this example, we also need to have our custom node because we create
// nodes from this controller. See onCreateNew
const MyNode = require('./MyNode.js');

// nodeDefId must match the nodedef id in your nodedef
const nodeDefId = 'CONTROLLER';


module.exports = class Controller extends Polyglot.Node {
  // polyInterface: handle to the interface
  // address: Your node address, withouth the leading 'n999_'
  // primary: Same as address, if the node is a primary node
  // name: Your node name
  constructor(polyInterface, primary, address, name) {
    super(nodeDefId, polyInterface, primary, address, name);

    // Commands that this controller node can handle.
    // Should match the 'accepts' section of the nodedef.
    this.commands = {
      CREATE_NEW: this.onCreateNew,
      DISCOVER: this.onDiscover,
      UPDATE_PROFILE: this.onUpdateProfile,
      REMOVE_NOTICES: this.onRemoveNotices,
      QUERY: this.query,
    };

    // Status that this controller node has.
    // Should match the 'sts' section of the nodedef.
    this.drivers = {
      ST: { value: 0, uom: 2 }, // uom 2 = Boolean.
    };
  }

  // Creates a new node using MyNode class, using a sequence number.
  // It needs to be an async function because we use the
  // this.polyInterface.addNode async function
  async onCreateNew() {
    const prefix = 'node';
    const nodes = this.polyInterface.getNodes();

    // Finds the first available address and creates a node.
    for (let seq = 0; seq < 999; seq++) {
      // address will be <prefix><seq>
      const address = prefix + seq.toString().padStart(3, '0');

      if (!nodes[address]) {
        // ISY Address will be n<profileNum>_<prefix><seq>
        // name will be <prefix><seq>
        try {
          const result = await this.polyInterface.addNode(
            new MyNode(this.polyInterface, this.address, address, address)
          );

          logger.info('Add node worked: %s', result);
        } catch (err) {
          logger.errorStack(err, 'Add node failed:');
        }
        break;
      }
    }
  }

  // Here you could discover devices from a 3rd party API
  onDiscover() {
    logger.info('Discovering');
  }

  // Sends the profile files to ISY
  onUpdateProfile() {
    this.polyInterface.updateProfile();
  }

  // Removes notices from the Polyglot UI
  onRemoveNotices() {
    this.polyInterface.removeNoticesAll();
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
