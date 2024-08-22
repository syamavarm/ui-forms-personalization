/*
 * <license header>
 */

import React, { useEffect } from 'react';
import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";


function ExtensionRegistration() {
    useEffect(() => {
        const init = async () => {
            const registrationConfig = {
                id: extensionId,
                methods: {
                    rightPanel: {
                        addRails() {
                            return [
                                {
                                    id: "forms.datatree.panel",
                                    header: "Data Tree",
                                    url: '/#/rail/1',
                                    icon: 'FileData',
                                },
                                {
                                    id: "forms.personalization.panel",
                                    header: "Personalization",
                                    url: '/#/rail/2',
                                    icon: 'Offer',
                                }
                                
                            ];
                        },
                    },
                },
            };
            const guestConnection = await register(registrationConfig);
        }
        init().catch(console.error)
    }, []);

return <Text>IFrame for integration with Host...</Text>

}

export default ExtensionRegistration;
