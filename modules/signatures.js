'use strict';

var async = require('async');
var constants = require('../helpers/constants.js');
var crypto = require('crypto');
var sandboxHelper = require('../helpers/sandbox.js');
var schema = require('../schema/signatures.js');
var Signature = require('../logic/signature.js');
var transactionTypes = require('../helpers/transactionTypes.js');

// Private fields
var modules, library, self, __private = {}, shared = {};

__private.assetTypes = {};

// Constructor
function Signatures (cb, scope) {
	library = scope;
	self = this;

	__private.assetTypes[transactionTypes.SIGNATURE] = library.logic.transaction.attachAssetType(
		transactionTypes.SIGNATURE, new Signature()
	);

	setImmediate(cb, null, self);
}

// Public methods
Signatures.prototype.isLoaded = function () {
	return !!modules;
};

Signatures.prototype.sandboxApi = function (call, args, cb) {
	sandboxHelper.callMethod(this.shared, call, args, cb);
};

// Events
Signatures.prototype.onBind = function (scope) {
	modules = scope;

	__private.assetTypes[transactionTypes.SIGNATURE].bind({
		modules: modules, library: library
	});
};

// Shared API
Signatures.prototype.shared = {
	getFee: function (req, cb) {
		var fee = constants.fees.secondsignature;

		return setImmediate(cb, null, {fee: fee});
	},

	addSignature: function (req, cb) {
		console.log('__________________________  Signatures ____________________________');
		library.schema.validate(req.body, schema.addSignature, function (err) {
			if (err) {
				return setImmediate(cb, err[0].message);
			}
			console.log('____________________  Signatures Validate ____________________________');

			var hash = crypto.createHash('sha256').update(req.body.secret, 'utf8').digest();
			var keypair = library.ed.makeKeypair(hash);

			if (req.body.publicKey) {
				if (keypair.publicKey.toString('hex') !== req.body.publicKey) {
					return setImmediate(cb, 'Invalid passphrase');
				}
			}
			console.log('______________  Signatures publicKey ____________________________');
			library.balancesSequence.add(function (cb) {
				if (req.body.multisigAccountPublicKey && req.body.multisigAccountPublicKey !== keypair.publicKey.toString('hex')) {
					console.log('______________________ Signatures Inside If ______________________________');
					modules.accounts.getAccount({publicKey: req.body.multisigAccountPublicKey}, function (err, account) {
						console.log('______________________ Signatures account ______________________________', account);
						if (err) {
							return setImmediate(cb, err);
						}

						if (!account || !account.publicKey) {
							return setImmediate(cb, 'Multisignature account not found');
						}

						if (!account.multisignatures || !account.multisignatures) {
							return setImmediate(cb, 'Account does not have multisignatures enabled');
						}

						if (account.multisignatures.indexOf(keypair.publicKey.toString('hex')) < 0) {
							return setImmediate(cb, 'Account does not belong to multisignature group');
						}

						if (account.secondSignature || account.u_secondSignature) {
							return setImmediate(cb, 'Account already has a second passphrase');
						}

						modules.accounts.getAccount({publicKey: keypair.publicKey}, function (err, requester) {
							console.log('__________________ Signatures Get Account _______________________');							if (err) {
								return setImmediate(cb, err);
							}

							if (!requester || !requester.publicKey) {
								return setImmediate(cb, 'Requester not found');
							}

							if (requester.secondSignature && !req.body.secondSecret) {
								return setImmediate(cb, 'Missing requester second passphrase');
							}

							if (requester.publicKey === account.publicKey) {
								return setImmediate(cb, 'Invalid requester public key');
							}

							var secondHash = crypto.createHash('sha256').update(req.body.secondSecret, 'utf8').digest();
							var secondKeypair = library.ed.makeKeypair(secondHash);
							var transaction;

							try {
								transaction = library.logic.transaction.create({
									type: transactionTypes.SIGNATURE,
									sender: account,
									keypair: keypair,
									requester: keypair,
									secondKeypair: secondKeypair,

								});
							} catch (e) {
								return setImmediate(cb, e.toString());
							}

							modules.transactions.receiveTransactions([transaction], true, cb);
						});
					});
				} else {
					console.log('______________________ Signatures Inside Else ______________________________');
					modules.accounts.setAccountAndGet({publicKey: keypair.publicKey.toString('hex')}, function (err, account) {
						console.log('______________________ Signatures account ______________________________', account);
						if (err) {
							return setImmediate(cb, err);
						}

						if (!account || !account.publicKey) {
							return setImmediate(cb, 'Account not found');
						}

						if (account.secondSignature || account.u_secondSignature) {
							return setImmediate(cb, 'Account already has a second passphrase');
						}

						var secondHash = crypto.createHash('sha256').update(req.body.secondSecret, 'utf8').digest();
						var secondKeypair = library.ed.makeKeypair(secondHash);
						var transaction;

						try {
							transaction = library.logic.transaction.create({
								type: transactionTypes.SIGNATURE,
								sender: account,
								keypair: keypair,
								secondKeypair: secondKeypair
							});
						} catch (e) {
							return setImmediate(cb, e.toString());
						}
						console.log('________________ Signatures transaction before before _________', transaction);
						modules.transactions.receiveTransactions([transaction], true, cb);
					});
				}

			}, function (err, transaction) {
				console.log('____________________ Signatures Final ___________________', err, transaction);
				if (err) {
					return setImmediate(cb, err);
				}
				return setImmediate(cb, null, {transaction: transaction[0]});
			});

		});
	}
};

// Export
module.exports = Signatures;
