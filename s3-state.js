const
    alexa = require('./alexa'),
    AWS = require('aws-sdk'),
    S3 = new AWS.S3();

let log = null

let getRelatedEndpointId = directive => {
    let devices = alexa.DEVICE_ENDPOINTS.filter(device => device.endpointId == directive.endpoint.endpointId);
    if (devices.length > 0 && devices[0].relationships && devices[0].relationships.isConnectedBy &&
        devices[0].relationships.isConnectedBy.endpointId != null) {
        return devices[0].relationships.isConnectedBy.endpointId;
    }
    return null;
}

let getEndpointId = directive => {
    //check relationships
    let relatedEndpointId = getRelatedEndpointId(directive);
    if (relatedEndpointId != null) {
        return relatedEndpointId;
    }
    return directive.endpoint.endpointId;
};

module.exports = {

    setLogger: _log => {
        log = _log
    },

    get: (stateResponse) => {
        return new Promise((resolve, reject) => {
            S3.getObject({
                Bucket: 'thinger',
                Key: 'state.json',
                ResponseContentType: 'application/json'
            })
                .promise()
                .then((res) => {
                    resolve(JSON.parse(res.Body.toString('utf-8')));
                })
                .catch(e => {
                    log('ERROR', e);
                    reject({});
                });
        });
    },

    getEndpointId: getEndpointId,


    getNewState: (directive, _previousStates) => {

        let endpointId = getEndpointId(directive);
        let previousState = _previousStates[endpointId];
        if (!previousState) {
            previousState = {};
        }
        let newState = JSON.parse(JSON.stringify(previousState));

        newState.endpointId = endpointId;
        newState.powerState = "ON";
        newState.setScene = "";

        if (directive.header.name == "TurnOff") {
            newState.powerState = "OFF";
        }
        else if (directive.header.name == "AdjustBrightness") {
            newState.brightness = previousState.brightness + directive.payload.brightnessDelta;
        }
        else if (directive.header.name == "Activate") {
            newState.scene = directive.header.name;
            newState.setScene = directive.header.name;
        }
        else if (directive.header.name == "SetColor") {
            newState.scene = directive.header.name;
            newState.setScene = directive.header.name;
        }
        if (directive.payload) {
            if (directive.payload.brightness) {
                newState.brightness = directive.payload.brightness;
            }
            else if (directive.payload.color) {
                newState.color = directive.payload.color;
            }
        }

        if (previousState.powerState == "OFF" && newState.powerState == "ON") {
            newState.setScene = newState.scene;
        }
        //hyperion effects
        if (getRelatedEndpointId(directive) == "a2-light-v3") {
            newState.scene = directive.endpoint.endpointId;
            newState.setScene = directive.endpoint.endpointId;
            newState.powerState = "ON";
        }

        return newState;
    },
    put: (newState, previousStates) => {
        previousStates[newState.endpointId] = newState;

        return new Promise((resolve, reject) => {

            S3.putObject({
                Bucket: 'thinger',
                Key: 'state.json',
                Body: JSON.stringify(previousStates)
            })
                .promise()
                .then(() => {
                    resolve(previousStates);
                })
                .catch(e => {
                    log('ERROR', e);
                    reject();
                });
        });
    }
};
