'use strict';

function log(title, msg) {
    console.log(`[${title}] ${msg}`);
}

const https = require('https'),
    state = require('./s3-state'),
    alexa = require('./alexa');

state.setLogger(log);
alexa.setLogger(log);

function passthrough(newState) {

    return new Promise((resolve, reject) => {
        let post_req = https.request({
            host: process.env.PASSTHROUGH_HOST,
            path: process.env.PASSTHROUGH_PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(newState))
            }
        }, function(res) {
            resolve();
        });
        post_req.on('error', function(e) {
            log("passthrough", "Got error: " + e.message);
            reject();
        });

        // post the data
        post_req.write(JSON.stringify(newState));
        post_req.end();
    });

}


exports.handler = (request, context, callback) => {
    let directive = request.directive;

    switch (directive.header.namespace) {
        case "Alexa.Discovery":
            alexa.handleDiscovery(directive, callback);
            break;
        default:
            {
                let manageStateResponse = (currentStates) => {
                    let response = alexa.generateResponseState(directive, currentStates[state.getEndpointId(directive)]);
                    log("Response", JSON.stringify(response))
                    callback(null, response);
                };
                let manageErrorResponse = (e) => {
                    let errorTag = `ERROR-${directive.header.name}`;
                    log(errorTag, e);
                    callback(null, alexa.generateResponse(errorTag, {}, directive));
                };

                switch (directive.header.name) {
                    case "AdjustBrightness":
                    case "TurnOn":
                    case "TurnOff":
                    case "SetBrightness":
                    case "SetColor":
                    case "Activate":
                        state.get()
                            .then((previousStates) => {
                                let newState = state.getNewState(directive, previousStates);
                                Promise.all([
                                        passthrough(newState),
                                        state.put(newState, previousStates)
                                    ])
                                    .then(res => {
                                        manageStateResponse(res[1]);
                                    })
                                    .catch(manageErrorResponse);
                            })
                            .catch(manageErrorResponse);
                        break;
                    case "ReportState":
                        state.get()
                            .then(manageStateResponse)
                            .catch(manageErrorResponse);
                        break;
                    default:
                        {
                            manageErrorResponse(`No supported directive name: ${directive.header.name}`);
                            return;
                        }
                }
                break;

            }
    }
};
