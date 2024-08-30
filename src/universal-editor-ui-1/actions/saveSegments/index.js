const fetch = require("node-fetch")
const FormData = require('form-data');
async function main(params) {

  var formData = new FormData();
  formData.append("segments", JSON.stringify(params.nativeSegments));
  formData.append("placementFieldMappings", JSON.stringify(params.placementFieldMappings));
  formData.append("offerCharacteristicMapping", JSON.stringify(params.offerCharacteristicMapping));
  formData.append("offerOptionSelected", JSON.stringify(params.offerOptionSelected));

  const aemRequestOptions = {
    method: "POST",
    headers: {"Authorization": params.token},
    body: formData
    };
  const formJsonResponse = await fetch(params.endpoint+ params.formPath, aemRequestOptions);
  if(formJsonResponse.status === 200) {
    const aemFormModelRequestOptions = {
      method: "GET",
      headers: {"Authorization": params.token}};
    const formModelResponse = await fetch(params.endpoint+ params.formPath +".model.json", aemFormModelRequestOptions);
    const formModel = await formModelResponse.json();

    var audience = Object.keys(formModel[":items"]).filter((key) => formModel[":items"][key].name === "__audience__")[0];
    audience = formModel[":items"][audience];
    if(audience !== undefined) {
      const audiencePath = audience.properties['fd:path'];
      var formData = new FormData();
      params.nativeSegments.forEach(element => {
        formData.append("enum", element.name);
        formData.append("enumNames", element.name);
      });
      params.rtcdpSegments.forEach(element => {
        formData.append("enum", element.id);
        formData.append("enumNames", element.name);
      });
      const aemPostRequestOptions = {
        method: "POST",
        headers: {"Authorization": params.token},
        body: formData
      };
      const postResponse = await fetch(params.endpoint+ audiencePath , aemPostRequestOptions);
      if(postResponse.status === 200) {
        return {
          status: 200,
          body: `OK`
        };
      } else {
        return {
          status: 500,
          body: `NOT OK`
        };
      }
    } else {
      return {
        status: 200,
        body: `OK`
      };
    }
  } else {
    return {
      status: 500,
      body: `NOT OK`
    };
  }
}

exports.main = main;
