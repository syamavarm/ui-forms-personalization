import { attach } from "@adobe/uix-guest";
import { Provider, View, lightTheme, Text, Checkbox} from "@adobe/react-spectrum";
import { extensionId } from "./Constants";
import {useState, useEffect, useRef } from 'react';
import actionWebInvoke from '../utils';
import allActions from '../config.json'

function DataTree () {

    const [loading, setLoading] = useState(true);
    const [guestConnection, setGuestConnection] = useState();
    const [fdmTree, setFDMTree] = useState({})
    
    useEffect(() => {
        (async () => {
            const guestConnection = await attach({ id: extensionId });
            setGuestConnection(guestConnection);
        })();
    }, []);


    const isObject = (val) => typeof val === 'object' && val !== null;

    function getTree(jsonNode, level) {
    
        return Object.keys(jsonNode).map((key) => {
            const value = jsonNode[key];
            
            return (
                key === "title" ? (
                <View marginTop="size-100"
                marginStart={level+10}>
                <Checkbox
                    selectionMode="single"
                    aria-label="Static ListView items example"
                    maxWidth="size-6000"
                    defaultSelected
                >
                    {value}
                </Checkbox> 
                </View>) : <></>
                && 
                isObject(value) ? (
                  getTree(value, level+10)
                ) : (<></>)
                
              
             
            );
          });
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
                    "formPath": form[0].resource.replace("urn:aemconnection:", ""),
                    "x-gw-ims-org-id": guestConnection.sharedContext.get('orgId')
                };
        
                console.error(params);
                const actionResponse = await actionWebInvoke(allActions['fetchFDMTree'], headers, params);
                console.error(actionResponse);
                if(actionResponse.error) {
                    setLoading(false);
                }
                setFDMTree(actionResponse);
                
            } finally {
                setLoading(false);
            }
        };
        if (loading) {
            fetchData().catch((e) => console.log("Extension error:", e));
        }
    } , [guestConnection]);

    if (loading) {
        return (
            <Provider theme={lightTheme} colorScheme="light">
                <View padding="size-250">
                    <Text>Trying to load data tree...</Text>
                </View>
            </Provider>
        )
    }

    return (
        <Provider theme={lightTheme} colorScheme="light">
            <View>
                {getTree(fdmTree, 10)}
            </View>
        </Provider>
    );
};

export default DataTree;
