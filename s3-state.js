const
    AWS = require('aws-sdk'),
    S3 = new AWS.S3();

let log = null;
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

    getNewState: (directive, previousState) => {
        let newState = JSON.parse(JSON.stringify(previousState));
        newState.action = directive.header.name;
        if (directive.header.name == "TurnOn") {
            newState.powerState = "ON";
        }
        else if (directive.header.name == "TurnOff") {
            newState.powerState = "OFF";
        }
        else if (directive.header.name == "AdjustBrightness") {
            newState.brightness = previousState.brightness + directive.payload.brightnessDelta;
        }
        if (directive.payload.brightness) {
            newState.brightness = directive.payload.brightness;
        }
        else if (directive.payload.color) {
            newState.color = directive.payload.color;
        }

        return newState;
    },
    put: (newState) => {

        return new Promise((resolve, reject) => {

            S3.putObject({
                    Bucket: 'thinger',
                    Key: 'state.json',
                    Body: JSON.stringify(newState)
                })
                .promise()
                .then(() => {
                    resolve(newState);
                })
                .catch(e => {
                    log('ERROR', e);
                    reject();
                });
        });
    }
};
