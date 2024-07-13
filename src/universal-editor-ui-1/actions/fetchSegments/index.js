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
  if(formModel.properties) {
    const properties =formModel.properties;
    if(properties.segments) {
      segments = JSON.parse(properties.segments);
    }
    if(properties.placementFieldMappings) {
      placementFieldMappings = JSON.parse(properties.placementFieldMappings);
    }
    if(properties.aepToken) {
      aepToken = properties.aepToken;
    }
    if(properties.offerOptionSelected) {
      returnSegments.offerOptionSelected = properties.offerOptionSelected;
    }
    if(properties.offerOptionSelected === "listed") {
      returnSegments.offerActivityId = properties.offerActivityId;
    } else if (properties.offerOptionSelected === "reqparam") {
      returnSegments.offerReqParamName = properties.offerReqParamName;
    }
  }
  
  returnSegments.nativeSegments = segments;
  returnSegments.placementFieldMappings = placementFieldMappings;

  //fetch RTCDP segments and AJO decisions/placements
  if(params.aepToken) {
    aepToken = params.aepToken;
  }
  const myHeaders = {
    "x-api-key": "acp_ui_platform",
    "x-gw-ims-org-id": "908936ED5D35CC220A495CD4@AdobeOrg",
    "x-sandbox-name": "aem-forms-experimentation",
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

    //save aep token after fetch
    if(params.aepToken) {
      var tokenFormData = new FormData();
      tokenFormData.append("aepToken", aepToken);
      const aemTokenPostRequestOptions = {
        method: "POST",
        headers: {"Authorization": params.token},
        body: tokenFormData
      };
      const tokenPostResponse = await fetch(params.endpoint+ params.formPath , aemTokenPostRequestOptions);
    }
  }

  //Save enums
  returnSegments.formFields = Object.keys(formModel[":items"]).filter((key) => formModel[":items"][key].fieldType !== "panel" &&  formModel[":items"][key].name !== "__audience__").map((item) =>({"id":formModel[":items"][item].id+","+formModel[":items"][item].name, "name": formModel[":items"][item].label?(formModel[":items"][item].label.value || formModel[":items"][item].name) :formModel[":items"][item].name}));

  var audience = Object.keys(formModel[":items"]).filter((key) => formModel[":items"][key].name === "__audience__")[0];
  audience = formModel[":items"][audience];
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
  const decisionResponse = await fetch("https://platform.adobe.io/data/core/dps/offer-decisions", requestOptions);
  if(decisionResponse.status === 200) {
    const result = await decisionResponse.json();
    const decisionsInResponse = result.results;
    decisions = decisionsInResponse.map(decision => (
      {id: decision.id, name: decision.name}
      ));
  }
    returnSegments.decisions = decisions;
  
  return {
    status: 200,
    body: JSON.stringify(returnSegments)
  };
}

exports.main = main;
