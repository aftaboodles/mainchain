'use strict';

var Router = require('../../helpers/router');
var httpApi = require('../../helpers/httpApi');
var schema = require('../../schema/accounts.js');

// Constructor
function AccountsHttpApi (accountsModule, app) {

	var router = new Router();

	router.map(accountsModule.shared, {
		'post /open': 'open',
		'get /getBalance': 'getBalance',
		'get /getPublicKey': 'getPublickey',
		'post /generatePublicKey': 'generatePublicKey',
		'get /delegates': 'getDelegates',
		'get /delegates/fee': 'getDelegatesFee',
		'put /delegates': 'addDelegates',
		'put /delegates/ranking': 'addRanking',
		'get /': 'getAccount',
		'post /generate': 'generateAddress'
	});

	router.map(accountsModule.internal, {
		'get /count': 'count'
	});

	if (process.env.DEBUG && process.env.DEBUG.toUpperCase() === 'TRUE') {
		router.map(accountsModule.internal, {'get /getAllAccounts': 'getAllAccounts'});
	}

	if (process.env.TOP && process.env.TOP.toUpperCase() === 'TRUE') {
		router.get('/top', httpApi.middleware.sanitize('query', schema.top, accountsModule.internal.top));
	}

	httpApi.registerEndpoint('/api/accounts', app, router, accountsModule.isLoaded);
}

module.exports = AccountsHttpApi;
