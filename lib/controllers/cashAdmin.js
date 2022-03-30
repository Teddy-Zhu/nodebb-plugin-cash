"use strict";

var cashAdminController = {},
    cashAdmin = require('../cashAdmin');


cashAdminController.render = function(req, res, callback) {

    cashAdmin.view(req, res, function (data){
        res.render('admin', data);
    });
};


module.exports = cashAdminController;
