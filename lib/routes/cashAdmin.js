"use strict";


module.exports = function(app, middleware, controllers) {

    app.get('/admin/cash', middleware.admin.buildHeader, controllers.cashAdmin.render);

};
