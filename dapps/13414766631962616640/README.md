# Belrium Dapps (Sidechain) SDK

The official SDK for building dapps on the [Belrium](https://www.belfrics.in) decentralized application platform.

## Directory Structure

  * **modules** - Contains the backend code of your dapp.
  * **public** - Contains the frontend user interface of your dapp.
  * **blockchain.json** - JSON file describing the SQL database schema. You will need this if you want to store any data within your dapp.
  * **config.json** - JSON file containing your dapp's configuration data. By default this file defines a list of peers.
  * **genesis.json** - JSON file containing important information about your dapp's genesis block.
  * **index.js** - JavaScript file used to start your dapp.
  * **modules.full.json** - JSON file containing a list of defined modules, required by **index.js**.
  * **routes.json** - JSON file defining the HTTP routes of every endpoint in your dapp's API.


## Authors

- Pankaj K. Yadav <pankaj.kumar@oodlestechnologies.com>
