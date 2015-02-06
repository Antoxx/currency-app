(function () {
    var win = window;
    var $ = win.$;
    
    var propertiesSchema = {
        "type": "array",
        "title": "Rules",
        "format": "tabs",
        "items": {
            "title": "Rule",
            "type": "object",
            "id": "rule",
            "properties": {
                "name": {
                    "title": "Name:",
                    "type": "string",
                    "minLength": 2,
                    "default": "Rule"
                },
                "event": {
                    "title": "Subscribe to event of type:",
                    "type": "string"
                },
                "ruleSettings": {
                    "type": "object",
                    "title": "Settings",
                    "properties": {
                        "setting": {
                            "title": "Environment type:",
                            "type": "string",
                            "enum": [
                                "dev", "prod"
                            ]
                        }
                    }
                },
                "fieldSets": {
                    "type": "array",
                    "format": "table",
                    "title": "Fieldsets",
                    //"uniqueItems": true,
                    "items": {
                        //"title": "Mapping",
                        "type": "object",
                        "properties": {
                            "setName": {
                                "type": "string",
                                "title": "Name",
                                "readOnly": true
                            },
                            "fields": {
                                "type": "array",
                                "format": "table",
                                "title": "Fields",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "fieldName": {
                                            "type": "string"
                                        },
                                        "type": {
                                            "type": "string",
                                            "enum": [
                                                "profileAttribute",
                                                "sessionValue",
                                                "eventValue",
                                                "macro",
                                                "meta",
                                                "static"
                                            ],
                                            "default": "static"
                                        },
                                        "fieldSettings": {
                                            "type": "string",
                                            "default": null,
                                            "options": {
                                                "hidden": true
                                            }
                                        },
                                        "valueRef": {
                                            "type": "string",
                                            "default": null,
                                            "options": {
                                                "hidden": true
                                            }
                                        },
                                        "value": {
                                            "type": "string"
                                        }
                                    },
                                    "required": ["fieldName", "type"]
                                }
                            }
                        }
                    },
                    "options": {
                        "disable_array_add": true,
                        "disable_array_delete": true
                    }
                },
                "disable_array_add": true,
                "disable_array_delete": true                
            },
            "required": ["name", "event"],
            "headerTemplate": "{{i1}}. {{self.name}}"
        }
    };
    
    var ruleDefaultValues = {
        "id":"",
        "ruleSettings": {},
        "fieldSets": [{
            "setName": "mapping",
            "fields": [{
                "fieldSettings": null,
                "valueRef": null,
                "value": null,
                "fieldName": "id"
            }, {
                "fieldSettings": null,
                "valueRef": null,
                "value": null,
                "fieldName": "customer_id"
            }, {
                "fieldSettings": null,
                "valueRef": null,
                "value": null,
                "fieldName": "riid"
            }, {
                "fieldSettings": null,
                "valueRef": null,
                "value": null,
                "fieldName": "email_address"
            }, {
                "fieldSettings": null,
                "valueRef": null,
                "value": null,
                "fieldName": "email_deliverability_status"
            }]
        }], 
        "event":"",
        "name":""
    };
    
    var profileAttributes, sessionDatas, eventDefinitions, rules;

    /**
     * JSON Schema -> HTML Editor
     * https://github.com/jdorn/json-editor/
     */
    var editor = new JSONEditor($('#form-setting')[0], {
        disable_collapse: true,
        disable_edit_json: true,
        disable_properties: true,
        disable_array_reorder: true,
        no_additional_properties: true,
        schema: propertiesSchema,
        startval: ruleDefaultValues,
        required: [],
        required_by_default: true,
        theme: 'bootstrap3'
    });
    editor.watch('change', function () {
        debugger;
    });

    // Init loader
    var loader = new Loader();
    loader.show();

    // Init IframeHelper
    var inno = new IframeHelper();
    inno.onReady(function () {
        inno.getRules(function (status, els) {
            rules = els;
            
            inno.getProfileSchemaAttributes(function (els) {
                profileAttributes = els;

                inno.getProfileSchemaSessionDatas(function (els) {
                    sessionDatas = els;

                    inno.getProfileSchemaEventDefinitions(function (els) {
                        eventDefinitions = els;

                        setInterval(function () {
                            var list = ['1', '2', '3'];
                            console.log(profileAttributes, rules, editor);
                            debugger;
                        }, 4000);
                        
                        //editor.setValue({});
                        loader.hide();
                    });
                });
            });
        });
    });

    // Listen submit button click event
    $('#submit-setting').on('click', function () {
        var errors = editor.validate();
        if (errors.length) {
            errors = errors.map(function (error) {
                var field = editor.getEditor(error.path),
                    title = field.schema.title;
                return title + ': ' + error.message;
            });
            alert(errors.join('\n'));
        } else {
            loader.show();
            inno.setProperties(editor.getValue(), function (status) {
                loader.hide();
                if (status) {
                    alert('Settings were saved.');
                }
            });
        }
    });

})();