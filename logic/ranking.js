'use strict';

var async = require('async');
var constants = require('../helpers/constants.js');
var exceptions = require('../helpers/exceptions.js');
var Diff = require('../helpers/diff.js');

// Private fields
var modules, library, self;

// Constructor
function Ranking () {
	self = this;
}

// Public methods
Ranking.prototype.bind = function (scope) {
	modules = scope.modules;
	library = scope.library;
};

Ranking.prototype.create = function (data, trs) {
	console.log('*************************   DATA ************************', data)
	trs.recipientId = data.sender.address;
	trs.asset.ranking = data.ranking;

	return trs;
};

Ranking.prototype.calculateFee = function (trs, sender) {
	return constants.fees.ranking;
};

Ranking.prototype.verify = function (trs, sender, cb) {
	if (trs.recipientId !== trs.senderId) {
		return setImmediate(cb, 'Invalid recipient');
	}

	if (!trs.asset || !trs.asset.ranking) {
		console.log('trs.asset   :: ', trs.asset);
		return setImmediate(cb, 'Invalid transaction asset');
	}

	if (!Array.isArray(trs.asset.ranking)) {
		return setImmediate(cb, 'Invalid ranking. Must be an array');
	}

	if (!trs.asset.ranking.length) {
		return setImmediate(cb, 'Invalid ranking. Must not be empty');
	}

	if (trs.asset.ranking && trs.asset.ranking.length > 33) {
		return setImmediate(cb, 'Ranking limit exceeded. Maximum is 33 ranking per transaction');
	}

	async.eachSeries(trs.asset.ranking, function (ranking, eachSeriesCb) {
		self.verifyRanking(ranking, function (err) {
			if (err) {
				return setImmediate(eachSeriesCb, ['Invalid raking at index', trs.asset.ranking.indexOf(ranking), '-', err].join(' '));
			} else {
				return setImmediate(eachSeriesCb);
			}
		});
	}, function (err) {
		if (err) {
			return setImmediate(cb, err);
		} else {
			return self.checkConfirmedDelegates(trs, cb);
		}
	});
};

Ranking.prototype.verifyRanking = function (rank, cb) {
	if (typeof rank !== 'string') {
		return setImmediate(cb, 'Invalid rank type');
	}

	if (!/[-+]{1}[0-9a-z]{64}/.test(rank)) {
		return setImmediate(cb, 'Invalid rank format');
	}

	if (rank.length !== 65) {
		return setImmediate(cb, 'Invalid rank length');
	}

	return setImmediate(cb);
};

Ranking.prototype.checkConfirmedDelegates = function (trs, cb) {
	modules.delegates.checkConfirmedDelegatesRanking(trs.senderPublicKey, trs.asset.ranking, function (err) {
		if (err && exceptions.ranking.indexOf(trs.id) > -1) {
			library.logger.debug(err);
			library.logger.debug(JSON.stringify(trs));
			err = null;
		}

		return setImmediate(cb, err);
	});
};

Ranking.prototype.checkUnconfirmedDelegates = function (trs, cb) {
	modules.delegates.checkUnconfirmedDelegatesRanking(trs.senderPublicKey, trs.asset.ranking, function (err) {
		if (err && exceptions.ranking.indexOf(trs.id) > -1) {
			library.logger.debug(err);
			library.logger.debug(JSON.stringify(trs));
			err = null;
		}

		return setImmediate(cb, err);
	});
};

Ranking.prototype.process = function (trs, sender, cb) {
	return setImmediate(cb, null, trs);
};

Ranking.prototype.getBytes = function (trs) {
	var buf;

	try {
		buf = trs.asset.ranking ? new Buffer(trs.asset.ranking.join(''), 'utf8') : null;
	} catch (e) {
		throw e;
	}

	return buf;
};

Ranking.prototype.apply = function (trs, block, sender, cb) {
	var parent = this;

	async.series([
		function (seriesCb) {
			self.checkConfirmedDelegates(trs, seriesCb);
		},
		function (seriesCb) {
			parent.scope.account.merge(sender.address, {
				rankings: trs.asset.ranking,
				blockId: block.id,
				round: modules.rounds.calc(block.height)
			}, function (err) {
				return setImmediate(cb, err);
			});
		}
	], cb);
};

Ranking.prototype.undo = function (trs, block, sender, cb) {
	if (trs.asset.ranking === null) { return setImmediate(cb); }

	var rankingInvert = Diff.reverse(trs.asset.ranking);

	this.scope.account.merge(sender.address, {
		rankings: rankingInvert,
		blockId: block.id,
		round: modules.rounds.calc(block.height)
	}, function (err) {
		return setImmediate(cb, err);
	});
};

Ranking.prototype.applyUnconfirmed = function (trs, sender, cb) {
	var parent = this;

	async.series([
		function (seriesCb) {
			self.checkUnconfirmedDelegates(trs, seriesCb);
		},
		function (seriesCb) {
			parent.scope.account.merge(sender.address, {
				u_rankings: trs.asset.ranking
			}, function (err) {
				return setImmediate(seriesCb, err);
			});
		}
	], cb);
};

Ranking.prototype.undoUnconfirmed = function (trs, sender, cb) {
	if (trs.asset.ranking === null) { return setImmediate(cb); }

	var rankingInvert = Diff.reverse(trs.asset.ranking);

	this.scope.account.merge(sender.address, {u_rankings: rankingInvert}, function (err) {
		return setImmediate(cb, err);
	});
};

Ranking.prototype.schema = {
	id: 'Ranking',
	type: 'object',
	properties: {
		ranking: {
			type: 'array',
			minLength: 1,
			maxLength: constants.activeDelegates,
			uniqueItems: true
		}
	},
	required: ['ranking']
};

Ranking.prototype.objectNormalize = function (trs) {
	var report = library.schema.validate(trs.asset, Ranking.prototype.schema);

	if (!report) {
		throw 'Failed to validate ranking schema: ' + this.scope.schema.getLastErrors().map(function (err) {
			return err.message;
		}).join(', ');
	}

	return trs;
};

Ranking.prototype.dbRead = function (raw) {
	// console.log(raw.v_votes);

	if (!raw.r_ranking) {
		return null;
	} else {
		var ranking = raw.r_ranking.split(',');

		return {ranking: ranking};
	}
};

Ranking.prototype.dbTable = 'ranking';

Ranking.prototype.dbFields = [
	'ranking',
	'transactionId'
];

Ranking.prototype.dbSave = function (trs) {
	return {
		table: this.dbTable,
		fields: this.dbFields,
		values: {
			ranking: Array.isArray(trs.asset.ranking) ? trs.asset.ranking.join(',') : null,
			transactionId: trs.id
		}
	};
};

Ranking.prototype.ready = function (trs, sender) {
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
module.exports = Ranking;
