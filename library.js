var	fs = require('fs'),
	path = require('path'),
	nconf = require.main.require('nconf'),
	meta = require.main.require('./src/meta'),
	user = require.main.require('./src/user');

var constants = Object.freeze({
	'name': "Cash MOD",
	'admin': {
		'route': '/cash',
		'icon': 'icon-money'
	},
	'defaults': {
		'pay_per_character': 0.25,
		'currency_name': 'gp'
	}
});


function initialize(app, middleware, controllers) {
	require('./lib/controllers')(controllers);
	require('./lib/routes/cashAdmin')(app, middleware,controllers);
}
CashMOD = {
	init:function (params, callback){
		var router = params.router,
			middleware = params.middleware,
			controllers = params.controllers;

		initialize(router, middleware, controllers);
		callback();
	},
	// TODO: Move these into an "admin" class, I cannot do this until plugins.js is updated to register hooks as such
	admin_registerPlugin: function(custom_header, callback) {
		custom_header.plugins.push({
			"route": constants.admin.route,
			"icon": constants.admin.icon,
			"name": constants.name
		});

		return custom_header;
	},
	admin_addRoute: function(custom_routes, callback) {
		fs.readFile(path.resolve(__dirname, './static/admin.tpl'), function (err, template) {
			custom_routes.routes.push({
				"route": constants.admin.route,
				"method": "get",
				"options": function(req, res, callback) {
					callback({
						req: req,
						res: res,
						route: constants.admin.route,
						name: constants.name,
						content: template
					});
				}
			});

			callback(null, custom_routes);
		});
	},


	addProfileInfo: function(profileInfo, callback) {
		var currency_name = meta.config['cash:currency_name'] || constants.defaults.constants.defaults.currency_name;

		user.getUserField(profileInfo.uid, 'currency', function(err, data) {
			profileInfo.profile += "<span class='cash-mod-currency'><img src='" + nconf.get('url') + "plugins/nodebb-plugin-cash/coin1.png' /> " + (data || 0) + " " + currency_name + "</span>";
			callback(err, profileInfo);
		});
	},

	increaseCurrencyByPostData: function(postData) {
		var multiplier = meta.config['cash:pay_per_character'] || constants.defaults.pay_per_character,
			uid = postData.uid,
			postLength = postData.content.length,
			value = Math.floor(multiplier * postLength);

		user.incrementUserFieldBy(uid, 'currency', value);

		setTimeout(function() {
			global.io.sockets.in('uid_' + uid).emit('event:alert', {
				alert_id: 'currency_increased',
				message: 'You earned <strong>' + value + ' gold</strong> for posting',
				type: 'info',
				timeout: 2500
			});
		}, 750);

	}


};

module.exports = CashMOD;
