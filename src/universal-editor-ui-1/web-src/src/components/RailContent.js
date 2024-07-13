import { attach } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import { Provider, ActionButton, TextField, View, Header, Text, ComboBox, Item, RadioGroup, Radio} from "@adobe/react-spectrum";
import  Add from '@spectrum-icons/workflow/Add';
import  Remove from '@spectrum-icons/workflow/Remove';
import  SaveFloppy from '@spectrum-icons/workflow/SaveFloppy';
import  Refresh from '@spectrum-icons/workflow/Refresh';
import { lightTheme } from "@adobe/react-spectrum";
import {useState, useEffect } from 'react';
import allActions from '../config.json'
import actionWebInvoke from '../utils'

function RailContent () {
    const [loading, setLoading] = useState(true);
    const [toConnect, setToConnect] = useState(false);
    const [rtcdp, setRtcdp] = useState([]);
    const [placementFieldMappings, setPlacementFieldMappings] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [guestConnection, setGuestConnection] = useState();
    const [aepToken, setAEPToken] = useState(null);
    const [formFields, setFormFields] = useState([]);
    const [offerOptionSelected, setOfferOptionSelected] = useState();
    const [offerActivityId, setOfferActivityId] = useState();
    const [offers, setOffers] = useState([]);
    const [offerReqParamName, setOfferReqParamName] = useState();

    const [fields, setFields] = useState([]);

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

    const handleRemoveField = async (index) => {
        console.error("In remove fields before" + fields);
        const newFields = fields.filter((_, i) => i !== index);
        console.error("printing new fields");
        console.error(newFields);
        setFields(newFields);
        console.error("in remove fields after" + fields);
        //saveSegments(newFields);
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

    const handleChange = async (index, side, value) => {
        const newFields = [...fields];
        newFields[index][side] = value;
        setFields(newFields);
        /*if(newFields[index].name && newFields[index].expr) {
            saveSegments(newFields);
        }*/
    };

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

    const handleOfferOptionChange = (value) => {
        setOfferOptionSelected(value);
    };

    const handleOfferChange = (value) => {
        setOfferActivityId(value);
    };

    const handleReqParamChange = (value) => {
        setOfferReqParamName(value);
    };


    const handleSegmentSave = async () => {
        saveSegmentsAndPlacements(fields,rtcdp, placementFieldMappings);
    };

    const handlePlacementSave = async () => {
        saveSegmentsAndPlacements(fields,rtcdp, placementFieldMappings);
    };


    const handleTokenChange = (value) => {
        setAEPToken(value);
    }

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
                "offerOptionSelected": offerOptionSelected
            };

            
            if(offerOptionSelected === "listed") {
                params.offerActivityId = offerActivityId;
            } else if (offerOptionSelected === "reqparam") {
                params.offerReqParamName = offerReqParamName;
            }

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
                    "aepToken": aepToken
                };
        
                console.error(params);
                const actionResponse = await actionWebInvoke(allActions['fetchSegments'], headers, params);
                console.error(actionResponse);
                if(actionResponse.error) {
                    setLoading(true);
                    setToConnect(true);
                } else {
                    setFields(actionResponse.nativeSegments);
                    setRtcdp(actionResponse.rtcdpSegments);
                    setPlacementFieldMappings(actionResponse.placementFieldMappings);
                    setPlacements(actionResponse.placements);
                    setFormFields(actionResponse.formFields);
                    setOffers(actionResponse.decisions);
                    setLoading(false);
                    setToConnect(false);
                    setOfferOptionSelected(actionResponse.offerOptionSelected);
                    setOfferActivityId(actionResponse.offerActivityId);
                    setOfferReqParamName(actionResponse.offerReqParamName);
                }
                
            } finally {
                //setLoading(false);
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
                const actionResponse = await actionWebInvoke(allActions['fetchSegments'], headers, params);
                console.error(actionResponse);
                if(actionResponse.error) {
                    setLoading(false);
                    setToConnect(true);
                }
                setFields(actionResponse.nativeSegments);
                setRtcdp(actionResponse.rtcdpSegments);
                setPlacementFieldMappings(actionResponse.placementFieldMappings);
                setPlacements(actionResponse.placements);
                setFormFields(actionResponse.formFields);
                setOffers(actionResponse.decisions);
                setOfferOptionSelected(actionResponse.offerOptionSelected);
                setOfferActivityId(actionResponse.offerActivityId);
                setOfferReqParamName(actionResponse.offerReqParamName);

                
            } finally {
                setLoading(false);
            }
        };
        if (loading) {
            fetchData().catch((e) => console.log("Extension error:", e));
        }
    } , [guestConnection]);

    if (loading && !toConnect) {
        return (
            <Provider theme={lightTheme} colorScheme="light">
                <View padding="size-250">
                    <Text>Trying to fetch segments using saved token...</Text>
                </View>
            </Provider>
        )
    }

    if (loading && toConnect) {
        return (
            <Provider theme={lightTheme} colorScheme="light">
                <View padding="size-250">
                    <Text>Trying to fetch segments using the token entered...</Text>
                </View>
            </Provider>
        )
    }

    if(toConnect) {
        return (
            <Provider theme={lightTheme} colorScheme="light">
                <View padding="size-250">                 
                    <TextField
                        label={`Token`}
                        onChange={(value) => handleTokenChange(value)}
                    />

                      <View>
                        <ActionButton onPress={handleConnect}>
                            <Refresh/>
                        </ActionButton>
                    </View>          
                </View >  
            </Provider>
        );
    }
    
    return (
        <Provider theme={lightTheme} colorScheme="light">
            <View padding="size-250">
                <Header>Segments</Header>
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
            </View>

            <View padding="size-250">
                <Header>Offers and Placements</Header>
                <View marginTop="size-200">
                    <RadioGroup
                    value={offerOptionSelected}
                    onChange={handleOfferOptionChange}
                    >
                    <Radio value="listed">Choose from offer list</Radio>
                    <Radio value="reqparam">Use Request Parameter</Radio>
                </RadioGroup>
                {offerOptionSelected === 'listed' && (
                    <ComboBox
                        selectedKey={offerActivityId}
                        defaultItems={offers}
                        onSelectionChange={(value) => handleOfferChange(value)}
                        label={`Select offer`}>
                        {(item) => <Item key={item.id}>{item.name}</Item>}
                    </ComboBox>
                )}
                {offerOptionSelected === 'reqparam' && (
                    <TextField
                        value={offerReqParamName}
                        onChange={(value) => handleReqParamChange(value)}
                        label={`Request Parameter Name`}
                    />
                )}
                </View>
                <View marginTop="size-200">
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
                </View>
                <ActionButton onPress={handleAddPlacement}>
                    <Add/>
                </ActionButton>
                <ActionButton onPress={handlePlacementSave}>
                    <SaveFloppy/>
                </ActionButton>
            </View>
        
        </Provider>
    );
    
};

export default RailContent;
