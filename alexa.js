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
        }
    ],
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
},
{
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
},
{
    "endpointId": 'a2-emulator',
    "manufacturerName": 'SmartHome A2',
    "description": 'Emulador Retropie',
    "friendlyName": "Emulador",
    "displayCategories": ["TV"],
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
    "endpointId": 'a2-raspi-hdmi-panasonic',
    "manufacturerName": 'SmartHome A2',
    "description": 'TV Panasonic HDMI Raspi',
    "friendlyName": "TV Panasonic HDMI Raspi",
    "displayCategories": ["TV"],
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
    "endpointId": 'a2-nightstands',
    "manufacturerName": 'SmartHome A2',
    "description": 'Nightstands lamps',
    "friendlyName": 'Nightstands lamps',
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
    ],
    "connections": [],
    "cookie": {}
},
{
    "endpointId": 'a2-headboard',
    "manufacturerName": 'SmartHome A2',
    "description": 'Heardboard',
    "friendlyName": 'Heardboard',
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
    ],
    "connections": [],
    "cookie": {}
}
];


/*["Cinema brighten lights",
"Cinema dim lights",
"Knight rider",
"Blue mood blobs",
"Cold mood blobs",
"Full color mood blobs",
"Green mood blobs",
"Red mood blobs",
"Warm mood blobs",
"Police Lights Single",
"Police Lights Solid",
"Rainbow mood",
"Rainbow swirl fast",
"Rainbow swirl",
"Random",
"Running dots",
"System Shutdown",
"Snake",
"Sparks Color",
"Sparks",
"Strobe blue",
"Strobe Raspbmc",
"Strobe white",
"Color traces",
//"UDP multicast listener",
//"UDP listener",
"X-Mas"
];*/
[].forEach((effect, i) => {
DEVICE_ENDPOINTS.push({
    "endpointId": effect,
    "manufacturerName": 'SmartHome A2',
    "description": "Hyperion Effect",
    "friendlyName": "Hyperion(" + effect + ")",
    //"displayCategories": ["SCENE_TRIGGER"],
    "displayCategories": ["LIGHT"],
    "cookie": {},
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
        /*        {
                    "type": "AlexaInterface",
                    "interface": "Alexa.SceneController",
                    "version": "3",
                    "supportsDeactivation": false
                }, */
    ],
    "relationships": {
        "isConnectedBy": {
            "endpointId": "a2-light-v3"
        }
    }
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
