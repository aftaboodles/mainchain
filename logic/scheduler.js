'user strict';
var Mnemonic = require('bitcore-mnemonic');
var httpCall = require('../helpers/httpCall.js');
var Promise = require("bluebird");

__private = {};
const GET = 'get',
	POST = 'post',
	WALLET_SEARCH = '/api/v1/users/wallets/search';
	WALLET_UPDATE = '/api/v1/users/wallet';

__private.code = function (){
	var code = new Mnemonic(Mnemonic.Words.ENGLISH);
    return code.toString();
}
var accounts = null;
var transactions = null;

function wallet (account, transaction, users, cb){

	accounts = account;
	transactions = transaction;

		var promoses = [];
		users.forEach(function (user){
			promoses.push(__private.openAccount(user, __private.code()));
		});
		Promise.all(promoses).then (function (finalResult){
			__private.initialCoin(finalResult.address);
			cb(null, finalResult)
		}).catch(function (err){
			console.log('Catch exception : ', err)
			cb(err, null);
		})
}
__private.initialCoin = function (address) {
	console.log('Address ', address)
	var payload = {
    	"secret": "frozen hour curious thunder relief accuse soccer region resource marine juice chicken",
    	"amount": 20000000000,
    	"recipientId": address,
    	"publicKey": "4600100dcf2ba6fcd4463c3bd8153302881ae048eb99720ef608629815576f1a"
	}
	transactions.initialCoin({body: payload}, function (err, data){
		console.log(err, data)
	});
}
__private.openAccount = function (user, secret){
	return new Promise(function (resolve, reject){
		accounts.openAccountForKYC(secret, function (err, account){
			if(!err){
				resolve({
					id: user,
					address: account.address,
					public_key: account.publicKey,
					passphrase: secret
				});
			} else{
				resolve({});
			}
		})
	});
}

module.exports = {

	wallet : wallet

}
