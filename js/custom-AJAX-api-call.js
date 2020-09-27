/**
 * Created by sharat hegde on 7/8/14.
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

    //var apiSession = new API_Session(credentialJSON['endPointURL'], credentialJSON['senderId'], credentialJSON['senderPassword'], "", "", dtdVersion || "3.0");
    var apiSession = new API_Session(credentialJSON['endPointURL'], credentialJSON['senderId'], credentialJSON['senderPassword'], credentialJSON['controlId'], credentialJSON['uniqueId'], dtdVersion, credentialJSON['policyId'], credentialJSON['encodingType'], credentialJSON['urlEncodedXML']);

    if(sessionId){
        apiSession.ip_setSessionID(sessionId);
    }else{
        apiSession.ip_setCredentials( credentialJSON['companyId'], credentialJSON['userName'], credentialJSON['userPassword'], credentialJSON['clientId'],credentialJSON['locationId'] );
    }

    //var processedXML = constructXMLRequest(functionXMLString, apiSession);

    //credentialJSON['endPointURL']
    var postURL = credentialJSON['endPointURL'];


    customSendRequest(apiSession, functionXMLString, readyStateChangeCallback, dtdVersion);
    //if(dtdVersion == "3.0") {
    //    customSendRequest(apiSession, functionXMLString, readyStateChangeCallback, dtdVersion);
    //} else if(dtdVersion == "2.1") {
    //    apiSession.sendRequest(functionXMLString, populateShowApiResponseDiv_2_1);
    //}




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

/**
 * Send AJAX request
 */
function customSendRequest(apiSession, payload, callback, dtdVersion) {

    ////save the API payload(functionString) as the request-history in the localStorage
    saveAPIPayloadInRequestHistory(payload, apiSession["dtdversion"]);

    var xmlDoc = "";

    //cmbs custom
    // if the user's API Request itself is complete with control (sender authentication) and operation (user auth, function) XML block
    if(payload.indexOf('<?xml') > -1) {
        xmlDoc= payload;
    } else {

        if(payload.indexOf('<content>') > -1) {
            xmlDoc= apiSession.getRecHeaderWithOutContent() + payload + apiSession.getRecFooterWithOutContent();
        } else {
            xmlDoc= apiSession.getRecHeader() + payload + apiSession.getRecFooter();
        }
    }

    apiSession.lastRequest = xmlDoc;
    var xRequest = apiSession.getXMLHTTPRequest();
    if (!xRequest)
        throw "Cannot create XMLHTTPRequest";

    var errProc = apiSession.checkError;
    var errCallback = (apiSession.errorProc ? apiSession.errorProc :  function(errMessage) { alert("Error: "+errMessage); } );


    var url = apiSession.ajaxURL;
    xRequest.open('POST', url, true);
    var encodedDoc = "";
    console.log("apiSession.urlEncodedXML==>");
    console.log(apiSession.urlEncodedXML);
    if(apiSession.urlEncodedXML == "true") {
        encodedDoc = 'xmlrequest=' + encodeURIComponent(xmlDoc);
        xRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    } else {
        encodedDoc = xmlDoc;
        xRequest.setRequestHeader("Content-Type", "x-intacct-xml-request");
    }

    xRequest.onreadystatechange = function() {
        //if (xRequest.readyState == READY_STATE_COMPLETE) {
        //    //below lines commented since API response with errors were just comming in alert
        //    //if (errProc(xRequest.responseText, errCallback))
        //    //    return;
        if (callback) {
            console.log("callback(xRequest.responseText, xmlDoc)==>" + encodedDoc);
            callback(xRequest, encodedDoc, dtdVersion);
        }
        //
        //}
    };

    //cmbs
    //xRequest.setRequestHeader("Content-length", encodedDoc.length);
    //xRequest.setRequestHeader("Connection", "close");

    setPostStartTime(dtdVersion);
    xRequest.send(encodedDoc);
}
