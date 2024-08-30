const fetch = require("node-fetch")
const FormData = require('form-data');
async function main(params) {

  var aepToken;

  var returnSegments = {};

  const aemRequestOptions = {
    method: "GET",
    headers: {"Authorization": params.token}
  };
  const formJsonResponse = await fetch(params.endpoint+ params.formPath +".model.json", aemRequestOptions);
  const formModel = await formJsonResponse.json();
  var segments = [];
  var placementFieldMappings = [];
  returnSegments.offerCharacteristicMapping =[];
  if(formModel.properties) {
    const properties =formModel.properties;
    if(properties.segments) {
      segments = JSON.parse(properties.segments);
    }
    if(properties.placementFieldMappings) {
      placementFieldMappings = JSON.parse(properties.placementFieldMappings);
    }
    if(properties.offerOptionSelected) {
      returnSegments.offerOptionSelected = properties.offerOptionSelected;
    }
    if(properties.offerOptionSelected === "listed" && properties.offerActivityId) {
      returnSegments.offerActivityId = properties.offerActivityId;
    } else if (properties.offerOptionSelected === "reqparam" && properties.offerReqParamName) {
      returnSegments.offerReqParamName = properties.offerReqParamName;
    }

    if(properties.offerCharacteristicMapping) {
      returnSegments.offerCharacteristicMapping = JSON.parse(properties.offerCharacteristicMapping);
    }
  }
  
  returnSegments.nativeSegments = segments;
  returnSegments.placementFieldMappings = placementFieldMappings;

  //fetch AEP Access token
  if(params.aepConfig) {
    var requestOptions1 = {
      method: "POST",
    };
    
      var response1 = await fetch("https://ims-na1.adobelogin.com/ims/token/v3?grant_type=client_credentials&client_id="+params.aepConfig.clientId+"&client_secret="+params.aepConfig.clientSecret+"&scope="+params.aepConfig.scopes, requestOptions1);
      if(response1.status === 200) {
        var result1 = await response1.json();
        aepToken = result1.access_token;
      }
      returnSegments.accessTokenResponse = response1.status;
  }
  const myHeaders = {
    "x-api-key": params.aepConfig.clientId,
    "x-gw-ims-org-id": params.aepConfig.orgId,
    "x-sandbox-name": params.aepConfig.sandboxName,
    "Authorization": "Bearer " + aepToken
    };
  
    const requestOptions = {
    method: "GET",
    headers: myHeaders
    };
  
    //Get segments
    const response = await fetch("https://platform.adobe.io/data/core/ups/audiences?property=evaluationInfo.synchronous.enabled==true", requestOptions);
    if(response.status === 200) {
      const result = await response.json();
      const items = result.children;
      var listItems = items.map(item => (
          {"id": item.id, "name":item.name}
        ));
      returnSegments.rtcdpSegments = listItems;

    //save aep config
    if(params.aepConfig) {
      var tokenFormData = new FormData();
      tokenFormData.append("aepConfig", JSON.stringify(params.aepConfig));
      const aemTokenPostRequestOptions = {
        method: "POST",
        headers: {"Authorization": params.token},
        body: tokenFormData
      };
      const tokenPostResponse = await fetch(params.endpoint+ params.formPath , aemTokenPostRequestOptions);
    }
  }

  returnSegments.formFields = [];

  const getFormFields = (model) => {
      if(model.fieldType === "panel" || model.fieldType === "form") {
        var items = model[":items"];
        items && Object.keys(items).forEach(key=> {
          getFormFields(items[key]);
        });
        return;
      }
    
      if(model.name !== "__audience__") {
        returnSegments.formFields.push({"id":model.id+","+model.name, "name": model.label?(model.label.value || model.name) :model.name});
      }

  }

  //Save enums
  getFormFields(formModel);

  var audience = Object.keys(formModel[":items"]).filter((key) => formModel[":items"][key].name === "__audience__")[0];
  audience = formModel[":items"][audience];
  if(audience !== undefined) {
    const audiencePath = audience.properties['fd:path'];
    var formData = new FormData();
    returnSegments.rtcdpSegments.forEach(element => {
      formData.append("enum", element.id);
      formData.append("enumNames", element.name);
    });

    returnSegments.nativeSegments.forEach(element => {
      formData.append("enum", element.expr);
      formData.append("enumNames", element.name);
    });
    const aemPostRequestOptions = {
      method: "POST",
      headers: {"Authorization": params.token},
      body: formData
    };
    const postResponse = await fetch(params.endpoint+ audiencePath , aemPostRequestOptions);
  }

  //Get placements and decisions
  var placements = [];
  const placementResponse = await fetch("https://platform.adobe.io/data/core/dps/placements", requestOptions);
  if(placementResponse.status === 200) {
    const placementResult = await placementResponse.json();
    const placementsInResponse = placementResult.results;
    placements = placementsInResponse.map(placement => (
      {id: placement.id, name: placement.name}
    ));
  }
  returnSegments.placements = placements;

  var decisions = [];
  var offerCharacteristics = [];
  const decisionResponse = await fetch("https://platform.adobe.io/data/core/dps/offers?offer-type=personalized", requestOptions);
  if(decisionResponse.status === 200) {
    const result = await decisionResponse.json();
    const decisionsInResponse = result.results;
    decisions = decisionsInResponse.map(decision => (
      {id: decision.id, name: decision.name}
      ));
      
    for (var decision in decisionsInResponse) {
      returnSegments.abc = decisionsInResponse[decision];
      if(decisionsInResponse[decision].characteristics !== undefined) {
        offerCharacteristics.push(...Object.keys(decisionsInResponse[decision].characteristics).map((key) => ({id: key, name: key})));
      }
    }
    

  }
    returnSegments.decisions = decisions;
    returnSegments.offerCharacteristics = offerCharacteristics;
      
  
  return {
    status: 200,
    body: JSON.stringify(returnSegments)
  };
}

exports.main = main;
