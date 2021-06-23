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

        let envKeyEndpointId = newState.endpointId.replace(/-/g, "_");
        let host = process.env.PASSTHROUGH_HOST;
        let path = process.env.PASSTHROUGH_PATH;
        let body = JSON.stringify(newState);
        if (process.env[envKeyEndpointId + "_host"]) {
            host = process.env[envKeyEndpointId + "_host"];
            if (host && host.indexOf("ifttt") >= 0) {
                body = "";
            }
        }
        if (process.env[envKeyEndpointId + "_path"]) {
            path = process.env[envKeyEndpointId + "_path"];
        }
        let post_req = https.request({
            host: host,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, function (res) {
            resolve();
        });
        post_req.on('error', function (e) {
            log("passthrough", "Got error: " + e.message);
            reject();
        });
        //log("state",body)
        // post the data
        post_req.write(body);
        post_req.end();
    });

}


exports.handler = (request, context, callback) => {
    let directive = request.directive;
    if (request.source == "aws.events") {
        console.log('Event triggered, turning off VIRTUAL PRESENCE KITCHEN');
        directive = {
            "header": {
                "namespace": "Alexa.PowerController",
                "name": "TurnOff"
            },
            "endpoint": {
                "endpointId": "a2-virtual-presence-kitchen"
            }
        }
    }
    let sendPassthrough = true;
    switch (directive.header.namespace) {
        case "Alexa.Discovery":
            alexa.handleDiscovery(directive, callback);
            break;
        default:
            {
                let manageStateResponse = (currentStates) => {
                    let response = alexa.generateResponseState(directive, currentStates[state.getEndpointId(directive)]);
                    //log("Response", JSON.stringify(response))
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
                        if (directive.endpoint.endpointId == "a2-virtual-presence-kitchen") {
                            sendPassthrough = false;
                            let ruleName = "launch-lambda-rule"
                            let AWS = require('aws-sdk');
                            let date = new Date(new Date().getTime() + 2 * 60000);
                            AWS.config.update({ region: 'eu-west-1' });
                            // Create CloudWatchEvents service object
                            var cwevents = new AWS.CloudWatchEvents({ apiVersion: '2015-10-07' });
                            var params = {
                                Name: ruleName,
                                ScheduleExpression: `cron(${date.getUTCMinutes()} ${date.getUTCHours()} ${date.getDate()} ${date.getMonth() + 1} ? ${date.getFullYear()})`,
                                State: 'ENABLED'
                            };
                            cwevents.putRule(params, function (err, data) {
                                if (err) {
                                    console.log("Error putting Rule", err);
                                }
                                /* else {
                                     console.log("Success putting Rule");
                                 }*/
                            });
                        }
                    case "TurnOff":
                    case "SetBrightness":
                    case "SetColor":
                    case "Activate":
                        state.get()
                            .then((previousStates) => {
                                let newState = state.getNewState(directive, previousStates);
                                let promises = [];
                                if (sendPassthrough) {
                                    promises.push(passthrough(newState));
                                }
                                promises.push(state.put(newState, previousStates));
                                Promise.all(promises)
                                    .then(res => {
                                        manageStateResponse(res[promises.length - 1]);
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
