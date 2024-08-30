const fetch = require("node-fetch")
const FormData = require('form-data');
async function main(params) {


  var aepConfig = {};

  const aemRequestOptions = {
    method: "GET",
    headers: {"Authorization": params.token}
  };
  const formJsonResponse = await fetch(params.endpoint+ params.formPath +".model.json", aemRequestOptions);
  const formModel = await formJsonResponse.json();
  if(formModel.properties) {
      const properties =formModel.properties;
      if(properties.aepConfig) {
        aepConfig = JSON.parse(properties.aepConfig);
      }
    }
  
  
  
  return {
    status: 200,
    body: JSON.stringify(aepConfig)
  };
}

exports.main = main;
