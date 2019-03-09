# poly-template-nodejs

This is a Poly template using Node.js.

It works with both Polyglot V2 (On-premises installation) and Polyglot cloud.

To start developing your Nodeserver, it is easier to set up and test 
with Polyglot V2. If you don't need such things as oAuth authentication 
to cloud services, you can fully develop your node server on-premises. 

To get started with an on-premise installation: 
1. Install Polyglot-V2. [Instructions here](https://github.com/UniversalDevicesInc/polyglot-v2)
2. Make sure you have Node.js & NPM installed

```
sudo apt install nodejs
sudo apt install npm
```

3. Install this node server

```
cd ~/.polyglot/nodeservers
git clone https://github.com/UniversalDevicesInc/poly-template-nodejs
npm install
```

For help developing your node server, refer to the [node.js polyinterface documentation here](https://github.com/UniversalDevicesInc/polyglot-v2-nodejs-interface)

To get instructions for the cloud version, refer to the [node.js PGC documentation here](https://github.com/UniversalDevicesInc/pgc-nodejs-interface)
