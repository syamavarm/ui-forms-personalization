import { attach } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import { Provider, ActionButton, TextField, View, ProgressCircle, Text, ComboBox, Item, RadioGroup, Radio, CheckboxGroup, Checkbox} from "@adobe/react-spectrum";
import  Add from '@spectrum-icons/workflow/Add';
import  Remove from '@spectrum-icons/workflow/Remove';
import  SaveFloppy from '@spectrum-icons/workflow/SaveFloppy';
import  Refresh from '@spectrum-icons/workflow/Refresh';
import { lightTheme } from "@adobe/react-spectrum";
import {useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import DataTree from "./DataTree";

import allActions from '../config.json'
import actionWebInvoke from '../utils'

function RailContent () {
    const { railId } = useParams();
    if (!railId) {
        console.error('Rail id parameter is missed');
        return;
    }
    console.error(railId);
    if(railId == 1) {
        return (
            <DataTree/>
        );
    } else {

    const [loading, setLoading] = useState(true);
    const [waiting, setWaiting] = useState(false);
    const [toConnect, setToConnect] = useState(true);
    const [rtcdp, setRtcdp] = useState([]);
    const [placementFieldMappings, setPlacementFieldMappings] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [guestConnection, setGuestConnection] = useState();
    const [formFields, setFormFields] = useState([]);
    const [offerOptionSelected, setOfferOptionSelected] = useState([]);
    const [offerActivityId, setOfferActivityId] = useState(new Set([2]));
    const [offers, setOffers] = useState([]);
    const [offerReqParamName, setOfferReqParamName] = useState();
    const [offerCharacteristics, setOfferCharacteristics] = useState([]);
    const [offerCharacteristicMapping, setOfferCharacteristicMapping] = useState([]);
    const detailsRef = useRef(null);
    const [selected, setSelected] = React.useState([]);
    const [fields, setFields] = useState([]);
    const [aepConfig, setAEPConfig] = useState({});

    useEffect(() => {
        (async () => {
            const guestConnection = await attach({ id: extensionId });
            setGuestConnection(guestConnection);
        })();
    }, []);

    const handleAddField = () => {
        console.error("In add fields" + fields);
        setFields([...fields, { name: '', expr: '' }]);
        console.error("In add fields after" + fields);
    };

    const handleAddPlacement = () => {
        console.error("In add placements" + placementFieldMappings);
        setPlacementFieldMappings([...placementFieldMappings, { placementId: '', fieldId: '' , fieldName:''}]);
        console.error("In add placements after" + placementFieldMappings);
    };

    const handleAddOfferCharacteristic = () => {
        console.error("In add offer characteristics" + offerCharacteristicMapping);
        setOfferCharacteristicMapping([...offerCharacteristicMapping, { placementId: '', fieldId: '' , fieldName:''}]);
        console.error("In add offer characteristics after" + offerCharacteristicMapping);
    };

    const handleRemoveField = async (index) => {
        console.error("In remove fields before" + fields);
        const newFields = fields.filter((_, i) => i !== index);
        console.error("printing new fields");
        console.error(newFields);
        setFields(newFields);
        console.error("in remove fields after" + fields);
    };

    const handleRemovePlacement = async (index) => {
        console.error("In remove placements before" + placementFieldMappings);
        const newPlacementFieldMappings = placementFieldMappings.filter((_, i) => i !== index);
        console.error("printing new placements");
        console.error(newPlacementFieldMappings);
        setPlacementFieldMappings(newPlacementFieldMappings);
        console.error("in remove placements after" + placementFieldMappings);
        //saveSegments(newFields);
    };

    const handleRemoveOfferCharacteristic = async (index) => {
        console.error("In remove offer characteristic mapping before" + offerCharacteristicMapping);
        const newOfferCharacteristicMapping = offerCharacteristicMapping.filter((_, i) => i !== index);
        console.error("printing new offer characteristic mapping");
        console.error(newOfferCharacteristicMapping);
        setOfferCharacteristicMapping(newOfferCharacteristicMapping);
        console.error("in remove offer characteristic mapping after" + offerCharacteristicMapping);
        //saveSegments(newFields);
    };

    const handleChange = async (index, side, value) => {
        const newFields = [...fields];
        newFields[index][side] = value;
        setFields(newFields);
        /*if(newFields[index].name && newFields[index].expr) {
            saveSegments(newFields);
        }*/
    };

    const handleAEPConfig = (key, value) => {
        var newAEPConfig = {...aepConfig};
        newAEPConfig[key] = value;
        setAEPConfig(newAEPConfig);
    }

    const handlePlacementChange = async (index, side, value) => {
        const newPlacementFieldMappings = [...placementFieldMappings];
        console.error("printing new placement field mappings");
        console.error(newPlacementFieldMappings);
        if(side === 'field') {
            var fieldMapping = newPlacementFieldMappings[index];
            console.error(fieldMapping);
            fieldMapping.fieldId = value.split(",")[0];
            fieldMapping.fieldName = value.split(",")[1];
            console.error(fieldMapping);
            newPlacementFieldMappings[index] = fieldMapping;
            console.error("printing new placement field mappings once more");
            console.error(newPlacementFieldMappings);
            //newPlacementFieldMappings[index][fieldName] = value;
        }
        if(side === 'id') {
            var fieldMapping = newPlacementFieldMappings[index];
            console.error(fieldMapping);
            fieldMapping.placementId = value;
            console.error(fieldMapping);
            newPlacementFieldMappings[index] = fieldMapping;
            console.error("printing new placement field mappings once more");
            console.error(newPlacementFieldMappings);
            //newPlacementFieldMappings[index][fieldName] = value;
        }
        setPlacementFieldMappings(newPlacementFieldMappings);
        /*if(newFields[index].name && newFields[index].expr) {
            saveSegments(newFields);
        }*/
    };

    const handleOfferCharacteristicChange = async (index, side, value) => {
        const newOfferCharacteristicMapping = [...offerCharacteristicMapping];
        console.error("printing new placement field mappings");
        console.error(newOfferCharacteristicMapping);
        if(side === 'field') {
            var fieldMapping = newOfferCharacteristicMapping[index];
            console.error(fieldMapping);
            fieldMapping.fieldId = value.split(",")[0];
            fieldMapping.fieldName = value.split(",")[1];
            console.error(fieldMapping);
            newOfferCharacteristicMapping[index] = fieldMapping;
        }
        if(side === 'id') {
            var fieldMapping = newOfferCharacteristicMapping[index];
            console.error(fieldMapping);
            fieldMapping.offerAttributeId = value;
            console.error(fieldMapping);
            newOfferCharacteristicMapping[index] = fieldMapping;
        }
        setOfferCharacteristicMapping(newOfferCharacteristicMapping);
    };

    const handleOfferChange = (value) => {
        setOfferOptionSelected(value);
    };


    const handleSegmentSave = async () => {
        saveSegmentsAndPlacements(fields,rtcdp, placementFieldMappings);
    };

    const handlePlacementSave = async () => {
        saveSegmentsAndPlacements(fields,rtcdp, placementFieldMappings);
    };

    const saveSegmentsAndPlacements = async (newFields, rtcdp, placementFieldMappings) => {
        
        try {
            // Set the HTTP headers to access the Adobe I/O runtime action
            const editorState = await guestConnection.host.editorState.get();
            const { connections, selected, editables, location, customTokens } = editorState;
            
            const headers = {
                'Authorization': 'Bearer ' + guestConnection.sharedContext.get('token'),
                'x-gw-ims-org-id': guestConnection.sharedContext.get('orgId'),
                'Access-Control-Allow-Origin': 'http://localhost:9080'
            };

            const form = editables.filter(item => item.model === "form");

            const tempEndpointName = Object.keys(connections).filter((key) => 
                connections[key].startsWith("xwalk:")
            )[0];


            if (customTokens && customTokens[tempEndpointName]) {
                token = customTokens[tempEndpointName];
            } else {
                token = "Bearer " + guestConnection.sharedContext.get('token');
            }

            const params = {
                "endpoint": connections[tempEndpointName].replace("xwalk:", ""),
                "token": token,
                "formPath": form[0].resource.replace("urn:aemconnection:", ""),
                "nativeSegments": newFields,
                "rtcdpSegments": rtcdp,
                "placementFieldMappings": placementFieldMappings,
                "offerOptionSelected": offerOptionSelected,
                "offerCharacteristicMapping": offerCharacteristicMapping
            };

        
            console.error(params);
            const actionResponse = await actionWebInvoke(allActions['saveSegments'], headers, params);
            if(actionResponse === 'OK') {
                console.error('Save successful:', actionResponse);
            }
        } catch (error) {
        console.error('Save failed:', error);
        }
        
    }

    const handleConnect = async () => {
        if(aepConfig.clientId && aepConfig.clientSecret && aepConfig.scopes) {
            setWaiting(true);
            setLoading(true);
            const editorState = await guestConnection.host.editorState.get();
            const { connections, selected, editables, location, customTokens } = editorState;
            try {

                // Set the HTTP headers to access the Adobe I/O runtime action
                const headers = {
                    'Authorization': 'Bearer ' + guestConnection.sharedContext.get('token'),
                    'x-gw-ims-org-id': guestConnection.sharedContext.get('orgId'),
                    'Access-Control-Allow-Origin': 'http://localhost:9080'
                };

                console.error(editables);
                const form = editables.filter(item => item.model === "form");
                console.error(form);

                const tempEndpointName = Object.keys(connections).filter((key) => 
                    connections[key].startsWith("xwalk:")
                )[0];

    
                if (customTokens && customTokens[tempEndpointName]) {
                    token = customTokens[tempEndpointName];
                } else {
                    token = "Bearer " + guestConnection.sharedContext.get('token');
                }

                const params = {
                    "endpoint": connections[tempEndpointName].replace("xwalk:", ""),
                    "token": token,
                    "formPath": form[0].resource.replace("urn:aemconnection:", ""),
                    "aepConfig": aepConfig
                };
        
                console.error(params);
                const actionResponse = await actionWebInvoke(allActions['fetchSegments'], headers, params);
                console.error(actionResponse);
                if(actionResponse.error) {
                    setLoading(true);
                    setToConnect(true);
                    setWaiting(false);
                } else {
                    setFields(actionResponse.nativeSegments);
                    setRtcdp(actionResponse.rtcdpSegments);
                    setPlacementFieldMappings(actionResponse.placementFieldMappings);
                    setPlacements(actionResponse.placements);
                    setFormFields(actionResponse.formFields);
                    setOffers(actionResponse.decisions);
                    setLoading(false);
                    setToConnect(false);
                    setWaiting(false);
                    detailsRef.current.removeAttribute('open');
                    setOfferOptionSelected(JSON.parse(actionResponse.offerOptionSelected));
                    setOfferActivityId(actionResponse.offerActivityId);
                    setOfferReqParamName(actionResponse.offerReqParamName);
                    setOfferCharacteristics(actionResponse.offerCharacteristics);
                    setOfferCharacteristicMapping(actionResponse.offerCharacteristicMapping);
                    
                }
            
                
            } finally {
                //setLoading(false);
            }
        }
    }


    useEffect(() => {
        if(!guestConnection) {
            return;
        }
        const fetchData = async () => {
            const editorState = await guestConnection.host.editorState.get();
            var { connections, selected, editables, location, customTokens } = editorState;
            try {

                // Set the HTTP headers to access the Adobe I/O runtime action
                const headers = {
                    'Authorization': 'Bearer ' + guestConnection.sharedContext.get('token'),
                    'x-gw-ims-org-id': guestConnection.sharedContext.get('orgId'),
                    'Access-Control-Allow-Origin': 'http://localhost:9080'
                };

                console.error(editables);
                const form = editables.filter(item => item.model === "form");
                console.error(form);

                const tempEndpointName = Object.keys(connections).filter((key) => 
                    connections[key].startsWith("xwalk:")
                )[0];

    
                if (customTokens && customTokens[tempEndpointName]) {
                    token = customTokens[tempEndpointName];
                } else {
                    token = "Bearer " + guestConnection.sharedContext.get('token');
                }

                const params = {
                    "endpoint": connections[tempEndpointName].replace("xwalk:", ""),
                    "token": token,
                    "formPath": form[0].resource.replace("urn:aemconnection:", "")
                };
        
                console.error(params);
                const actionResponse = await actionWebInvoke(allActions['fetchAEPConfig'], headers, params);
                console.error(actionResponse);
                if(actionResponse.error) {
                    setToConnect(true);
                }
                setAEPConfig(actionResponse);
                setToConnect(false);

                
            } finally {
            
            }
        };
        if (loading) {
            fetchData().catch((e) => console.log("Extension error:", e));
        }
    } , [guestConnection]);

    /*if (loading && !toConnect) {
        return (
            <Provider theme={lightTheme} colorScheme="light">
                <View padding="size-250">
                    <Text>Trying to fetch RT-CDP audiences using saved token...</Text>
                </View>
            </Provider>
        )
    }

    if (loading && toConnect) {
        return (
            <Provider theme={lightTheme} colorScheme="light">
                <View padding="size-250">
                    <Text>Trying to fetch RT-CDP audiences using the token entered...</Text>
                </View>
            </Provider>
        )
    }*/

    if(toConnect) {
        return (
            <Provider theme={lightTheme} colorScheme="light">
                <View padding="size-250">
                    <Text>Fetching AEP Config...</Text>
                </View>
            </Provider>
        )
    }
    
    return (
        <Provider theme={lightTheme} colorScheme="light">

            <View padding="size-250">
                <details ref={detailsRef} open>
                    <summary>AEP Connection Details</summary>
                    <View marginTop="size-200">
                        <View
                            padding="size-200"
                            backgroundColor="gray-100"
                            borderRadius="medium"
                            marginBottom="size-200"
                            UNSAFE_style={{ border: '1px solid lightgray' }}
                        >      

                        <View>
                            <TextField
                                required
                                defaultValue={aepConfig.clientId?aepConfig.clientId:""}
                                onChange={(value) => handleAEPConfig("clientId", value)}
                                label={`Client ID`}
                            />
                            <TextField
                                required
                                defaultValue={aepConfig.clientSecret?aepConfig.clientSecret:""}
                                onChange={(value) => handleAEPConfig("clientSecret", value)}
                                label={`Client Secret`}
                            />
                            <TextField
                                required
                                defaultValue={aepConfig.scopes?aepConfig.scopes:""}
                                onChange={(value) => handleAEPConfig("scopes", value)}
                                label={`Scopes`}
                            />
                            <TextField
                                required
                                defaultValue={aepConfig.orgId?aepConfig.orgId:""}
                                onChange={(value) => handleAEPConfig("orgId", value)}
                                label={`Org ID`}
                            />
                            <TextField
                                required
                                defaultValue={aepConfig.sandboxName?aepConfig.sandboxName:""}
                                onChange={(value) => handleAEPConfig("sandboxName", value)}
                                label={`Sandbox Name`}
                            />
                            <TextField
                                required
                                defaultValue={aepConfig.dataStreamId?aepConfig.dataStreamId:""}
                                onChange={(value) => handleAEPConfig("dataStreamId", value)}
                                label={`Datastream ID`}
                            />
                            </View>
                            <View marginTop="size-200">
                            <ActionButton
                                onPress={() => handleConnect()}
                            >
                                Connect
                            </ActionButton>     
                            </View>
                        </View >                
                    </View>
                </details>
            </View>

            {waiting &&
            <View padding="size-250">
                <Text>Fetching audiences & offers..</Text>
                <View>
                <ProgressCircle
                    aria-label="Loading"
                    isIndeterminate
                    size="M"
                />
                </View>
            </View>
            }

            {!loading &&
            <View padding="size-250">
                <details>
                    <summary>Native Audiences</summary>
                    <View marginTop="size-200">
                        {fields.map((field, index) => (
                            <View
                            key={index}
                            padding="size-200"
                            backgroundColor="gray-100"
                            borderRadius="medium"
                            marginBottom="size-200"
                            UNSAFE_style={{ border: '1px solid lightgray' }}
                        >      
                        <View>                  
                                <TextField
                                    value={field.name}
                                    onChange={(value) => handleChange(index, 'name', value)}
                                    label={`Name`}
                                />
                                </View>
                                <View>
                                <TextField
                                    value={field.expr}
                                    onChange={(value) => handleChange(index, 'expr', value)}
                                    label={`Expression`}
                                />
                                </View>
                                <View marginTop="size-200">
                                <ActionButton
                                    onPress={() => handleRemoveField(index)}
                                    aria-label={`Remove Text Fields ${index + 1}`}
                                >
                                    <Remove />
                                </ActionButton>     
                                </View>
                            </View >                
                        ))}
                    </View>
                    <ActionButton onPress={handleAddField}>
                        <Add/>
                    </ActionButton>
                    <ActionButton onPress={handleSegmentSave}>
                        <SaveFloppy/>
                    </ActionButton>
                </details>
            </View>
            }
            
            { !loading &&
            <View padding="size-250">
                <details open>
                    <summary>Offers and Placements</summary>
                    <View marginTop="size-200" paddingStart="size-200">
                    <View marginTop="size-200">
                        <details>
                            <summary>Select Offers</summary>
                        
                            <View marginTop="size-200" paddingStart="size-200">
                                <CheckboxGroup
                                    value={offerOptionSelected}
                                    onChange={handleOfferChange}
                                >
                                {offers.map(item => (
                                    <Checkbox key={item.id} value={item.id}>
                                        {item.name}
                                    </Checkbox>
                                ))}
                            </CheckboxGroup>
                          </View>
                        
                        
                        </details>
                    </View>
                    
                    <View marginTop="size-200">
                        <details>
                            <summary>Map Offer Attributes</summary>
                        {offerCharacteristicMapping.map((offerCharacteristic, index) => (
                            <View
                            key={index}
                            padding="size-200"
                            backgroundColor="gray-100"
                            borderRadius="medium"
                            marginBottom="size-200"
                            UNSAFE_style={{ border: '1px solid lightgray' }}
                        >      
                        <View>                 
                                <ComboBox
                                    selectedKey={offerCharacteristic.offerAttributeId}
                                    defaultItems={offerCharacteristics}
                                    onSelectionChange={(value) => handleOfferCharacteristicChange(index, 'id', value)}
                                    label={`Offer Attribute`}>
                                    {(item) => <Item key={item.id}>{item.name}</Item>}
                                </ComboBox>
                                
                                </View>
                                <View>
                                <ComboBox
                                    selectedKey={offerCharacteristic.fieldId+","+offerCharacteristic.fieldName}
                                    defaultItems={formFields}
                                    onSelectionChange={(value) => handleOfferCharacteristicChange(index, 'field', value)}
                                    label={`Field`}>
                                    {(item) => <Item key={item.id}>{item.name}</Item>}
                                </ComboBox>
                                </View>
                                <View marginTop="size-200">
                                <ActionButton
                                    onPress={() => handleRemoveOfferCharacteristic(index)}
                                    aria-label={`Remove Text Fields ${index + 1}`}
                                >
                                    <Remove />
                                </ActionButton>     
                                </View>
                            </View >                
                        ))}
                        <ActionButton onPress={handleAddOfferCharacteristic}>
                            <Add/>
                        </ActionButton>
                        </details>
                    </View>
                    <View marginTop="size-200">
                        <details>
                            <summary>Map Placements</summary>
                        {placementFieldMappings.map((placementFieldMapping, index) => (
                            <View
                            key={index}
                            padding="size-200"
                            backgroundColor="gray-100"
                            borderRadius="medium"
                            marginBottom="size-200"
                            UNSAFE_style={{ border: '1px solid lightgray' }}
                        >      
                        <View>                 
                                <ComboBox
                                    selectedKey={placementFieldMapping.placementId}
                                    defaultItems={placements}
                                    onSelectionChange={(value) => handlePlacementChange(index, 'id', value)}
                                    label={`Placement`}>
                                    {(item) => <Item key={item.id}>{item.name}</Item>}
                                </ComboBox>
                                
                                </View>
                                <View>
                                <ComboBox
                                    selectedKey={placementFieldMapping.fieldId+","+placementFieldMapping.fieldName}
                                    defaultItems={formFields}
                                    onSelectionChange={(value) => handlePlacementChange(index, 'field', value)}
                                    label={`Field`}>
                                    {(item) => <Item key={item.id}>{item.name}</Item>}
                                </ComboBox>
                                </View>
                                <View marginTop="size-200">
                                <ActionButton
                                    onPress={() => handleRemovePlacement(index)}
                                    aria-label={`Remove Text Fields ${index + 1}`}
                                >
                                    <Remove />
                                </ActionButton>     
                                </View>
                            </View >                
                        ))}
                        <ActionButton onPress={handleAddPlacement}>
                            <Add/>
                        </ActionButton>
                        </details>
                    </View>
                    <View marginTop="size-200" marginBottom="size-200">
                        <ActionButton onPress={handlePlacementSave}>
                            <SaveFloppy/>
                        </ActionButton>
                    </View>
                    </View>
                </details>
            </View>
            }
            
        
        </Provider>
    );
        }
};

export default RailContent;
