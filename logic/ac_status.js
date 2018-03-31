'use strict';

var constants = require('../helpers/constants.js');

// Private fields
var modules, library;

// Constructor
function Acstatus () {}

// Public methods
Acstatus.prototype.bind = function (scope) {
	modules = scope.modules;
	library = scope.library;
};

Acstatus.prototype.create = function (data, trs) {
	trs.recipientId = null;
	trs.amount = 0;
	trs.asset.ac_status = {
		status: data.status,
		publicKey: data.sender.publicKey
	};

	return trs;
};

Acstatus.prototype.getBytes = function (trs) {
	if (!trs.asset.ac_status.status) {
		return null;
	}

	var buf;

	try {
		buf = new Buffer(trs.asset.ac_status.status);
		buf.writeUInt8(0x3, 0);
	} catch (e) {
		throw e;
	}

	return buf;
};

Acstatus.prototype.calculateFee = function (trs, sender) {
	return constants.fees.account;
};

Acstatus.prototype.verify = function (trs, sender, cb) {
	if (trs.recipientId) {
		return setImmediate(cb, 'Invalid recipient');
	}

	if (trs.amount !== 0) {
		return setImmediate(cb, 'Invalid transaction amount');
	}

	if (!trs.asset || !trs.asset.ac_status) {
		return setImmediate(cb, 'Invalid transaction asset');
	}

	var isAddress = /^[0-9]{1,21}[BL|bl]$/g;
	var allowSymbols = /^[a-z0-9!@$&_.]+$/g;

	var status = trs.asset.ac_status.status;
	/*if (status != 0 || status != 1) {
		return setImmediate(cb, 'Invalid status');
	}*/

	return setImmediate(cb, null, trs);
};

Acstatus.prototype.process = function (trs, sender, cb) {
	return setImmediate(cb, null, trs);
};

Acstatus.prototype.apply = function (trs, block, sender, cb) {
	var data = {
		address: sender.address,
		u_status: trs.asset.ac_status.status,
		status: trs.asset.ac_status.status
	};

	modules.accounts.setAccountAndGet(data, cb);
};

Acstatus.prototype.undo = function (trs, block, sender, cb) {
	var data = {
		address: sender.address,
		u_status: trs.asset.ac_status.status == 0?1:0,
		status: !trs.asset.ac_status.status == 0?1:0
	};

	modules.accounts.setAccountAndGet(data, cb);
};

Acstatus.prototype.applyUnconfirmed = function (trs, sender, cb) {
	var data = {
		address: sender.address,
		u_status: trs.asset.ac_status.status,
		status: trs.asset.ac_status.status
	};

	modules.accounts.setAccountAndGet(data, cb);
};

Acstatus.prototype.undoUnconfirmed = function (trs, sender, cb) {
	var data = {
		address: sender.address,
		u_status: trs.asset.ac_status.status == 0 ? 1:0,
		status: trs.asset.ac_status.status == 0 ? 1:0
	};

	modules.accounts.setAccountAndGet(data, cb);
};

Acstatus.prototype.schema = {
	id: 'AcStatus',
	type: 'object',
	properties: {
		publicKey: {
			type: 'string',
			format: 'publicKey'
		}
	},
	required: ['publicKey']
};

Acstatus.prototype.objectNormalize = function (trs) {
	var report = library.schema.validate(trs.asset.ac_status, Acstatus.prototype.schema);

	if (!report) {
		throw 'Failed to validate AcStatus schema: ' + this.scope.schema.getLastErrors().map(function (err) {
			return err.message;
		}).join(', ');
	}

	return trs;
};

Acstatus.prototype.dbRead = function (raw) {
	if (!raw.d_status) {
		return null;
	} else {
		var ac_status = {
			status: raw.d_status,
			publicKey: raw.t_senderPublicKey,
			address: raw.t_senderId
		};

		return {ac_status: ac_status};
	}
};

Acstatus.prototype.dbTable = 'ac_status';

Acstatus.prototype.dbFields = [
	'status',
	'transactionId'
];

Acstatus.prototype.dbSave = function (trs) {
	return {
		table: this.dbTable,
		fields: this.dbFields,
		values: {
			status: trs.asset.ac_status.status,
			transactionId: trs.id
		}
	};
};

Acstatus.prototype.ready = function (trs, sender) {
	if (Array.isArray(sender.multisignatures) && sender.multisignatures.length) {
		if (!Array.isArray(trs.signatures)) {
			return false;
		}
		return trs.signatures.length >= sender.multimin;
	} else {
		return true;
	}
};

// Export
module.exports = Acstatus;
