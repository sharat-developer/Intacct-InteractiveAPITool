var selectedMethod = "create";
var responseData = {};
var AUDIT_FIELDS = ["WHENCREATED", "WHENMODIFIED", "CREATEDBY", "MODIFIEDBY","createdBy", "createdAt", "updatedBy", "updatedAt"];
var CREATE_SKIP_FIELDS_STD = ["RECORDNO"];
var CREATE_SKIP_FIELDS_CUSTOM = ["id"];
var UPDATE_SKIP_FIELDS = [];
var UPDATE_REQ_FIELDS_STD  = ["RECORDNO"];
var UPDATE_REQ_FIELDS_CUSTOM  = ["id"];
//var VALID_OPERATIONS = ["=", ">", "<", ">=", "<=", "like", "in"];
var VALID_OPERATIONS = {"=":"=",">": "&amp;gt;", "<":"&amp;lt;", ">=":"&amp;gt;=", "<=":"&amp;lt;=", "in":"in", "not in":"not in", "like":"like", "not like":"not like"};
var getAllObjectsFlag = true;

// value contains characters like '&', '>' or '<' converted to XML escape charactes
function encodeHTML(inputString) {

    console.log('inputString==>');
    console.log(inputString);
    //var outputString =

      //return inputString.replace(/&/g, '&amp;amp;')
    var outputString = inputString.replace(/&/g, '&amp;amp;')
        .replace(/</g, '&amp;lt;')
        .replace(/>/g, '&amp;gt;')
        .replace(/"/g, '&amp;quot;')
        .replace(/'/g, '&amp;apos;');

    console.log('outputString==>');
    console.log(outputString);
    return outputString;
}

function getObjectType(){
    if(responseData["Type"]["Attributes"]["keyField"] == "name") {
        return "custom";
    } else {
        return "standard";
    }
}

function sortArrayByKey(inputArray, sortKey) {
    return inputArray.sort(function (a, b) {
        return (a[sortKey]).localeCompare( b[sortKey] );
    });
}

//{'name' :companyId, 'value' : 'INTACCT'} --> {companyId : 'INTACCT'}
function nameValueToJSON(nameValueObject){
    var jsonObj ={};
    $.each(nameValueObject , function(k,v){
        jsonObj[v.name] = v.value;
    });
    return jsonObj;
}


//{[{'name' :companyId, 'value' : 'INTACCT'}, {...}] --> { [{'companyId' : {value: 'INTACCT'}}, {...}]}
function getAssociativeObjectFromArray(indexedArray){

    //console.log("console.log(JSON.stringify(dataJSON));");
    //console.log(indexedArray);

    var associativeObj ={};
    $.each(indexedArray , function(k,v){
        associativeObj[v.Name] = v;
    });
    return associativeObj;
}


function formValidationForInput(){
    var credentialJSON = nameValueToJSON($('#configuration').serializeArray());

    if(!(credentialJSON['senderId'] &&  credentialJSON['senderPassword'] && credentialJSON['endPointURL'] )){
        return false;
    }

    if($("#sessionId").val() != ""){
        return true;
    }else{
        if(credentialJSON['companyId'] &&  credentialJSON['userName'] && credentialJSON['userPassword'] ){
            return true;
        }
    }
    return false;
}

function getQuoteWrappedCSVs(commaSeparatedValues) {
    var csvArray = commaSeparatedValues.split(",");
    return "'"+csvArray.join("', '")+"'";
}

$(function() {

    var myTabJq = $("#myTab");
    var configurationJq = $('#configuration');
    var sessionIdJq = $("#sessionId");
    var docParIdDivJq = $("#docParIdDiv");

    myTabJq.find("a#API3_0_ConstructorTab").attr('class', 'disabled');
    myTabJq.find("a#API2_1_ConstructorTab").attr('class', 'disabled');
    myTabJq.find('a').click(function (e) {
        e.preventDefault();

        if ($(this).hasClass('disabled')) {

            if(formValidationForInput()){
                $(this).tab('show');
            }else{
                alert('Fill up Configuration Details');
                return false;
            }
        }else{
            $(this).tab('show');
        }

    });


    //to clear-off the configuration component when sessionId exists
    sessionIdJq.on("change",function(){//on("keydown",function(){
        //console.log("$(#sessionId).val()==>"+$('#sessionId').val());
        if($('#sessionId').val() != ''){
            $("#companyId").val('');
            $("#userName").val('');
            $("#userPassword").val('');


            // clear contents from tab
            $("#selectMethodDiv").html("");
            $("#selectFieldDiv").html("");
            $("#putValueFieldDiv").html("");
            $("#createXMLShowDiv").html("");
            $("#keyOrQueryDiv").html("");
            $("#returnFormatDiv").html("");
            docParIdDivJq.html("");
            $("#executeXMLDiv").html("");
            $( "#queryForm").html("");

            //getAllObjectsFlag;

            getAllObjectsFlag = true;
        }
    });


    myTabJq.find("a#API3_0_ConstructorTab").bind('click', function () {
        var endPointURL=$('#endPointURL').val();
        console.log('endPointURL==>'+endPointURL);

        console.log('postURL==>'+endPointURL);

        var credentialJSON = nameValueToJSON(configurationJq.serializeArray());

        //console.log('credentialJSON==>'+JSON.stringify(credentialJSON));
        //console.log('credentialJSON==>'+JSON.stringify(credentialJSON));

        var postData = {credential: credentialJSON};

        //console.log('credentialJSON==>'+JSON.stringify(credentialJSON));


        if(sessionIdJq.val() != ''){
            getAllObjectsFlag = true;

            // clear contents from tab2
            $("#selectMethodDiv").html("");
            $("#selectFieldDiv").html("");
            $("#putValueFieldDiv").html("");
            $("#createXMLShowDiv").html("");
            $("#keyOrQueryDiv").html("");
            $("#returnFormatDiv").html("");
            docParIdDivJq.html("");
            $("#executeXMLDiv").html("");
            $( "#queryForm").html("");

            var sessionIdString = sessionIdJq.val();

            postData = {credential: credentialJSON, sessionId : sessionIdString};

            console.log('postData==>'+JSON.stringify(postData));
        }

        //console.log('postData==>'+JSON.stringify(postData));

        if(getAllObjectsFlag){
            getAllObjectsFlag = false;

            credentialJSON = nameValueToJSON(configurationJq.serializeArray());

            var apiSession = new API_Session(credentialJSON['endPointURL'], credentialJSON['senderId'], credentialJSON['senderPassword'], "", "", "3.0");

            var sessionId = sessionIdJq.val();

            if(sessionId != ""){
                apiSession.ip_setSessionID(sessionId);
            }else{
                apiSession.ip_setCredentials(credentialJSON['companyId'], credentialJSON['userName'], credentialJSON['userPassword'], "", "");
            }

            $('#selectObjectDiv').html(
                        "<img height='40em' width='40em' alt='Loading...' src='./img/ajax-loader.gif' id='loading-indicator' />"
            );

            apiSession.ip_inspect("*", true, populateSelectObject);

        }

    });

    myTabJq.find("a#API2_1_ConstructorTab").bind('click', function () {
        //bind only once ;)
        if($("#createXMLShowForm_2_1").length == 0) {
            constructXMLShowFormPopulateData_2_1();
        }

    });
});

function constructDeleteXML( keyForm ){

    var xmlString = getTabOffsetString(2)+"<"+selectedMethod+"> \n";
    xmlString += getTabOffsetString(3)+"<object>"+$("#selectObject").val()+"</object>\n";
    xmlString += constructFormXML(keyForm, 3);
    xmlString += getTabOffsetString(2)+"</"+selectedMethod+">\n";
    return xmlString;
}

function constructInspectXML( keyForm ){

    var  inspectWithDetail = nameValueToJSON( keyForm.serializeArray())['inspectWithDetail'];

    var xmlString = getTabOffsetString(2)+"<"+selectedMethod+((inspectWithDetail)?(" detail = '1'"):(""))+"> \n";
    xmlString += getTabOffsetString(3)+"<object>"+$("#selectObject").val()+"</object>\n";
    xmlString += getTabOffsetString(2)+"</"+selectedMethod+">\n";
    return xmlString;
}

function populateSelectObject(responseData){

    var x2js = new X2JS();

    //console.log("responseData==>");
    //console.log(responseData);

    //alert("data==>" + data);
    var responseDataJSON = x2js.xml_str2json(responseData);

    console.log("responseDataJSON==>");
    console.log(responseDataJSON);
    //alert(jsonData);

    var senderAuthenticationStatus = responseDataJSON["response"]["control"]["status"];
    var selectObjectDivJq = $('#selectObjectDiv');


    if(senderAuthenticationStatus != "success") {
        //make sure, onClick of API 3.0 Constructor Tab getAllObjects been called
        getAllObjectsFlag = true;

        selectObjectDivJq.html("<b style='color : red'>Check CompanyConfig!!! make sure credentials are correct :)</b>");
        console.log('data: ' + JSON.stringify (responseDataJSON));
        alert("Sender Authentication Failure!");
        throw new Error("Sender Authentication Failure!");
    }


    var userAuthenticationStatus = responseDataJSON["response"]["operation"]["authentication"]["status"];

    if(userAuthenticationStatus  != "success") {
        //make sure, onClick of API 3.0 Constructor Tab getAllObjects been called
        getAllObjectsFlag = true;

        selectObjectDivJq.html("<b style='color : red'>Check CompanyConfig!!! make sure credentials are correct :)</b>");
        console.log('data: ' + JSON.stringify (responseDataJSON));
        alert("User Authentication Failure!");
        throw new Error("User Authentication Failure!");
    }


    var dataJSON = responseDataJSON["response"]["operation"]["result"]["data"];

    console.log("dataJSON==>");
    console.log(dataJSON);

    //var inputArray = dataJSON['type'];
    //var sortKey = "__text";

    dataJSON["type"] = sortArrayByKey(dataJSON["type"], "__text");

    console.log("sortedDataJSON==>");
    console.log(dataJSON);


    console.log("dataJSON['type']==>");
    console.log(dataJSON['type']);


    var selectOptionStringHTML = "";
    $.each(dataJSON['type'], function(key, dataIterator){
        selectOptionStringHTML += "<option value='"+dataIterator['_typename']+"'>"+dataIterator['__text']+"</option>"
    });
    selectObjectDivJq.html(
        "<select id='selectObject' class='form-control' name='objectName'>"+
        "<option value='#'>--select an object--</option>" +
        selectOptionStringHTML+
        "</select>"
    );
    $("#selectObject").on("change", function () {
        $("#selectMethodDiv").html(
            "<label class='control-label' for='selectMethod'>Select Method</label>" +
            "                                    <div class='controls'>" +
            "                                        <select id='selectMethod' class='form-control' name='methodName'>" +
            "                                            <option value='dummy'>--select a method--</option>" +
            "                                            <option value='inspect'>inspect</option>" +
            "                                            <option value='create'>create</option>" +
            "                                            <option value='update'>update</option>" +
            "                                            <option value='read'>read</option>" +
            "                                            <option value='readByName'>readByName</option>" +
            "                                            <option value='readByQuery'>readByQuery</option>" +
            "                                            <option value='delete'>delete</option>" +
            "                                        </select>" +
            "                                    </div>"
        );


        $("#selectMethod").on( "change", function(){
            //console.log("selectMethod->onChange");
//        event.preventDefault();
            $("#selectFieldDiv").html("");
            $("#putValueFieldDiv").html("");
            $("#createXMLShowDiv").html("");
            $("#keyOrQueryDiv").html("");
            $("#returnFormatDiv").html("");
            $("#docParIdDiv").html("");
            $("#executeXMLDiv").html("");
            $( "#queryForm").html("");

            selectedMethod = $("#selectMethod").val();

            if(selectedMethod == "dummy"){
                return;
            }
            //handle delete method separately
            else if(selectedMethod == "delete"){
                constructKeyInputForm(selectedMethod);

                $('#docParIdDiv').html(
                    "<div class='row'>" +
                    "<div class='col-md-6 col-md-offset-3'>"+
                    "<button type='button' id = 'constructDeleteXMLBtn' class='btn btn-primary' >Construct Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
                    "</div>" +
                    "</div>"
                );
                $("#constructDeleteXMLBtn").on("click", function(){
                    var xmlString = constructDeleteXML( $("#keyForm"));
                    xmlString = constructContentWrapper(xmlString);
                    constructedXMLShowFormPopulateData(xmlString);
                });

                return;
            }//handle inspect method separately
            else if(selectedMethod == "inspect"){
                constructKeyInputForm(selectedMethod);

                $('#docParIdDiv').html(
                    "<div class='row'>" +
                    "<div class='col-md-6 col-md-offset-3'>"+
                    "<button type='button' id = 'constructInspectXMLBtn' class='btn btn-primary' >Construct Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
                    "</div>" +
                    "</div>"
                );
                $("#constructInspectXMLBtn").on("click", function(){
                    var xmlString = constructInspectXML( $("#keyForm"));
                    xmlString = constructContentWrapper(xmlString);
                    constructedXMLShowFormPopulateData(xmlString);
                });

                return;
            }

            var endPointURL = $('#endPointURL').val();
            console.log('endPointURL==>'+endPointURL);

            var objectSelectJSON = nameValueToJSON($('#objectSelectForm').serializeArray());
            console.log('objectSelectJSON==>'+JSON.stringify(objectSelectJSON)); //objectSelectJSON==>{"objectName":"PROJECT","methodName":"readByQuery"}

            var credentialJSON = nameValueToJSON($('#configuration').serializeArray());
            //console.log('credentialJSON==>'+JSON.stringify(credentialJSON));

            var apiSession = new API_Session(credentialJSON['endPointURL'], credentialJSON['senderId'], credentialJSON['senderPassword'], "", "", "3.0");

            var sessionId = $("#sessionId").val();

            if(sessionId != ""){
                apiSession.ip_setSessionID(sessionId);
            }else{
                apiSession.ip_setCredentials(credentialJSON['companyId'], credentialJSON['userName'], credentialJSON['userPassword'], "", "");
            }

            var selectedObjectName = objectSelectJSON["objectName"];
            apiSession.ip_inspect(selectedObjectName, true, selectMethodCallbackFunction);

        });
    });
}

function selectMethodCallbackFunction(data) {

    var x2js = new X2JS();

    console.log("responseData==>");
    console.log(data);

    //alert("data==>" + data);
    var responseDataJSON = x2js.xml_str2json(data);

    console.log("responseDataJSON==>");
    console.log(responseDataJSON);
    //alert(jsonData);

    var senderAuthenticationStatus = responseDataJSON["response"]["control"]["status"];

    if(senderAuthenticationStatus != "success") {
        //make sure, onClick of API 3.0 Constructor Tab getAllObjects been called
        getAllObjectsFlag = true;

        $('#selectObjectDiv').html("<b style='color : red'>Check CompanyConfig!!! make sure credentials are correct :)</b>");
        console.log('data: ' + JSON.stringify (responseDataJSON));
        alert("Sender Authentication Failure!");
        throw new Error("Sender Authentication Failure!");
    }


    var userAuthenticationStatus = responseDataJSON["response"]["operation"]["authentication"]["status"];

    if(userAuthenticationStatus  != "success") {
        //make sure, onClick of API 3.0 Constructor Tab getAllObjects been called
        getAllObjectsFlag = true;

        $('#selectObjectDiv').html("<b style='color : red'>Check CompanyConfig!!! make sure credentials are correct :)</b>");
        console.log('data: ' + JSON.stringify (responseDataJSON));
        alert("User Authentication Failure!");
        throw new Error("User Authentication Failure!");
    }

    var dataJSON = responseDataJSON["response"]["operation"]["result"]["data"];

    console.log("dataJSON==>");
    console.log(dataJSON);

    responseData = dataJSON;
    responseData["Type"]["Fields"] = getAssociativeObjectFromArray(dataJSON["Type"]["Fields"]["Field"]);

    console.log(JSON.stringify(dataJSON));

    var processedResponseData = processResponseData(responseData, selectedMethod);
    if(selectedMethod.indexOf("read") > -1){
        selectFieldFormPopulateData(processedResponseData);
    }else{
        objectSelectFieldFormPopulateData(processedResponseData);
    }
}



function populateShowApiResponseDiv(apiResponse){
    $('#showResponseDiv').html("<form id='showResponseForm' class='form-horizontal'  method='post'  action='#'>" +
        "<legend>"+selectedMethod+"-method :: API Response</legend>"+
        "</form>"
    );
    $('#showResponseForm').append(
        "<fieldset><div class='col-sm-10' >"+
        "		<div class='form-group'>"+
        "		<label>API Response</label>"+
        "       <textarea id='showResponse' class='form-control' >"+apiResponse+"</textarea>"+
//            "			<input type='text' class='form-control '  name='createXML' value='"+data+"'/>"+  //"+((value.isRequired)?'has-error':'')+"
        "		</div>"+
        "	</div></fieldset>"
    );
    //$('textarea').autoResize();
    var showResponseJq = $("textarea#showResponse");
    showResponseJq.height( (showResponseJq[0].scrollHeight)-1);
}

function populateShowApiResponseDiv_2_1(apiResponse){
    $('#showResponseDiv_2_1').html("<form id='showResponseForm_2_1' class='form-horizontal'  method='post'  action='#'>" +
        "<legend>API-2.1 Response</legend>"+
        "</form>"
    );
    $('#showResponseForm_2_1').append(
        "<fieldset><div class='col-sm-10' >"+
        "		<div class='form-group'>"+
        "		<label>API Response</label>"+
        "       <textarea id='showResponse_2_1' class='form-control' >"+apiResponse+"</textarea>"+
//            "			<input type='text' class='form-control '  name='createXML' value='"+data+"'/>"+  //"+((value.isRequired)?'has-error':'')+"
        "		</div>"+
        "	</div></fieldset>"
    );
    //$('textarea').autoResize();
    var showResponse_2_1Jq = $("textarea#showResponse_2_1");
    showResponse_2_1Jq.height( (showResponse_2_1Jq[0].scrollHeight)-1);
}

function constructedXMLShowFormPopulateData(data){
    $('#createXMLShowDiv').html("<form id='createXMLShowForm' class='form-horizontal'  method='post'  action='#'>" +
        "<legend>"+selectedMethod+"-method :: constructed Request XML</legend>"+
        "</form>"
    );
    $('#createXMLShowForm').append(
        "<fieldset><div class='col-sm-10' >"+
        "		<div class='form-group'>"+
        "		<label>API Request</label>"+
        "       <textarea id='createXML' class='form-control' >"+data+"</textarea>"+
//            "			<input type='text' class='form-control '  name='createXML' value='"+data+"'/>"+  //"+((value.isRequired)?'has-error':'')+"
        "		</div>"+
        "	</div></fieldset>"
    );
    //$('textarea').autoResize();
    var createXMLJq = $("textarea#createXML");
    createXMLJq.height( (createXMLJq[0].scrollHeight)-1);

    $('#executeXMLDiv').html("<form id='executeXMLForm' class='form-horizontal'  method='post'  action='#'>" +
        "<legend>"+selectedMethod+"-method :: execute Request XML</legend>"+
        "</form>"
    );

    var executeXMLFormJq = $('#executeXMLForm');

    executeXMLFormJq.append(
        "<div class='line-break'></div>"+
        "<fieldset><div class='' >"+
        "<div class='col-md-6 col-md-offset-3'>"+
        "<button type='submit' id = executeXMLBtn' class='btn btn-primary' >Execute Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
        "</div>"+
        "</fieldset>"
    );

    executeXMLFormJq.on("submit", function(event){
        event.preventDefault();
        $("#showResponseForm").html('');
        $("#showResponseDiv").html("<img height='50em' width='50em' src='./img/ajax-loader.gif' id='loading-indicator' />");


        var credentialJSON = nameValueToJSON($('#configuration').serializeArray());
        //console.log('credentialJSON==>'+JSON.stringify(credentialJSON));

        customAJAXPost($("#createXML").val(), credentialJSON, $("#sessionId").val(), "3.0");
    });
}

function constructXMLShowFormPopulateData_2_1(){

    $('#createXMLShowDiv_2_1').html("<form id='createXMLShowForm_2_1' class='form-horizontal'  method='post'  action='#'>" +
        "<legend>Construct API-2.1 Request XML</legend>"+
        "</form>"
    );
    $('#createXMLShowForm_2_1').append(
        "<fieldset><div class='col-sm-10' >"+
        "		<div class='form-group'>"+
        "		<label>API Request</label>"+
        "       <textarea id='createXML_2_1' class='form-control' ></textarea>"+
        "		</div>"+
        "	</div></fieldset>"
    );
    //$('textarea').autoResize();
    var createXMLJq_2_1Jq = $("textarea#createXML_2_1");
    createXMLJq_2_1Jq.height( 200 );

    var executeXMLDiv_2_1Jq = $('#executeXMLDiv_2_1');

    executeXMLDiv_2_1Jq.html("<form id='executeXMLForm_2_1' class='form-horizontal'  method='post'  action='#'>" +
        "<legend>Execute API-2.1 Request XML</legend>"+
        "</form>"
    );

    var executeXMLForm_2_1Jq = $('#executeXMLForm_2_1');

    executeXMLForm_2_1Jq.append(
        "<div class='line-break'></div>"+
        "<fieldset><div class='' >"+
        "<div class='col-md-6 col-md-offset-3'>"+
        "<button type='submit' id = executeXMLBtn_2_1' class='btn btn-primary' >Execute Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
        "</div>"+
        "</fieldset>"
    );

    executeXMLForm_2_1Jq.on("submit", function(event){
        event.preventDefault();
        //$("#showResponseForm_2_1").html('');
        $("#showResponseDiv_2_1").html("<img height='50em' width='50em' src='./img/ajax-loader.gif' id='loading-indicator' />");


        var credentialJSON = nameValueToJSON($('#configuration').serializeArray());
        //console.log('credentialJSON==>'+JSON.stringify(credentialJSON));

        customAJAXPost($("#createXML_2_1").val(), credentialJSON, $("#sessionId").val(), "2.1");
    });
}

function constructCreateOrUpdateXML(formObj){
    var xmlString = getTabOffsetString(2) + "<"+selectedMethod + "> \n";
    xmlString += getTabOffsetString(3) + "<"+ responseData["Type"]["_Name"] + ">\n";
    xmlString += constructFormXMLRemovingDot(formObj, 4);
    xmlString += getTabOffsetString(3) + "</" + responseData["Type"]["_Name"] + ">\n";
    xmlString += getTabOffsetString(2) + "</"+selectedMethod + ">\n";
//    console.log("xmlString==>"+xmlString);
    return xmlString;
}

function getTabOffsetString(numOfTabOffset){
    var tabOffset = "";
    for(var i=numOfTabOffset; i>0 ;i--){
        tabOffset +="\t";
    }
//    console.log("xmlString==>"+xmlString);
    return tabOffset;
}

//mainly for create and update <DISPLAYCONTACT.FIRSTNAME>value</DISPLAYCONTACT.FIRSTNAME> to <DISPLAYCONTACT><FIRSTNAME>value</FIRSTNAME></DISPLAYCONTACT>
function constructFormXMLRemovingDot(formObj, numOfTabOffset){
    var postData;
    postData = $(formObj).serializeArray();
//    console.log("postDataJSON==>"+JSON.stringify(postData));

    console.log("postData==>"+ JSON.stringify(postData));

    var formXML = "";

    var openTagArray = [];
    for(var i = 0; i < postData.length ; i++){
        var iterator = postData[i];
        //console.log("iterator[name]==>"+iterator["name"]);
        var tagSplitArray = null;
        if( iterator["name"].indexOf(".") > -1 ){ //contains multiple object in create or update  i.e, DISPLAYCONTACT.FIRSTNAME
            tagSplitArray = iterator["name"].split(".");
            //console.log("tagSplitArray==>"+tagSplitArray);

            for( var j = 0 ; j < tagSplitArray.length - 1 ; j++ ){


                if( ( openTagArray.length == 0 )){ // || ( $.inArray(tagSplitArray[i],  tagSplitArray)>-1 )
                    openTagArray.push(tagSplitArray[j]);
                    formXML += getTabOffsetString(numOfTabOffset)+"<"+tagSplitArray[j]+"> \n";
                    numOfTabOffset++;
                    //console.log("#if( ( openTagArray.length == 0 ))")
                    //console.log("openTagArray.push(tagSplitArray[j])==>"+openTagArray);
                    //console.log("formXML==>"+formXML);


                }else{
                    //if openTagArray[j] doesn't exists
                    if(openTagArray[j] === undefined){
                        openTagArray.push(tagSplitArray[j]);
                        formXML += getTabOffsetString(numOfTabOffset)+"<"+tagSplitArray[j]+"> \n";
                        numOfTabOffset++;
                        //console.log("openTagArray==>"+openTagArray);
                        //console.log("formXML==>"+formXML);
                    }else if( ( openTagArray[j] != tagSplitArray[j] ) ){ //when DISPLAYCONTACT.MAILADDRESS.ADDRESS1 changes to DISPLAYCONTACT.FIRSTNAME   and close MAILADDRESS tag i.e. </MAILADDRESS>
                        for(var k = openTagArray.length-1 ; k >= j ; k--){
                            numOfTabOffset--;
                            formXML += getTabOffsetString(numOfTabOffset)+"</"+openTagArray.pop()+"> \n";
                        }
                        //console.log("#if( ( openTagArray[i] != tagSplitArray[i] ) )")
                        //console.log("openTagArray.push(tagSplitArray[i])==>"+openTagArray);
                        //console.log("formXML==>"+formXML);
                    }
                }

            }

            formXML += getTabOffsetString(numOfTabOffset)+"<"+tagSplitArray[tagSplitArray.length - 1]+">"+iterator['value']+"</"+tagSplitArray[tagSplitArray.length - 1]+"> \n";
            //console.log("#after for( var i = 0 ; i < tagSplitArray.length - 1 ; i++ )")
            //console.log("formXML==>"+formXML);
            //console.log("openTagArray==>"+openTagArray);

        }else{
            while( openTagArray.length > 0){
                console.log("#while( openTagArray.length > 0){ openTagArray==>"+openTagArray);

                numOfTabOffset--;
                formXML += getTabOffsetString(numOfTabOffset)+"</"+openTagArray.pop()+"> \n";

            }

            console.log("else{ noDot formXML==>"+formXML);
            formXML += getTabOffsetString(numOfTabOffset)+"<"+iterator['name']+">"+iterator['value']+"</"+iterator['name']+"> \n";
        }
    }

    console.log("#after for(var i = 0; i < postData.length ; i++) openTagArray==>"+openTagArray);
    //close all open-tags
    //if(openTagArray.length>0){
    while( openTagArray.length > 0){
        //console.log("#while( openTagArray.length > 0){ openTagArray==>"+openTagArray);

        numOfTabOffset--;
        formXML += getTabOffsetString(numOfTabOffset)+"</"+openTagArray.pop()+"> \n";

    }
    return formXML;
}

//mainly for read* & delete call
function constructFormXML(formObj, numOfTabOffset){
    var postData;
    postData = $(formObj).serializeArray();
//    console.log("postDataJSON==>"+JSON.stringify(postData));

    var formXML = "";
    $.each(postData, function(key,value){
        formXML += getTabOffsetString(numOfTabOffset)+"<"+value['name']+">"+value['value']+"</"+value['name']+"> \n";
    });
    return formXML;
}

function constructContentWrapper(xmlString) {
    return "<content>\n" +
        getTabOffsetString(1)+"<function controlid='testControlId'>\n"+
        xmlString+
        getTabOffsetString(1)+"</function>\n"+
        "</content>"
    ;
}

function getValidValueOptions(validValue) {

    var label = validValue["validValueLabel"];
    var key = validValue["validValueKey"];

    if(key == "" && label != "") {
        key = label;
    }
    if(label == "" && key != "") {
        label = key;
    }
    if(label == "" && key == "") {
        label = key = " ";
    }
    return "<option value='"+key+"'>"+label+"</option>";
}

function putValueInFieldsFormPopulateData(putValuesObject, putValueInFieldsFormData){

    //console.log("putValueInFieldsFormPopulateData");
    console.log("putValueInFieldsFormData==>"+JSON.stringify(putValueInFieldsFormData));

    var putValueFieldDivHTML = "<form id='putValueInFieldsForm' class='form-horizontal'  method='post'  action='#'>";
    var putValueInFieldsFormHTML =
            "<fieldset>" +
            "<legend>"+selectedMethod+"-method :: put value in fields</legend>"
        ;
    var index = 0;
    $.each(putValuesObject, function(key,value){
        if(index % 2 == 0){
            putValueInFieldsFormHTML +=
                "<div class='row' >"
            ;
        }
        if( (value["validValues"] !== undefined) && (value["validValues"]["validValue"] !== undefined) ){
            console.log(JSON.stringify(value["validValues"]["validValue"]));
            var selectOptionStringHTML = "";
            $.each(value["validValues"]["validValue"], function(index,validValue){

                selectOptionStringHTML += getValidValueOptions(validValue);//"<option value='"+index+"'>"+validValue["validValueLabel"]+"</option>"
            });
            putValueInFieldsFormHTML +=
                "<div class='col-md-5' >"+
                "		<div class='control-group "+((value['isRequired'] == "true")?'has-error':'')+"' >"+
                "		    <label>"+value['Name']+"</label>"+
                "           <select id='"+value['Name']+"' class='form-control' name='"+value['Name']+"'"+((value['isRequired'] == "true")?'required':'')+">"+
                "			    "+selectOptionStringHTML+  //"+((value.isRequired)?'has-error':'')+"
                "           </select>"+
                "		</div>"+
                "	</div>"
            ;
        }else{

            var inputValueString = "";

            if(putValueInFieldsFormData[value['Name']] !== undefined && putValueInFieldsFormData[value['Name']] != ""){
                //console.log("value defined==>"+putValueInFieldsFormData[value['Name']]);
                inputValueString = "value = "+putValueInFieldsFormData[value['Name']];
            }
            //else{
            //    //console.log("undefined");
            //    //inputValueString = "value = undefined";
            //}

            putValueInFieldsFormHTML +=
                "<div class='col-md-5' >"+
                "		<div class='control-group "+((value['isRequired'] == "true")?'has-error':'')+"'>"+
                "		<label>"+value['Name']+"</label>"+
                "			<input type='text' "+inputValueString+" name='"+value['Name']+"' placeholder='"+"type:"+value['externalDataName']+"; "+((value['maxLength'] != 0)?"maxLength:"+value['maxLength']+"; ":'')+"' class='form-control '  "+((value['isRequired'] == "true")?'required':'')+"/>"+  //"+((value.isRequired)?'has-error':'')+"
                "		</div>"+
                "</div>"
            ;
        }
        index++;
        if(index % 2 == 0){
            putValueInFieldsFormHTML +=
                "</div>"
            ;
        }
    });
    if(index % 2 != 0){
        putValueInFieldsFormHTML +=
            "</div>"
        ;
    }
    putValueInFieldsFormHTML +=
        "<div class='line-break'></div>"+
        "<div class='line-break'></div>"+
        "<div class='col-md-6 col-md-offset-3'>"+
        "<button type='submit' id = 'constructCreateXMLBtn' class='btn btn-primary' >Construct Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
        "</div>"+
        "</fieldset>"
    ;
    $("#putValueFieldDiv").html(
        putValueFieldDivHTML+
        putValueInFieldsFormHTML+
        "</form>"
    );
    $("#putValueInFieldsForm").on("submit",function( event ){
        event.preventDefault();
//        console.log("selectedMethod==>"+selectedMethod);
        var xmlString = constructCreateOrUpdateXML(this);

        xmlString = constructContentWrapper(xmlString);

        constructedXMLShowFormPopulateData(xmlString);
    });
}

function putValueInFieldsForms(responseData){
    var  putValuesObject = {};
    var putValueInFieldsFormData = {};

    $("#objectSelectFieldForm").find("input:checkbox:checked").each(function () {
        putValueInFieldsFormData = nameValueToJSON($( "#putValueInFieldsForm" ).serializeArray());

        //console.log("putValueInFieldsFormData()==>"+JSON.stringify(putValueInFieldsFormData));

        if(responseData["Type"]['Fields'][$(this).val()] != 'undefined'){
            console.log(JSON.stringify(responseData["Type"]["Fields"][$(this).val()]));
            putValuesObject[$(this).val()] = responseData["Type"]["Fields"][$(this).val()];
        }
    });
    putValueInFieldsFormPopulateData(putValuesObject, putValueInFieldsFormData);
}
//for create and update
function objectSelectFieldFormPopulateData(processedData){
    var selectFieldDivHTML =
            "<form id='objectSelectFieldForm' class='form-horizontal'  method='post'  action='#'>"
        ;
    var index = 0;
    var objectSelectFieldFormHTML =
            "<fieldset>"+
            "<legend>"+selectedMethod+"-method :: select fields</legend>"+
            "<div class='row'>"
        ;
    $.each(processedData["Type"]["Fields"], function(key,value){

        var jsonValueString = JSON.stringify(value);
        jsonValueString = jsonValueString.replace(/,/g, ",   ");

        //console.log("value==>");
        //console.log(value);
        //console.log("value['isRequired']==>");
        //console.log(value['isRequired']);

        if((index % 4) != 0){
            objectSelectFieldFormHTML +=
                "<div class='col-md-3' >"+
                "		<div class= 'checkbox' data-content='"+jsonValueString+"' >"+
                "			    <input  type='checkbox' name='selectedFields'  value='"+value['Name']+"' "+((value['isRequired'] == "true") ?(" checked  disabled"):(""))+"/>"+value['Name']+
                "		</div>"+
                "</div>"
            ;
        }else{
            objectSelectFieldFormHTML +=
                "</div>"+
                "<div class='row' >"
            ;
            objectSelectFieldFormHTML +=
                "<div class='col-md-3' >"+
                "		<div class= 'checkbox' data-content='"+jsonValueString+"' >"+
                "			    <input  type='checkbox' name='selectedFields'  value='"+value['Name']+"'"+(((value['isRequired'] == "true")) ?(" checked  disabled"):(""))+">"+value['Name']+
                "		</div>"+
                "</div>"
            ;
        }
        index++;
    });
    objectSelectFieldFormHTML +="</div>";
    selectFieldDivHTML +=objectSelectFieldFormHTML;
    $('#selectFieldDiv').html(
        selectFieldDivHTML +
        "</fieldset>"+
        "</form>"
    );


    $('div.checkbox')
        .popover({'trigger':'hover','placement':'bottom'})
        .blur(function () {
            $(this).popover('hide');
        });

    //initialize PutValuesInField for required parameters
    putValueInFieldsForms(responseData);
    $("#objectSelectFieldForm").find("input[name='selectedFields']").on("change", function (event) {

        event.preventDefault();
        putValueInFieldsForms(responseData);
    });
}

function constructQueryForm(queryIndex){
    var selectFieldStringHTML = "";
    $.each(responseData["Type"]["Fields"], function(key,value){
        selectFieldStringHTML += "<option value='"+value['Name']+"'>"+value['Name']+"</option>"
    });
    var selectOperationStringHTML = "";
    $.each(VALID_OPERATIONS, function(key,value){
        //alert("key==>"+key+" value==>"+value);
        selectOperationStringHTML += "<option value='"+key+"'>"+key+"</option>"
    });
    var queryFormHTML =
            "<div class='col-md-3' >" +
            "		<div class='control-group'>" +
            "		<label>Select Field to Query</label>" +
            "           <select id='queryFormSelectField"+queryIndex+"' class='form-control' name='queryFormSelectField"+queryIndex+"' required >"+
            "			    "+selectFieldStringHTML+  //"+((value.isRequired)?'has-error':'')+"
            "           </select>"+
            "        </div>" +
            "</div>"
        ;
    queryFormHTML +=
        "<div class='col-md-2' >" +
        "		<div class='control-group'>" +
        "		<label>Select Operation</label>" +
        "           <select id='queryFormSelectOperation"+queryIndex+"' class='form-control' name='queryFormSelectField"+queryIndex+"' required >"+
        "			    "+selectOperationStringHTML+  //"+((value.isRequired)?'has-error':'')+"
        "           </select>"+
        "       </div>" +
        "</div>"
    ;
    queryFormHTML +=
        "<div id='readByQueryInputValueDiv"+queryIndex+"' class='col-md-4' >" +
        "		<div class='control-group'>" +
        "		    <label>Input Query Value</label>" +
        "           <input type='text' id='queryValue"+queryIndex+"' name='queryValue"+queryIndex+"' placeholder='type:integer; maxLength:8' class='form-control ' required />" +
        "       </div>" +
        "</div>"
    ;


    return queryFormHTML;
}

function queryFormSelectFieldOnChange(queryIndex){
    $("#queryFormSelectField"+queryIndex+"").on("change", function(){
        var readByQueryInputValueDivHTML ="";
        var currentIndex = $(this).attr('id').replace( /^\D+/g, '');

        console.log("currentIndex==>" + currentIndex);
        var queryFormSelectFieldValue = responseData["Type"]["Fields"][$(this).val()];
        if( (queryFormSelectFieldValue["validValues"] !== undefined) && (queryFormSelectFieldValue["validValues"]["validValue"] !== undefined) ){
            var selectOptionStringHTML = "";
            $.each(queryFormSelectFieldValue["validValues"]["validValue"], function(index,validValue){
                selectOptionStringHTML += getValidValueOptions(validValue);//selectOptionStringHTML += "<option value='"+index+"'>"+validValue+"</option>"
            });

            readByQueryInputValueDivHTML =
                "		<div class='control-group' >"+
                "		    <label>Select Query Value</label>"+
                "           <select id='queryValue"+currentIndex+"' name='queryValue"+currentIndex+"' class='form-control'>"+
                "			    "+selectOptionStringHTML+  //"+((value.isRequired)?'has-error':'')+"
                "           </select>"+
                "		</div>"
            ;
        }else{
            readByQueryInputValueDivHTML =
                "		<div class='control-group'>" +
                "		    <label>Input Query Value</label>" +
                "           <input type='text' id='queryValue"+currentIndex+"' name='queryValue"+currentIndex+"' placeholder='"+"type:" + queryFormSelectFieldValue['externalDataName'] + "; " + ((queryFormSelectFieldValue['maxLength'] != 0)?"maxLength:" + queryFormSelectFieldValue['maxLength']+"; ":'') + "' class='form-control' />" +
                "       </div>"
            ;
        }
        $("#readByQueryInputValueDiv"+currentIndex+"").html(readByQueryInputValueDivHTML);
    });
}

function constructKeyInputForm(methodName){

    var keyOrQueryDivHTML = "";
    var keyFormHTML = "";
    var keyOrQueryDivJq = $('#keyOrQueryDiv');

    if (methodName.indexOf("inspect") != -1) {
        keyOrQueryDivHTML =
                "<form id='keyForm' class='form-horizontal'  method='post'  action='#'>"
            ;

        //var index = 0;
        keyFormHTML =
                "<fieldset>" +
                "<legend>" + selectedMethod + "-method :: with details checkbox</legend>" +
                "<div class='row'>"
            ;
        keyFormHTML +=
            "<div class='col-md-4' >"+
            "		<div class= 'checkbox'>"+
            "			    <input type='checkbox' name='inspectWithDetail' value='true' >"+"Inspect With Detail"+
            "			    </input>"+
            "		</div>"+
            "</div>"
        ;
        keyFormHTML +=
            "</div>" +
            "</fieldset>"
        ;
        keyOrQueryDivHTML += keyFormHTML;
        keyOrQueryDivJq.html(
            keyOrQueryDivHTML +
            "</form>"
            // + "<div id='queryComponentDiv'></div>"
        );

        return;
    }

    var queryIndex = 1;
    //keyOrQueryDiv
    if (methodName.indexOf("Query") != -1) {
        keyOrQueryDivHTML =
                "<form id='queryHiddenForm' class='form-horizontal'  method='post'  action='#'>"
            ;
        keyFormHTML =
                "<fieldset>" +
                "<legend>" + selectedMethod + "-method :: construct query</legend>" +
                "<div class='row'>"
            ;
        keyFormHTML +=
            "<div class='col-md-5' >" +
            "		<div class='control-group has-error'>" +
            "			<input type='hidden' name='query' class='form-control '/>" +  //"+((value.isRequired)?'has-error':'')+"                "		</div>" +
            "</div>"
        ;
        keyFormHTML +=
            "<div class='col-md-5' >" +
            "		<div class='control-group has-error'>" +
            "			<input type='hidden' id='queryIndex' name='queryIndex' class='form-control ' value='1'/>" +  //"+((value.isRequired)?'has-error':'')+"                "		</div>" +
            "</div>"
        ;
        keyFormHTML +=
            "</div>" +
            "</fieldset>"
        ;
        keyOrQueryDivHTML += keyFormHTML;
        keyOrQueryDivJq.html(
            keyOrQueryDivHTML +
            "</form>"
        );
        var queryFormHTML =
                "<form id='queryForm' class='form-horizontal'  method='post'  action='#'>"
            ;
        queryFormHTML +=
            "<fieldset>"
            //"<div class='row'>"
        ;
        queryFormHTML +=
            "</fieldset>" +
            "</form>"
        ;
        keyOrQueryDivJq.append(
            queryFormHTML
        );
        $( "#queryForm").append(
            "<div class='row'>"+
            constructQueryForm(queryIndex)+
            "</div>"
        );
        var keyOrQueryDivAfterHTML =
                "<div class='line-break'></div>"+
                "<button type='button' id='addQueryBtn' name='addQueryBtn' class='btn btn-default btn-lg'>"+
                "<span class='glyphicon glyphicon-plus'></span>"+
                "</button>"
            ;
        //$('#keyOrQueryDiv').after(
        //    keyOrQueryDivAfterHTML
        //);
        keyOrQueryDivJq.append(
            keyOrQueryDivAfterHTML
        );

        //create readByQueryInputValueDivHTML on change of queryFormSelectField
        queryFormSelectFieldOnChange(queryIndex);

        $("#addQueryBtn").on("click", function(){
            queryIndex++;
            $( "input#queryIndex").val(queryIndex);
            queryFormHTML =
                "<div class='line-break'></div>"+
                "<div class='row' id='queryFormDiv"+queryIndex+"'>"+
                "   <div class='col-md-2' >" +
                "	    	<div class='control-group'>" +
                "		        <label>Logical Operator</label>" +
                "               <select id='queryFormLogicalOperator"+queryIndex+"' class='form-control' name='queryFormLogicalOperator"+queryIndex+"' required >"+
                "			        <option value='and'>AND</option>"+  //"+((value.isRequired)?'has-error':'')+"
                "			        <option value='or'>OR</option>"+
                "               </select>"+
                "           </div>" +
                "   </div>"+
                constructQueryForm(queryIndex)+
                "   <button type='button' id='removeQueryBtn"+queryIndex+"' name='removeQueryBtn"+queryIndex+"' class='btn btn-default btn-lg removeQueryBtn'>"+
                "       <span class='glyphicon glyphicon-minus'></span>"+
                "   </button>"+
                "</div>"
            ;

            $( "#queryForm").append(queryFormHTML);

            $(".btn.btn-default.btn-lg.removeQueryBtn").on("click", function(){
                //console.log("removeQueryBtnOnClick");
                //console.log("this.id"+this.id);
                var removeQueryBtnIndex = this.id.replace( /^\D+/g, '');
                $("#queryFormDiv"+removeQueryBtnIndex+"").remove();
            });

            //create readByQueryInputValueDivHTML on change of queryFormSelectField
            queryFormSelectFieldOnChange(queryIndex);

        });
    } else {
        keyOrQueryDivHTML =
                "<form id='keyForm' class='form-horizontal'  method='post'  action='#'>"
            ;

        //var index = 0;
        keyFormHTML =
                "<fieldset>" +
                "<legend>" + selectedMethod + "-method :: input comma seperated keys</legend>" +
                "<div class='row'>"
            ;
        var keysPlaceholder = "Comma Separated Values of RECORDNO";
        if(methodName.indexOf("readByName") > -1){
            keysPlaceholder = "Comma Separated Values of "+(((responseData["Type"]["Attributes"]["keyField"] !== undefined) && (responseData["Type"]["Attributes"]["keyField"] !== null))?(responseData["Type"]["Attributes"]["keyField"]):('VID'))+"";
        }
        keyFormHTML +=
            "<div class='col-md-5' >" +
            "		<div class='control-group has-error'>" +
            "		<label>keys</label>" +
            "			<input type='text' name='keys' placeholder='"+keysPlaceholder+"' class='form-control' required />" +  //"+((value.isRequired)?'has-error':'')+"                "		</div>" +
            "</div>"
        ;
        keyFormHTML +=
            "</div>" +
            "</fieldset>"
        ;
        keyOrQueryDivHTML += keyFormHTML;
        keyOrQueryDivJq.html(
            keyOrQueryDivHTML +
            "</form>"
            // + "<div id='queryComponentDiv'></div>"
        );

    }
}

function constructReturnFormatForm(){
    //returnFormatDiv
    var returnFormatDivHTML =
            "<form id='returnFormatForm' class='form-horizontal'  method='post'  action='#'>"
        ;
    var returnFormatFormHTML =
            "<fieldset>"+
            "<legend>"+selectedMethod+"-method :: select returnFormat</legend>"+
            "<div class='row'>"
        ;
    returnFormatFormHTML +=
        "<div class='col-md-5' >"+
        "		<div class='control-group' >"+
        "		    <label>returnFormat</label>"+
        "           <select id='returnFormatSelect' class='form-control' name='returnFormat'>"+
        "			    <option value='xml'>XML</option>"+
        "			    <option value='json'>JSON</option>"+
        "			    <option value='csv'>CSV</option>"+
        "           </select>"+
        "		</div>"+
        "	</div>"
    ;
    returnFormatFormHTML +=
        "</div>"+
        "</fieldset>"
    ;
    returnFormatDivHTML += returnFormatFormHTML;
    $('#returnFormatDiv').html(
        returnFormatDivHTML +
        "</form>"
    );
}

function constructFormCSV(formObj, inputName){
    var postData = $( formObj ).serializeArray();
    var formCSV = "";
    $.each(postData, function(key,value){
        if(value['name'] == inputName){
            formCSV += " "+value['value']+",";
        }
    });
    if(postData.length > 0){
        formCSV = formCSV.slice(0,-1);
    }
    return formCSV + " ";
}





function constructReadByQueryXML( queryForm ){
    var xmlString = "";
    var queryIndex = parseInt($( "input#queryIndex" ).val());

    console.log("queryIndex==>"+queryIndex);
    //console.log('$( "#queryValue"+i+"").val()==>');
    //console.log($( "#queryValue"+i+"").val());

    for(var i = 1; i <= queryIndex; i++){

        var queryFormSelectFieldValue = $( "#queryFormSelectField"+i+"").val();
        //console.log("queryFormSelectFieldValue==>");
        //console.log(queryFormSelectFieldValue);

        var queryValueIndexJq = $( "#queryValue"+i+"");
        var queryFormLogicalOperatorIndexJq = $( "#queryFormLogicalOperator"+i+"");
        var queryFormSelectOperationIndexJq = $( '#queryFormSelectOperation'+i);

        if( (queryValueIndexJq.val() != "") && (queryFormSelectFieldValue !== undefined) ){
            //console.log("if( ($( '#queryValue'+i+'').val() != '') &&...");
            if(queryFormLogicalOperatorIndexJq.val() != undefined){
                xmlString += " " + queryFormLogicalOperatorIndexJq.val() + " ";

                //console.log("if($( '#queryFormLogicalOperator'+i+'').val() != undefined)");

            }
            xmlString += " "+queryFormSelectFieldValue+" ";

            // fix for operator < convert < to &lt;
            //console.log("$( '#queryFormSelectOperation'+i).val()==>"+$( '#queryFormSelectOperation'+i).val());
            //console.log("VALID_OPERATIONS[$( '#queryFormSelectOperation'+i).val()==>"+VALID_OPERATIONS[$( "#queryFormSelectOperation"+i+"").val()]);

            //xmlString += " "+ VALID_OPERATIONS[queryFormLogicalOperatorIndexJq.val()] +" ";
            xmlString += " "+ VALID_OPERATIONS[queryFormSelectOperationIndexJq.val()] +" ";

            //console.log('$( "#queryValue"+i+"").val()==>');
            //console.log( queryValueIndexJq.val() );

            console.log('$( "#queryFormSelectOperation"+i+"").val()==>');
            console.log( queryFormSelectOperationIndexJq.val() );

            if( (queryFormSelectOperationIndexJq.val() == 'in') || (queryFormSelectOperationIndexJq.val() == 'not in') ){ //getQuoteWrappedCSVs
                xmlString += " ( " +  getQuoteWrappedCSVs( queryValueIndexJq.val() ) +" ) ";
            }else{
                xmlString += " '" + encodeHTML( queryValueIndexJq.val() ) + "' ";
            }
        }
    }
    return xmlString;
}

function constructReadStarXML( selectedFieldsForm, keyForm, returnFormatForm, docParIdForm){
    var formCSV = constructFormCSV(selectedFieldsForm, "selectedFields");
    var xmlString = getTabOffsetString(2) + "<"+selectedMethod+"> \n";
    xmlString += getTabOffsetString(3) + "<object>" + responseData["Type"]["_Name"]+"</object>\n";
    xmlString += getTabOffsetString(3) + "<fields>"+formCSV+"</fields>\n";

    if(selectedMethod == "readByQuery"){
        //var queryXML = constructReadByQueryXML($("#queryForm"));
        xmlString += getTabOffsetString(3)+"<query>"+constructReadByQueryXML($("#queryForm"))+"</query>\n";

        var selectObjectJq = $("#selectObject");
        var currentObject = selectObjectJq.val();

        if( currentObject == "PODOCUMENT" || currentObject == "SODOCUMENT") {
            xmlString += getTabOffsetString(3) + "<docparid>" + $("#docparid").val()+ "</docparid>\n";
        }
    }

    xmlString += constructFormXML(keyForm, 3);
    xmlString += constructFormXML(returnFormatForm, 3);
    xmlString += getTabOffsetString(2)+"</"+selectedMethod+">\n";
    return xmlString;
}

function constructDocParIdForm(value, methodName, readByQueryFlag){
    //docParIdDiv
    var docParIdDivHTML = "";
    if(value == "PODOCUMENT" || value == "SODOCUMENT") {


        //todo assign the Docparid from selected object
        //var docParId = selectObjectJq.attr("name");

        var docParId =  $("#selectObject").find('option:selected').text();

        //console.log("currentObject==>" + currentObject );
        console.log("docParId==>" + docParId );

        docParIdDivHTML =
                "<form id='docParIdForm' class='form-horizontal'  method='post'  action='#'>"
            ;

        var docParIdFormHTML =
                "<fieldset>"+
                "<legend>"+selectedMethod+"-method :: input docparid of '" + responseData["Type"]["_Name"] + "'</legend>"+
                "<div class='row'>"
            ;
        docParIdFormHTML +=
            "<div class='col-md-5' >"+
            "		<div class='control-group has-error'>"+
            "		<label>docparid</label>"+
            "			<input type='text' id='docparid' name='docparid' placeholder='' value='"+docParId+"' class='form-control ' required />"+  //"+((value.isRequired)?'has-error':'')+"
            "		</div>"+
            "</div>"
        ;
        docParIdFormHTML +=
            "</div>"+
            "</fieldset>"+
        "</form>"+
            "<div class='line-break'>" +
            "</div>"
        ;
        docParIdDivHTML += docParIdFormHTML;
    }
    $('#docParIdDiv').html(
        docParIdDivHTML+
        "<div class='row'>" +
        "<div class='col-md-6 col-md-offset-3'>"+
        "<button type='button' id = 'constructReadStarXMLBtn' class='btn btn-primary'>Construct Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
        "</div>" +
        "</div>"
    );

    $("#constructReadStarXMLBtn").on("click", function(){

        var xmlString = constructReadStarXML($("#selectFieldForm"), $("#keyForm"), $("#returnFormatForm"), $("#docParIdForm"));
        xmlString = constructContentWrapper(xmlString);
        constructedXMLShowFormPopulateData(xmlString);
    });
}

//for read* methods
function selectFieldFormPopulateData(processedData){

    console.log('processedData==>');
    console.log(processedData);
    var selectFieldDivHTML =
            "<form id='selectFieldForm' class='form-horizontal'  method='post'  action='#'>"
        ;
    var index = 0;
    var selectFieldFormHTML =
            "<fieldset>"+
            "<legend>"+selectedMethod+"-method :: select fields</legend>"+
            "<div class='row'>"
        ;
    $.each(processedData["Type"]["Fields"], function(key, value){

        //console.log("value==>");
        //console.log(value);

        var jsonValueString = JSON.stringify(value);
        jsonValueString = jsonValueString.replace(/,/g, ",   ");

        if((index % 4) != 0){
            selectFieldFormHTML +=
                "<div class='col-md-3' >"+
                "		<div class= 'checkbox' data-content='"+jsonValueString+"' >"+
                "			    <input  type='checkbox' name='selectedFields' value='"+value['Name']+"' >"+value['Name']+
                "		</div>"+
                "</div>"
            ;
        }else{
            selectFieldFormHTML +=
                "</div>"+
                "<div class='row' >"
            ;
            selectFieldFormHTML +=
                "<div class='col-md-3' >"+
                "		<div class= 'checkbox' data-content='"+jsonValueString+"' >"+
                "			    <input  type='checkbox' name='selectedFields'  value='"+value['Name']+"' >"+value['Name']+
                "		</div>"+
                "</div>"
            ;
        }
        index++;
    });
    selectFieldFormHTML +=
        "</div>"+
        "</fieldset>"
    ;
    selectFieldDivHTML += selectFieldFormHTML;
    $('#selectFieldDiv').html(
        selectFieldDivHTML +
        "</form>"
    );

    $('div.checkbox')
        .popover({'trigger':'hover', 'placement':'bottom'})
        .blur(function () {
            $(this).popover('hide');
        });
    /*
     $('div.checkbox')
     .popover({ title: 'Twitter Bootstrap Popover', content: "It's so simple to create a tooltop for my website!" })
     .blur(function () {
     $(this).popover('hide');
     });

     */

    constructKeyInputForm(selectedMethod);
    constructReturnFormatForm();
    constructDocParIdForm(responseData["Type"]["_Name"], selectedMethod, true);
}

function processResponseData(responseData, method){

    var processedResponseData = responseData;


    if(method == 'create'){

        var createSkipFields = (getObjectType() == "custom") ? ( CREATE_SKIP_FIELDS_CUSTOM ) : ( CREATE_SKIP_FIELDS_STD);

        $.each(AUDIT_FIELDS, function(key, value){
            if(processedResponseData["Type"]["Fields"][value] !== undefined){
                //console.log('key found==>'+responseData["Type"]["Fields"][value]['Name']);
                delete processedResponseData["Type"]["Fields"][value];
            }
        });
        $.each(createSkipFields, function(key, value){
            if(processedResponseData["Type"]["Fields"][value] !== undefined){
                //console.log('removed key==>'+responseData["Type"]["Fields"][value]['Name']);
                delete processedResponseData["Type"]["Fields"][value];
            }
        });

        //for flat array objects
        //$.each(processedResponseData["Type"]["Fields"]["Field"], function(index, value) {
        //    if($.inArray(value, AUDIT_FIELDS)) {
        //        delete processedResponseData["Type"]["Fields"]["Field"][index];
        //    }
        //
        //    if($.inArray(value, createSkipFields)) {
        //        delete processedResponseData["Type"]["Fields"]["Field"][index];
        //    }
        //});
    }else if(method == 'update'){

        $.each(AUDIT_FIELDS, function(key, value){
            if(processedResponseData["Type"]["Fields"][value] !== undefined){
                console.log('AUDIT_FIELDS key found==>'+responseData["Type"]["Fields"][value]['Name']);
                delete processedResponseData["Type"]["Fields"][value];
            }
        });
        $.each(UPDATE_SKIP_FIELDS, function(key, value){
            if(processedResponseData["Type"]["Fields"][value] !== undefined){
                //console.log('removed key==>'+responseData["Type"]["Fields"][value]['Name']);
                delete processedResponseData["Type"]["Fields"][value];
            }
        });


        var updateReqFields = (getObjectType() == "custom") ? ( UPDATE_REQ_FIELDS_CUSTOM ) : ( UPDATE_REQ_FIELDS_STD );

        //console.log("updateReqFields==>");
        //console.log(updateReqFields);

        $.each(processedResponseData["Type"]["Fields"], function(key2, value2){
            console.log("value2==>");
            console.log(value2);
            if(value2['isRequired'] == "true"){
                value2['isRequired'] = "false";

            }
        });

        $.each( updateReqFields, function(key, value) {

            if(processedResponseData["Type"]["Fields"][value] !== undefined){
                console.log('removed key==>'+responseData["Type"]["Fields"][value]['Name']);
                processedResponseData["Type"]["Fields"][value]["isRequired"] = "true";
            }
        });
    }
    //console.log("processedResponseData==>");
    //console.log( processedResponseData);

    return processedResponseData;
}