const DEVICE_ENDPOINTS = [{
    "endpointId": 'a2-light-v3',
    "manufacturerName": 'SmartHome A2',
    "description": 'Dimmable multicolor led strip from SmartHome A2 Company',
    "friendlyName": "Television Light",
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
}, {
    "endpointId": 'a2-light-v3-lamparita',
    "manufacturerName": 'SmartHome A2',
    "description": 'Little lamp from SmartHome A2 Company',
    "friendlyName": "Lamparita",
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
    }],
    "connections": [],
    "cookie": {}
}, {
    "endpointId": 'a2-rainbow-light-v3',
    "manufacturerName": 'SmartHome A2',
    "description": 'Rainbow led strip from SmartHome A2 Company',
    "friendlyName": "Rainbow",
    "displayCategories": ["SCENE_TRIGGER"],
    "cookie": {},
    "capabilities": [{
        "type": "AlexaInterface",
        "interface": "Alexa.SceneController",
        "version": "3",
        "supportsDeactivation": false
    }]
}];

const enpointsMatches = {
    //'a2-light-v3':'a2-light-v3',
    'a2-rainbow-light-v3': 'a2-light-v3',
    //'a2-light-v3-lamparita':'a2-light-v3-lamparita'
}

function isValidToken() {
    //TODO
    return true;
}
let log = null;

module.exports = {

    enpointsMatches: enpointsMatches,

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


    generateResponseState: (directive, state) => {

        let headerName = directive.header.name == "ReportState" ? "StateReport" : "Response";
        let namespace = "Alexa";
        if (directive.header.name == "Activate") {
            headerName = "ActivationStarted";
            namespace = "Alexa.SceneController"
        }
        let date = new Date().toISOString();
        let properties = [];
        let payload = {};
        properties.push({
            "namespace": "Alexa.EndpointHealth",
            "name": "connectivity",
            "value": {
                "value": "OK"
            },
            "timeOfSample": date,
            "uncertaintyInMilliseconds": 0
        })
        if (headerName == "ActivationStarted") {
            payload = {
                "cause": {
                    "type": "VOICE_INTERACTION"
                },
                "timestamp": "2017-09-27T18:30:30.45Z"
            }
        }
        else {

            if (state.powerState) {
                properties.push({
                    "namespace": "Alexa.PowerController",
                    "name": "powerState",
                    "value": state.powerState,
                    "timeOfSample": date,
                    "uncertaintyInMilliseconds": 500
                });
            }
            if (state.brightness) {
                properties.push({
                    "namespace": "Alexa.BrightnessController",
                    "name": "brightness",
                    "value": state.brightness,
                    "timeOfSample": date,
                    "uncertaintyInMilliseconds": 500
                });
            }
            if (state.color) {
                properties.push({
                    "namespace": "Alexa.ColorController",
                    "name": "color",
                    "value": state.color,
                    "timeOfSample": date,
                    "uncertaintyInMilliseconds": 500
                });
            }
        }
        return {
            "event": {
                "header": {
                    "messageId": directive.header.messageId,
                    "correlationToken": directive.header.correlationToken,
                    "namespace": namespace,
                    "name": headerName,
                    "payloadVersion": "3"
                },
                "endpoint": directive.header.endpoint,
                "payload": payload,
            },
            "context": {
                "properties": properties
            }
        };
    }
};
