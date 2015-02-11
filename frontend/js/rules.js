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
                "id": {
                    "type": "string",
                    "default": null,
                    "options": {
                        "hidden": true
                    }  
                },                
                "name": {
                    "title": "Name",
                    "type": "string",
                    "minLength": 2,
                    "default": "Rule",
                    "propertyOrder": 1
                },
                "event": {
                    "title": "Subscribe to event of type",
                    "type": "string",
                    "propertyOrder": 2
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
                    },
                    "propertyOrder": 3
                },
                "fieldSets": {
                    "type": "array",
                    //"format": "table",
                    "title": "Fieldsets",
                    //"headerTemplate": " ",
                    //"uniqueItems": true,
                    "items": {
                        "headerTemplate": "{{self.setName}}",
                        "type": "object",
                        "properties": {
                            "setName": {
                                "type": "string",
                                "title": "Name",
                                "readOnly": true,
                                "options": {
                                    "hidden": true
                                }                                
                            },
                            "fields": {
                                "type": "array",
                                //"format": "table", // bug: new property will be added after buttons <td>
                                "title": "Fields",
                                "items": {
                                    "type": "object",
                                    //"headerTemplate": "{{self.fieldName}}",
                                    "title": "Field" ,
                                    "properties": {
                                        "fieldName": {
                                            "type": "string",
                                            "title": "Name",
                                            "propertyOrder": 1
                                        },
                                        "type": {
                                            "type": "string",
                                            "title": "Type",
                                            "enum": [
                                                "profileAttribute",
                                                "sessionValue",
                                                "eventValue",
                                                "macro",
                                                "meta",
                                                "static"
                                            ],
                                            "default": "static",
                                            "options": {
                                                "enum_titles": [
                                                    "Profile Attribute",
                                                    "Session Data",
                                                    "Event Data",
                                                    "Macro",
                                                    "Meta",
                                                    "Static"
                                                ]
                                            },
                                            "propertyOrder": 2
                                        },
                                        "fieldSettings": {
                                            "type": "string",
                                            "default": null,
                                            "options": {
                                                "hidden": true
                                            },
                                            "propertyOrder": 3
                                        },
                                        "valueRef": {
                                            "type": "string",
                                            "default": null,
                                            "options": {
                                                "hidden": true
                                            },
                                            "propertyOrder": 4
                                        },
                                        "value": {
                                            "type": "string",
                                            "title": "Value",
                                            "propertyOrder": 5
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
                    },
                    "propertyOrder": 4
                }
            },
            "options": {
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
    
    var mappingTypeValues = {
        profileAttribute: [],
        sessionValue: [],
        eventValue: [],
        macro: [
            ['timestamp_now','request_ip','user_agent','profileId'],
            ['Timestamp','Request IP','User-agent','Profile ID']
        ],
        meta: [
            ['company_id','bucket_id','event_def_id','app_section_event','collect_app','section'],
            ['Company ID','Bucket ID','Event definition ID','Event with scope','Collect app','Section']
        ],
        event: []
    };
    
    var changeEvent = function (path) {
        var eventField = editor.getEditor(path);
        if (!eventField) {
            return;
        }
        
        var newValue = eventField.getValue();
        var parts, appId, sectionId, eventId;
        
        if (!eventField.oldValue || !newValue) {
            return;
        }
        
        parts = newValue.split('/');
        appId = parts[0];
        sectionId = parts[1];
        eventId = parts[2];

        inno.getProfileSchemaSessionDatas(appId, sectionId, function (els) {
            mappingTypeValues.sessionValue = prepareEls(els);
        });        

        inno.getProfileSchemaEventDefinitionDatas(appId, sectionId, eventId, function (els) {
            mappingTypeValues.eventValue = prepareEls(els);
        });
        
        eventField.oldValue = newValue;
    };
    var changeMappingTypeAndValue = function (path) {
        var typeField, newValue, enumValues;
        typeField = editor.getEditor(path);
        if (!typeField) {
            return;
        }
        
        newValue = typeField.getValue();
        if (!typeField.oldValue) {
            typeField.oldValue = newValue;
        }
        
        var valuePath = typeField.parent.path + '.value';
        var valueField = editor.getEditor(valuePath);
        var oldEnumValues = '' + valueField.schema.enum;
        var newEnumValues = mappingTypeValues[newValue];
        
        // if type was not changed and select options are the same GO OUT
        if (typeField.oldValue === newValue && (oldEnumValues === '' + newEnumValues || oldEnumValues === '' + newEnumValues[0])) {
            return;
        }

        changeEnumValues(valuePath, newEnumValues);
        typeField.oldValue = newValue;
    };
    var changeEnumValues = function (path, enumValues) {
        var oldField = editor.getEditor(path);
        var oldValue = oldField.getValue();
        var fieldName = oldField.key;
        var parent = oldField.parent;
        
        oldField.destroy();

        delete parent.editors[fieldName];
        delete parent.cached_editors[fieldName];
        
        var fieldSchema = parent.schema.properties[fieldName];
        if (enumValues) {
            fieldSchema.enum = enumValues[0] || enumValues;
            if (!fieldSchema.options) {
                fieldSchema.options = {};
            }
            
            fieldSchema.options.enum_titles = enumValues[1];
        } else {
            delete fieldSchema.enum;
        }

        parent.addObjectProperty(fieldName);
        
        var newField = editor.getEditor(path);
        var newValue = enumValues && enumValues.indexOf(oldValue) === -1 ? '' : oldValue;
        newField.setValue(newValue);
    };
    var prepareEls = function (els) {
        var newEls = [[], []];
        els.forEach(function (el) {
            newEls[0].push(el);
            newEls[1].push(el.split('/').join(' / '));
        });
        return newEls;
    };
    
    /**
     * Complete new rule with default values
     */
    var completeRule = function (rules) {
        rules = rules || editor.getValue();
        var newRules = [];
        if (!editor.savedValue || editor.savedValue.length < rules.length) {
            rules.forEach(function (rule) {
                newRules.push(
                    $.extend(true, {}, ruleDefaultValues, rule)
                );
            });

            editor.setValue(newRules);
        }
        
        editor.savedValue = newRules.length ? newRules : rules;
        
        // empty row cache
        if (!rules.length) {
            editor.getEditor('root').empty(true);
        }
    };
    /**
     * Fix predefined fields
     */
    var fixPredefinedFields = function () {
        var rules = editor.getValue();
        
        // remove controls from predefined fields
        rules.forEach(function (rule, ruleIdx) {
            ruleDefaultValues.fieldSets.forEach(function (fs, fsIdx) {
                var fieldPath = ['root', ruleIdx, 'fieldSets', fsIdx, 'fields'].join('.');
                var field = editor.getEditor(fieldPath);
                if (field) {
                    field.delete_last_row_button.style.display = 'none';
                    field.remove_all_rows_button.style.display = 'none';
                }

                fs.fields.forEach(function (f, fIdx) {
                    var fieldPath = ['root', ruleIdx, 'fieldSets', fsIdx, 'fields', fIdx].join('.');
                    var field = editor.getEditor(fieldPath);
                    if (field) {
                        field.delete_button.style.display = 'none';
                    }
                    
                    // readonly for predefined fields names
                    field.editors.fieldName.input.readOnly = true;
                });
            });
        });
    };

    /**
     * JSON Schema -> HTML Editor
     * https://github.com/jdorn/json-editor/
     */
    var editor;

    // Init loader
    var loader = new Loader();
    loader.show();

    // Init IframeHelper
    var inno = new IframeHelper();
    inno.onReady(function () {
        inno.getRules(function (success, rules) {
            if (!success) {
                alert('Rules were not loaded due to error. Please reload screen.');
                return;
            }
            
            inno.getProfileSchemaAttributes(function (els) {
                mappingTypeValues.profileAttribute = prepareEls(els);

                inno.getProfileSchemaEventDefinitions(function (els) {
                    var newEls = prepareEls(els);
                    var eventSchema = propertiesSchema.items.properties.event;
                    
                    mappingTypeValues.event = newEls;
                    
                    eventSchema.enum = newEls[0];
                    if (!eventSchema.options) {
                        eventSchema.options = {};
                    }
                    eventSchema.options.enum_titles = newEls[1];
                    
                    editor = new JSONEditor($('#form-setting')[0], {
                        disable_collapse: true,
                        disable_edit_json: true,
                        disable_properties: true,
                        disable_array_reorder: true,
                        no_additional_properties: true,
                        schema: propertiesSchema,
                        //startval: ruleDefaultValues,
                        required: [],
                        required_by_default: true,
                        theme: 'bootstrap3'
                    });
                    editor.on('change', function () {
                        var eventRegexp = /^root\.\d+\.event$/;
                        var mappingTypeRegexp = /^root\.\d+\.fieldSets\.\d+\.fields\.\d+\.type$/;
                        var editors = editor.editors;
                        var path;
                        for (path in editors) {
                            if (eventRegexp.test(path)) {
                                changeEvent(path);
                            }

                            if (mappingTypeRegexp.test(path)) {
                                changeMappingTypeAndValue(path);
                            }
                        }
                        
                        completeRule();
                        fixPredefinedFields();
                    });
                    
                    completeRule(rules);
                    fixPredefinedFields();
                    
                    loader.hide();
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
            inno.setRules(editor.getValue(), function (success) {
                loader.hide();
                if (success) {
                    alert('Rules were successfully saved.');
                }
            });
        }
    });

})();