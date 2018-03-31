'use strict';

module.exports = {
	currentVersion: "1.0.1",
	minVersion: [
		{ height: 1,      ver: "^1.0.1"},
		{ height: 600000, ver: "^1.0.1"}
	],
	activeDelegates: 101,
	addressLength: 208,
	blockHeaderLength: 248,
	blockTime: 10000,
	blockReceiptTimeOut: 10*2, // 2 blocks
	confirmationLength: 77,
	epochTime: new Date(Date.UTC(2016, 4, 24, 17, 0, 0, 0)),
	fees: {
		send: 10000000,
		vote: 100000000,
		secondsignature: 500000000,
		delegate: 6000000000,
		multisignature: 500000000,
		dapp: 2500000000,
		account:0,
		ranking:10000000,
		basic:10000000,
		education:10000000,
		financial:10000000,
		civil:10000000
	},
	feeStart: 1,
	feeStartVolume: 10000 * 100000000,
	fixedPoint: Math.pow(10, 8),
	maxAddressesLength: 208 * 128,
	maxAmount: 100000000,
	maxConfirmations: 77 * 100,
	maxPayloadLength: 1024 * 1024 * 200,
	maxPeers: 100,
	maxRequests: 10000 * 12,
	maxSharedTxs: 10000,
	maxSignaturesLength: 196 * 256,
	maxTxsPerBlock: 5000,
	minBroadhashConsensus: 51,
	nethashes: [
		// Mainnet
		'7337a324ef27e1e234d1e9018cacff7d4f299a09c2df9be460543b8f7ef652f1',
		// Testnet
		'cba57b868c8571599ad594c6607a77cad60cf0372ecde803004d87e679117c12'
	],
	numberLength: 100000000,
	requestLength: 104,
	rewards: {
		milestones: [
            100000000,  // Initial reward
            70000000,  // Milestone 1
            50000000,  // Milestone 2
            30000000,  // Milestone 3
            20000000   // Milestone 4
		],
		offset: 10,   // Start rewards at block (n)
		distance: 1168000, // Distance between each milestone ~ 1 year
	},
	signatureLength: 196,
	totalAmount: 1009000000000000,
	unconfirmedTransactionTimeOut: 10800, // 1080 blocks
	addressPostfix: 'BL'
};
