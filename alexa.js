let DEVICE_ENDPOINTS = [{
    "endpointId": 'a2-virtual-presence-kitchen',
    "manufacturerName": 'SmartHome A2',
    "description": 'Virtual device to control kitchen presence',
    "friendlyName": "Virtual Presence Kitchen",
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
},
{
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
}
];

//TODO: it seems there are endpoints limit
[
    "Atomic swirl",
    "Blue mood blobs",
    "Breath",
    "Candle",
    "Cinema brighten lights",
    "Cinema dim lights",
    "Cold mood blobs",
    //"Collision",
    //"Color traces",
    "Double swirl",
    "Fire",
    //"Flags Germany/Sweden",
    "Full color mood blobs",
    "Green mood blobs",
    //"Knight rider",
    //"Led Test",
    //"Light clock",
    "Lights",
    //"Notify blue",
    //"Pac-Man",
    "Plasma",
    //"Police Lights Single",
    //"Police Lights Solid",
    "Rainbow mood",
    "Rainbow swirl",
    "Rainbow swirl fast",
    "Random",
    "Red mood blobs",
    "Sea waves",
    //"Snake",
    //"Sparks",
    //"Strobe red",
    //"Strobe white",
    //"System Shutdown",
    "Trails",
    "Trails color",
    "Warm mood blobs",
    "Waves with Color",
    "X-Mas"
].forEach((effect, i) => {
    DEVICE_ENDPOINTS.push({
        "endpointId": effect,
        "manufacturerName": 'SmartHome A2',
        "description": "Hyperion Effect",
        "friendlyName": "Hyperion(" + effect + ")",
        "displayCategories": ["LIGHT"],
        "relationships": {
            "isConnectedBy": {
                "endpointId": "a2-light-v3"
            }
        },
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
        }, {
            "type": "AlexaInterface",
            "interface": "Alexa.BrightnessController",
            "version": "3",
            "properties": {
                "supported": [{
                    "name": "brightness"
                }],
                "retrievable": true
            }
        }],
        "connections": [],
        "cookie": {}
    })
})

function isValidToken() {
    //TODO
    return true;
}
let log = null;

module.exports = {
    DEVICE_ENDPOINTS: DEVICE_ENDPOINTS,

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

        //log('RESPONSE', JSON.stringify(response));
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
                "timestamp": date
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
