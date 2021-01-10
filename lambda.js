
// Lambda Adapter for leadconduit-custom
// Generated on Thu Jan 07 2021 13:15:23 GMT-0500 (Eastern Standard Time)

const runner = require('.rip/runner');
const handle = require('.rip/handle');

function form( event, context, callback ) {
    const integration = handle.create('form');
    return runner( integration, event, context, callback );
}
function json( event, context, callback ) {
    const integration = handle.create('json');
    return runner( integration, event, context, callback );
}
function query( event, context, callback ) {
    const integration = handle.create('query');
    return runner( integration, event, context, callback );
}
function xml( event, context, callback ) {
    const integration = handle.create('xml');
    return runner( integration, event, context, callback );
}
function soap( event, context, callback ) {
    const integration = handle.create('soap');
    return runner( integration, event, context, callback );
}

let lambda = {};
lambda.form = form;
lambda.json = json;
lambda.query = query;
lambda.xml = xml;
lambda.soap = soap;

module.exports = lambda;
