const DEVICE_ENDPOINTS = [{
    "endpointId": 'a2-light-v3',
    "manufacturerName": 'SmartHome A2',
    "description": 'Dimmable multicolor light bulb from SmartHome A2 Company',
    "friendlyName": "Ambilait",
    "displayCategories": ["LIGHT"],
    "capabilities": [{
            "type": "AlexaInterface",
            "interface": "Alexa.PowerController",
            "version": "3",
            "properties": {
                "supported": [{
                    "name": "powerState"
                }],
                "retrievable": true
            }
        },
        {
            "type": "AlexaInterface",
            "interface": "Alexa.BrightnessController",
            "version": "3",
            "properties": {
                "supported": [{
                    "name": "brightness"
                }],
                "retrievable": true
            }
        },
        {
            "type": "AlexaInterface",
            "interface": "Alexa.ColorController",
            "version": "3",
            "properties": {
                "supported": [{
                    "name": "color"
                }],
                "retrievable": true
            }
        }
    ],
    "connections": [],
    "cookie": {}
}, ];

function isValidToken() {
    //TODO
    return true;
}
let log = null;

module.exports = {

    setLogger: _log => {
        log = _log;
    },

    handleDiscovery: (directive, callback) => {

        const userAccessToken = directive.payload.scope.token.trim();
        if (!userAccessToken || !isValidToken(userAccessToken)) {
            const errorMessage = `Discovery directive [${directive.header.messageId}] failed. Invalid access token: ${userAccessToken}`;
            log('ERROR', errorMessage);
            callback(new Error(errorMessage));
        }

        const response = {
            event: {
                header: {
                    "messageId": directive.header.messageId,
                    name: 'Discover.Response',
                    namespace: "Alexa.Discovery",
                    payloadVersion: '3',
                },
                payload: {
                    endpoints: DEVICE_ENDPOINTS,
                }
            }
        };

        callback(null, response);
    },


    generateResponse: (name, payload, directive) => {
        return {
            header: {
                "namespace": "Alexa.ConnectedHome.Control",
                name: name,
                "messageId": directive.header.messageId,
                "correlationToken": directive.header.correlationToken,
                "payloadVersion": "3"
            },
            payload: payload,
        };
    },


    generateResponseState: (directive, state, headerName) => {
        let date = new Date().toISOString();
        return {
            "event": {
                "header": {
                    "messageId": directive.header.messageId,
                    "correlationToken": directive.header.correlationToken,
                    "namespace": "Alexa",
                    "name": headerName,
                    "payloadVersion": "3"
                },
                "endpoint": directive.header.endpoint,
                "payload": {}
            },
            "context": {
                "properties": [{
                        "namespace": "Alexa.PowerController",
                        "name": "powerState",
                        "value": state.powerState,
                        "timeOfSample": date,
                        "uncertaintyInMilliseconds": 500
                    }, {
                        "namespace": "Alexa.BrightnessController",
                        "name": "brightness",
                        "value": state.brightness,
                        "timeOfSample": date,
                        "uncertaintyInMilliseconds": 500
                    }, {
                        "namespace": "Alexa.ColorController",
                        "name": "color",
                        "value": state.color,
                        "timeOfSample": date,
                        "uncertaintyInMilliseconds": 500
                    },
                    {
                        "namespace": "Alexa.EndpointHealth",
                        "name": "connectivity",
                        "value": {
                            "value": "OK"
                        },
                        "timeOfSample": date,
                        "uncertaintyInMilliseconds": 0
                    }
                ]
            }
        };
    }
};
