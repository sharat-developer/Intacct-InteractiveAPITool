/**
 * Created by sharat hegde  shegde@intacct.com on 7/8/14.
 */


function callback(responseText) {

    alert("responseText==>"+responseText);
}


function constructXMLRequest(payload, apiSession) {
    var xmlDoc = apiSession.getRecHeader() + payload + apiSession.getRecFooter();
    apiSession.lastRequest = xmlDoc;

    // var encodedDoc = (xmlDoc);
     //+ encodeURIComponent(xmlDoc);
    return 'xmlrequest=' + encodeURIComponent(xmlDoc);
}


function customAJAXPost(functionXMLString, credentialJSON, sessionId, dtdVersion){

    var apiSession = new API_Session(credentialJSON['endPointURL'], credentialJSON['senderId'], credentialJSON['senderPassword'], "", "", dtdVersion || "3.0");

    if(sessionId){
        apiSession.ip_setSessionID(sessionId);
    }else{
        apiSession.ip_setCredentials( credentialJSON['companyId'], credentialJSON['userName'], credentialJSON['userPassword'], credentialJSON['clientId'],credentialJSON['locationId'] );
    }

    var processedXML = constructXMLRequest(functionXMLString, apiSession);

    //credentialJSON['endPointURL']
    var postURL = credentialJSON['endPointURL'];


    if(dtdVersion == "3.0") {
        apiSession.sendRequest(functionXMLString, populateShowApiResponseDiv);
    } else if(dtdVersion == "2.1") {
        apiSession.sendRequest(functionXMLString, populateShowApiResponseDiv_2_1);
    }




}


function execute(postData, endPoint){

    $.ajax({
        url: endPoint,//endPoint,
        type: 'POST',
        crossDomain: true,
        data: postData, // or {name: 'jonas'},
        dataType: 'text',
        success:function(data) {
            console.log('ApiResponse-success::data==>' + (data));
            populateShowApiResponseDiv(data);
            return data;
        },
        error:function(data) {
            console.log('ApiResponse-error::data==>' + (data));
            return ('ApiResponse-error::data==>' + (data));
        }
    });

}