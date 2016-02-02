/**
 * Created by shegde on 08-10-2014.
 */

/**
 * Global-constants and global-variables
 */
var selectedMethod = "create";
var responseData = {};
var getAllObjectsFlag = true;

var AUDIT_FIELDS = ["WHENCREATED", "WHENMODIFIED", "CREATEDBY", "MODIFIEDBY","createdBy", "createdAt", "updatedBy", "updatedAt"];
var CREATE_SKIP_FIELDS_STD = ["RECORDNO"];
var CREATE_SKIP_FIELDS_CUSTOM = ["id"];
var UPDATE_SKIP_FIELDS = [];
var UPDATE_REQ_FIELDS_STD  = ["RECORDNO"];
var UPDATE_REQ_FIELDS_CUSTOM  = ["id"];
//var VALID_OPERATIONS = ["=", ">", "<", ">=", "<=", "like", "in"];
var VALID_OPERATIONS = {"=":"=",">": "&amp;gt;", "<":"&amp;lt;", ">=":"&amp;gt;=", "<=":"&amp;lt;=", "in":"in", "not in":"not in", "like":"like", "not like":"not like"};
var GET_LIST_OBJECTS = ["accountgroup", "achbankconfiguration", "adjjournal", "allocation", "apaccountlabel", "apadjustment", "apadjustmentbatch", "appayment", "appaymentrequest", "apterm", "araccountlabel", "aradjustment", "aradjustmentbatch", "arpayment", "arpaymentbatch", "arterm", "artransactiondef", "bankaccount", "bill", "billbatch", "cctransaction", "class", "company_info", "contact", "contacttaxgroup", "csnhistory", "custglgroup", "customer", "customerachinfo", "customerbankaccount", "customerchargecard", "customerppackage", "customervisibility", "department", "earningtype", "employee", "employeepref", "employeerate", "expenseadjustmentreport", "expensereport", "expensereportbatch", "expensetypes", "glaccount", "glbudget", "glbudgetitem", "glentry", "gltransaction", "icitem", "icitemtotals", "ictotal", "ictransaction", "ictransactiondef", "invoice", "invoicebatch", "itemglgroup", "itemtaxgroup", "itemtotal", "journal", "location", "locationentity", "locationgroup", "popricelist", "potransaction", "potransactiondef", "pricelistitem", "productline", "project", "projectstatus", "projecttype", "recursotransaction", "renewalmacro", "reportingperiod", "revrecchangelog", "revrecschedule", "revrecscheduleentry", "revrectemplate", "smarteventlog", "sopricelist", "sotransaction", "sotransactiondef", "statglaccount", "statjournal", "stkittransaction", "subscription", "supdoc", "supdocfolder", "task", "taxdetail", "taxschedule", "taxscheduledetail", "taxschedulemap", "territory", "timesheet", "timetype", "trxcurrencies", "uom", "vendglgroup", "vendor", "vendorentityaccount", "vendorpref", "vendorvisibility", "vsoeallocation", "vsoeitempricelist", "vsoepricelist", "warehouse"];

/**
 *  Function to clear contents in the form
 **/
function clearFormContents(formJq) {
    formJq.find('input[type=text], input[type=password], input[type=number], input[type=email], textarea').val('');
}

/**
 *  Function to encode the HTML
 *  value contains characters like '&', '>' or '<' converted to XML escape charactes
 */
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

/**
 *  Function to check if object is custom or standard
 */
function getObjectType(){
    if(responseData["Type"]["Attributes"]["keyField"] == "name") {
        return "custom";
    } else {
        return "standard";
    }
}

/*
 *  Function to sort the array
 */
function sortArrayByKey(inputArray, sortKey) {
    return inputArray.sort(function (a, b) {
        return (a[sortKey]).localeCompare( b[sortKey] );
    });
}

/**
 *  Function to convert name-value array to JSON.
 *  Eg: {'name' :companyId, 'value' : 'INTACCT'} --> {companyId : 'INTACCT'}
**/
function nameValueToJSON(nameValueObject){
    var jsonObj ={};
    $.each(nameValueObject , function(k,v){
        jsonObj[v.name] = v.value;
    });
    return jsonObj;
}

/**
 *  Function to get associative object from Array.
 *  Eg: {[{'name' :companyId, 'value' : 'INTACCT'}, {...}] --> { [{'companyId' : {value: 'INTACCT'}}, {...}]}
 **/
function getAssociativeObjectFromArray(indexedArray){

    //console.log("console.log(JSON.stringify(dataJSON));");
    //console.log(indexedArray);

    var associativeObj ={};
    $.each(indexedArray , function(k,v){
        associativeObj[v.Name] = v;
    });
    return associativeObj;
}

/**
 *  Configuration form validation
 **/
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

/**
 * //todo formvalidation
 * using jquer.validate to trigger form validation programatically without submit
 *
 * */
function instantiateFormValidate(formId) {

    var formIdJq = $("#" + formId);
    formIdJq.removeAttr("novalidate");

    var keyFormValidator = formIdJq.validate({
        //rules: {
        //    name: {
        //        minlength: 2,
        //        required: true
        //    },
        //    message: {
        //        minlength: 2,
        //        required: true
        //    }
        //},
        highlight: function (element) {
            //alert('highlight');
            $(element).closest('.control-group').addClass('has-error');
        },
        success: function (element) {
            element.text('').addClass('valid')
                .closest('.control-group').removeClass('has-error').addClass('success');
        },
        errorElement: 'label',
        errorClass: 'help-block'
    });

    //var keyFormValidator = $("#keyForm").validate();
    //keyFormValidator.form();
}


/**
 *
 */
function loginButtonHTML(appUserName) {
    return '<p></p>'+
    '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">'+
        '<span id="userDisplaySpan" style="font-size: large"><span id="displayUsernameSpan">'+ appUserName +'</span>&nbsp;&nbsp;'+
            '<span class="caret"></span>'+
                        '</span>'+
        '</button>'+
            '<ul class="dropdown-menu" aria-labelledby="dropdownMenu1">'+
                '<li><a id="logOutButton" href="#" >Logout</a></li>'+
            '</ul>';
}

/**
 *
  */
function logoutButtonHTML() {
    return '<p></p>'+
        '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">'+
        '<span id="loginDisplaySpan" style="font-size: large" data-toggle="modal" data-target="#myModal">Login</span>'+
        '</button>'
        ;
}

/**
 *
 * @param formId
 */
function instantiateLoginFormValidate(formId) {
    var formIdJq = $("#" + formId);
    formIdJq.removeAttr("novalidate");

    var formValidator = formIdJq.validate({
        rules : {
            loginPassword: {
                minlength: 5
            },
            confirmPassword: {
                minlength: 5,
                equalTo: "#loginPassword"
            }
        },
        highlight: function (element) {
            //alert('highlight');
            $(element).closest('.control-group').addClass('has-error');
        },
        success: function (element) {
            element.text('').addClass('valid')
                .closest('.control-group').removeClass('has-error').addClass('success');
        },
        errorElement: 'label',
        errorClass: 'help-block'
    });

}

function triggerFormValidation(formId) {
    var formIdJq = $("#" + formId);

    var keyFormValidator = formIdJq.validate();
    return keyFormValidator.form();
}


/**
 *  Alert to fill Configuration fields
 **/
function alertFormValidation() {
    console.log("alertFormValidation");
    alert('Fill up Configuration Details');
}

/**
 *  Function to get single queto values from CSV input.
 *  Eg: abc,xyz --> 'abc', 'xyz'
 **/
function getQuoteWrappedCSVs(commaSeparatedValues) {
    var csvArray = commaSeparatedValues.split(",");
    return "'"+csvArray.join("', '")+"'";
}


/**
 *  Function to resizeTextArea
 *  deprecated function to auto-resize textarea box
 **/
function resizeTextArea() { //textAreaJq
    $.each($("textarea"), function() {
        console.log("textarea id==>");
        console.log($(this).attr("id"));
        var offset = this.offsetHeight - this.clientHeight;
        $(this).css('height', 'auto').css('height', this.scrollHeight + offset + 1);
    });

}

/**
 *  Function to getWrappedXML from XMLBody
 **/
function getWrappedXML(wrapTag, wrapBody) {
    return "<" + wrapTag + ">" + wrapBody + "</" + wrapTag + ">";
}

/**
 *  Function to create GetListXML
 **/
function getGetListXML(selectedGetListObject, filterXML, sortXML, fieldXML) {
    filterXML = (filterXML == "") ? ("<!--filter-->") : (getWrappedXML("filter", filterXML));
    sortXML = (sortXML == "") ? ("<!--sort-->") : (getWrappedXML("sorts", sortXML));
    fieldXML = (fieldXML == "") ? ("<!--field-->") : (getWrappedXML("fields", fieldXML));
    return "<content>" +
        "   <function controlid='testControlId'>" +
        "       <get_list object='" + selectedGetListObject + "' maxitems='10'>" +
                    filterXML+
                    sortXML+
                    fieldXML+
        "       </get_list>" +
        "   </function>" +
        "</content>"
        ;
}

/**
 *  Function to return Filter body XML
 **/
function getFilterBody() {
    return "<!-- <logical logical_operator='and'> -->"+
            "<expression>"+
            "<field></field>"+
            "<operator></operator>"+
            "<value></value>"+
            "</expression>"+
            "<!-- </logical> -->"
        ;
}

/**
 *  Function to return Sort Or Field - body XML
 **/
function getSortOrFieldBody(wrapFun) {
    if(wrapFun == "sort") {
        return "<sortfield order='asc'></sortfield>";
    } else {
        return "<field></field>";
    }
}

/**
 *  Function to extract GetListOperationXML from 2.1 request content XML
 **/
function getGetListOperationXML(requestContent_2_1, operation) {
    requestContent_2_1 = vkbeautify.xmlmin(requestContent_2_1, true);
    var matchString = "<" + operation + ">(.*)</" + operation + ">";
    var operationXML = requestContent_2_1.match(matchString);
    return (operationXML == null) ? ("") : (operationXML[1]);
}


/**
 * Function to delete sessionStorage variables related to this App
 */
function clearAppSessionStorage() {
    sessionStorage.removeItem("loggedInAppUserName");
    sessionStorage.removeItem("loggedInAppUserPassword");
    sessionStorage.removeItem("loggedInAppUserSalt");
}

/**
 * Function which calls all App related Init methods
 */
function appRelatedInitFunctions() {

    //$("#logOutButton").hide();
    //$("#userDisplaySpan").hide();

    $("#deleteConfig").hide();
    var loggedInAppUserName = sessionStorage.getItem("loggedInAppUserName");
    if(loggedInAppUserName != undefined) {
        activeSessionRoutines(loggedInAppUserName);
    } else {
        $("#logInModalButton").show();
        $("#loginDisplaySpan").show();
        //$(".dropdown-menu").hide();
        loadTempConfiguration();
    }
    // is localStorage available?
    if (typeof window.localStorage != "undefined") {

        // retrieve
        var userInfo = localStorage.getItem("IATUserInfo");

        // store
        if(userInfo != undefined) {
            console.log("IATUserInfo==>");
            console.log(userInfo);
            console.log(JSON.parse(userInfo));
        } else {
            //console.log("set::interactiveAPIToolUserInfo");
            //localStorage.setItem("IATUserInfo", userInfoObj);
        }
        // delete
        //localStorage.removeItem("IATUserInfo");
    } else {
        console.log("localStorage is not supported by browser");
    }

    populateTabsSelectUserDiv();
    appRegistrationFormSubmission();
    appSignInFormSubmission();
}

/**
 * Function to save User Info in localStorage
 */
function saveUserInfo( userInfo ) {

    var userInfoObj = [];

    // is localStorage available?
    if (typeof window.localStorage != "undefined") {

        // retrieve
        var userInfoDB = localStorage.getItem("IATUserInfo");
        var loggedInUserName = "";

        // store
        if(userInfoDB != undefined) {
            console.log("IATUserInfo==>");
            console.log(userInfoDB);
            var userInfoDBJSON = JSON.parse(userInfoDB);

            $.each(userInfo, function(key, val) {
                console.log("userInfoKey==>" + key);
                console.log("userInfoVal==>" + val);
                loggedInUserName = key;
                userInfoDBJSON[key] = val;

            });

            //set IATUserInfo DB
            localStorage.setItem("IATUserInfo", JSON.stringify(userInfoDBJSON));

        } else {
            console.log("set::interactiveAPIToolUserInfo");
            userInfoObj = userInfo;

            //initialize the IATUserInfo DB
            localStorage.setItem("IATUserInfo", JSON.stringify(userInfoObj));
        }
        // delete
        //localStorage.removeItem("IATUserInfo");
    } else {
        clearAppSessionStorage();
        console.log("localStorage is not supported by browser");
    }
}

/**
 * Function for Registration form submission methods
 */
function appRegistrationFormSubmission() {
    $("#appUserRegisterForm").on("submit", function(e) {
        e.preventDefault();
        var appUserRegisterJSON = nameValueToJSON($( this ).serializeArray());
        console.log("appRegisterJSON==>" + JSON.stringify(appUserRegisterJSON));


        var enteredPassword = appUserRegisterJSON["appUserPassword"];
        var passwordHash = CryptoJS.SHA3(enteredPassword);

        var userSalt = CryptoJS.lib.WordArray.random(512/8);

        console.log("enteredPassword==>" + enteredPassword);
        console.log("passwordHash==>" + passwordHash);
        console.log("userSalt==>" + userSalt);

        //remove appUserConfirmPassword field from appUserRegisterForm
        delete appUserRegisterJSON["appUserConfirmPassword"];
        delete appUserRegisterJSON["appUserPassword"];

        appUserRegisterJSON["appUserPassword"] = passwordHash.toString();
        appUserRegisterJSON["appUserSalt"] = userSalt.toString();


        console.log("after delete::appRegisterJSON==>" + JSON.stringify(appUserRegisterJSON));

        //making appUserName as key for appUserRegisterJSON object
        var appUserKey = appUserRegisterJSON["appUserName"];
        var appUserRegisterObj = {};
        appUserRegisterObj[appUserKey] = appUserRegisterJSON;

        //auto login the registered user
        sessionStorage.setItem("loggedInAppUserName", appUserRegisterJSON["appUserName"]);
        sessionStorage.setItem("loggedInAppUserPassword", enteredPassword);
        sessionStorage.setItem("loggedInAppUserSalt", userSalt);

        saveUserInfo(appUserRegisterObj);

        $("#myModal").modal("hide");
        //$(".dropdown").html(loginButtonHTML(appUserKey));
        activeSessionRoutines(appUserKey);
    });

}

/**
 * Function to check for active session
 */
function isActiveSessionExist() {
    var loggedInAppUserName = sessionStorage.getItem("loggedInAppUserName");
    return loggedInAppUserName != undefined;
}

/**
 * Function to address activeSession routines
 */
function activeSessionRoutines(appUserName) {
    $("#myModal").modal("hide");
    $("#logInModalButton").hide();


    //$("#loginDisplaySpan").hide();
    //$("#userDisplaySpan").show();

    $(".dropdown").html(loginButtonHTML(appUserName));

    $("#logOutButton").on("click", function(){
        clearAppSessionStorage();
        $("#logInModalButton").show();
        $("#loginDisplaySpan").show();
        $(".dropdown-menu").hide();
        $( this ).hide();
        $("#loginUserDisplaySpan").html("");
        $("#loginMessageSpan").html("");
        $("#signInForm").trigger("reset");
        //$("#deleteConfig").hide();
        loadConfigurationFromLocalStorage();
        //reset the configuration details form
        $(".dropdown").html(logoutButtonHTML());
    });

    //$("#loginUserDisplaySpan").html(" Welcome " + appUserName + "!");
    //$("#displayUsernameSpan").html( appUserName );
    //$(".dropdown").html(loginButtonHTML(appUserName));


    //check if user has entered configuration before login
    var tempConfigurationObjectString = sessionStorage.getItem("tempConfigurationObject");
    if(tempConfigurationObjectString != undefined) {

        var tempConfigurationObject = JSON.parse(tempConfigurationObjectString);

        console.log("tempConfigurationObject==>");
        console.log(tempConfigurationObject);

        sessionStorage.removeItem("tempConfigurationObject");

        localStorageRelatedInitFunctions(tempConfigurationObject["configurationName"], tempConfigurationObject);
        //loadConfigurationFromLocalStorage();
    }

    loadConfigurationFromLocalStorage();
}

/**
 * Function for SignIn form submission methods
 */
function appSignInFormSubmission() {
    //form-signin
    $(".form-signin").on("submit", function(e) {
        e.preventDefault();

        console.log("signInForm on submit");

        var signInFormJSON = nameValueToJSON($( this ).serializeArray());
        console.log("signInFormJSON==>" + JSON.stringify(signInFormJSON));

        var enteredAppUserName = signInFormJSON["appUserName"];
        var enteredAppUserPassword = signInFormJSON["appUserPassword"];

        // retrieve
        var userInfo = localStorage.getItem("IATUserInfo");

        // check if exists
        if(userInfo != undefined) {
            console.log("IATUserInfo==>");
            console.log(userInfo);

            var userInfoObj = JSON.parse(userInfo);
            console.log("userInfoObj==>");
            console.log(userInfoObj);

            var currentUserObj = userInfoObj[enteredAppUserName];

            console.log("userInfoObj==>");

            // if enteredAppUserName exists in localStorage
            if(currentUserObj != undefined) {
                console.log(currentUserObj);
                var currentUserPasswordHash = currentUserObj["appUserPassword"];
                console.log("currentUserPasswordHash==>" + currentUserPasswordHash);

                var currentAppUserSalt = currentUserObj["appUserSalt"];
                console.log("currentAppUserSalt==>" + currentAppUserSalt);

                var enteredAppUserPasswordHash = CryptoJS.SHA3(enteredAppUserPassword);
                console.log("enteredAppUserPasswordHash==>" + enteredAppUserPasswordHash);

                if(currentUserPasswordHash == enteredAppUserPasswordHash){
                    $("#loginMessageSpan").html("");
                    console.log("####################### User Sign In successful #######################");
                    //store login username in session
                    sessionStorage.setItem("loggedInAppUserName", enteredAppUserName);
                    sessionStorage.setItem("loggedInAppUserPassword", enteredAppUserPassword);
                    sessionStorage.setItem("loggedInAppUserSalt", currentAppUserSalt);

                    activeSessionRoutines(enteredAppUserName);

                } else {
                    $("#loginMessageSpan").html("User Sign In attempt unsuccessful! Please try again.");
                    console.log("~~~~~~~~~~~~~~~~~~~~~~~ User Sign In attempt unsuccessful ~~~~~~~~~~~~~");
                }
            }
            else {
                //console.log("set::interactiveAPIToolUserInfo");
                //localStorage.setItem("IATUserInfo", userInfoObj);
                $("#loginMessageSpan").html("Username does not exists!");
            }


        } else {
            //console.log("set::interactiveAPIToolUserInfo");
            //localStorage.setItem("IATUserInfo", userInfoObj);
        }

        // reset form
        $(this).trigger('reset');
    });
}


/**
 * Function to load configuration details from tempConfigurations
 */
function loadTempConfiguration() {
//check if user has entered configuration before login
    var tempConfigurationObjectString = sessionStorage.getItem("tempConfigurationObject");
    if(tempConfigurationObjectString != undefined) {

        var tempConfigurationObject = JSON.parse(tempConfigurationObjectString);

        console.log("tempConfigurationObject==>");
        console.log(tempConfigurationObject);

        //load temprory configuration in the form
        $('#configuration').loadJSON(tempConfigurationObject);
    }
}

/**
 *  jQuery document.getReady function
 **/
$(function() {

    appRelatedInitFunctions();


    /**
     * for back to top functionality
     *
     */
    $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    });
    // scroll body to 0px on click
    $('#back-to-top').click(function () {
        $('#back-to-top').tooltip('hide');
        $('body,html').animate({
            scrollTop: 0
        }, 800);
        return false;
    }).tooltip('show');



    //$('#back-to-top').tooltip('show');


    //on-load of page related to configuration screen
    $("#moreOptionsAnchor").on("click", function() {

        if($("#moreOptions").toggle().is(':visible')){
            $(this).text('-Hide More Options');
        }else{
            $(this).text('+Show More Options');
        }

    }).text("+Show More Options");
    //$(this).text("Show More Options");
    $("#moreOptions").hide();

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
            } else {
                alertFormValidation();
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
            $("#locationId").val('');
            $("#clientId").val('');


            // clear contents from tab
            $("#selectMethodDiv").html("");
            $("#selectFieldDiv").html("");
            $("#putValueFieldDiv").html("");
            //$("#createXMLShowDiv").html("");
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
        if(formValidationForInput() == false){
            return;
        }

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
            //$("#createXMLShowDiv").html("");
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

            console.log("credentialJSON==>");
            console.log(credentialJSON);
            var apiSession = new API_Session(credentialJSON['endPointURL'], credentialJSON['senderId'], credentialJSON['senderPassword'], "", "", "3.0");
            //var apiSession = new API_Session(credentialJSON['endPointURL'], credentialJSON['senderId'], credentialJSON['senderPassword'], credentialJSON['controlId'], credentialJSON['uniqueId'], "3.0", credentialJSON['policyId'], credentialJSON['encodingType']);

            var sessionId = sessionIdJq.val();

            if(sessionId != ""){
                apiSession.ip_setSessionID(sessionId);
            }else{
                apiSession.ip_setCredentials(credentialJSON['companyId'], credentialJSON['userName'], credentialJSON['userPassword'], "", "");
            }

            $('#selectObjectDiv').html(
                        "<img height='40em' width='40em' alt='Loading...' src='./img/ajax-loader.gif' id='loading-indicator' />"
            );

            if(formValidationForInput()) {
                apiSession.ip_inspect("*", true, populateSelectObject);
            } else {
                alertFormValidation();
            }

        }

    });

    myTabJq.find("a#API2_1_ConstructorTab").bind('click', function () {
        if(formValidationForInput() == false){
            return;
        }
        //bind only once ;)
        if($("#createXMLShowForm_2_1").length == 0) {
            objectSelectDivPopulateData_2_1();
            //constructXMLShowFormPopulateData_2_1();
        }

    });

    $("button#clear").on("click", function(){
        var formJq = $(this).parents('form:first');
        clearFormContents(formJq);
    });


    //$("form").on("submit", function(e) {
    //    e.preventDefault();
    //    console.log("formSubmit");
    //    console.log("formName==>" + $(this).attr("id"));
    //    //forceFormValidate($(this).attr("id"));
    //});

    //$("form").submit(function(e){
    //    e.preventDefault();
    //    //alert("Submitted");
    //    console.log("formSubmit");
    //
    //    var formId = $(this).attr("id");
    //    console.log("formId==>" + formId);
    //    //    //forceFormValidate($(this).attr("id"));
    //    instantiateFormValidate(formId);
    //    triggerFormValidation(formId);
    //});


});

/**
 *  Function to construct and return Delete method XML request
 **/
function constructDeleteXML( keyForm ){

    var xmlString = getTabOffsetString(2)+"<"+selectedMethod+"> \n";
    xmlString += getTabOffsetString(3)+"<object>"+$("#selectObject").val()+"</object>\n";
    xmlString += constructFormXML(keyForm, 3);
    xmlString += getTabOffsetString(2)+"</"+selectedMethod+">\n";
    return xmlString;
}

/**
 *  Function to construct and return Inspect method XML request
 **/
function constructInspectXML( keyForm ){

    var  inspectWithDetail = nameValueToJSON( keyForm.serializeArray())['inspectWithDetail'];

    var xmlString = getTabOffsetString(2)+"<"+selectedMethod+((inspectWithDetail)?(" detail = '1'"):(""))+"> \n";
    xmlString += getTabOffsetString(3)+"<object>"+$("#selectObject").val()+"</object>\n";
    xmlString += getTabOffsetString(2)+"</"+selectedMethod+">\n";
    return xmlString;
}

/**
 *  Function to construct and return readMore method XML request
 **/
function constructReadMoreXML( keyForm ){

    var  keyFormObj = nameValueToJSON( keyForm.serializeArray());
    var  readMoreWithResultId = keyFormObj['readMoreWithResultId'];
    var xmlString = getTabOffsetString(2)+"<"+selectedMethod+"> \n";

    if(readMoreWithResultId) {
        xmlString += getTabOffsetString(3) + "<resultId>" + keyFormObj['resultId'] +"</resultId>\n";
    } else {
        xmlString += getTabOffsetString(3)+"<object>"+$("#selectObject").val()+"</object>\n";
    }

    xmlString += getTabOffsetString(2)+"</"+selectedMethod+">\n";
    return xmlString;
}

/**
 *  Function to construct and return getAPISession method XML request
 **/
function constructGetAPISessionXML(){

    return getTabOffsetString(2)+"<"+selectedMethod+"></"+selectedMethod+">\n";
}

/**
 *  Function to construct and return getUserPermissions method XML request, with userId as input
 **/
function constructGetUserPermissionsXML(userId){

    var xmlString = getTabOffsetString(2) + "<"+selectedMethod+"> \n";
    xmlString += getTabOffsetString(3) + "<userId>" + userId + "</userId>\n";
    xmlString += getTabOffsetString(2) + "</" + selectedMethod + ">\n";
    return xmlString;
}

/**
 *  Function to populate all objects in selectObject input field from inspect * call
 **/
function populateSelectObject(responseData){

    var x2js = new X2JS();
    var selectObjectDivJq = $('#selectObjectDiv');

    //console.log("responseData==>");
    //console.log(responseData);

    //alert("data==>" + data);
    var responseDataJSON = x2js.xml_str2json(responseData);

    console.log("responseDataJSON==>");
    console.log(responseDataJSON);
    //alert(jsonData);
    if(responseDataJSON == null) {
        getAllObjectsFlag = true;

        //selectObjectDivJq.html("<b style='color : red'>Check Network connection, also make sure the Post URL is correct.</b>");
        var errorString = "Check Network connection, also make sure the Post URL is correct.";
        selectObjectDivJq.html("<div class='alert alert-danger' role='alert'>" + errorString + "</div>");

        alert("Connection Failure!");
        throw new Error("Connection Failure!");
    }

    var senderAuthenticationStatus = responseDataJSON["response"]["control"]["status"];



    if(senderAuthenticationStatus != "success") {
        //make sure, onClick of API 3.0 Constructor Tab getAllObjects been called
        getAllObjectsFlag = true;

        //selectObjectDivJq.html("<b style='color : red'>Check CompanyConfig!!! make sure credentials are correct :)</b>");
        var errorString = "Check CompanyConfig!!! make sure credentials are correct :)";
        selectObjectDivJq.html("<div class='alert alert-danger' role='alert'>" + errorString + "</div>");

        console.log('data: ' + JSON.stringify (responseDataJSON));
        alert("Sender Authentication Failure!");
        throw new Error("Sender Authentication Failure!");
    }


    var userAuthenticationStatus = responseDataJSON["response"]["operation"]["authentication"]["status"];

    if(userAuthenticationStatus  != "success") {
        //make sure, onClick of API 3.0 Constructor Tab getAllObjects been called
        getAllObjectsFlag = true;

        //selectObjectDivJq.html("<b style='color : red'>Check CompanyConfig!!! make sure credentials are correct :)</b>");
        var errorString = "Check CompanyConfig!!! make sure credentials are correct :)";
        selectObjectDivJq.html("<div class='alert alert-danger' role='alert'>" + errorString + "</div>");

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
        "<label class='control-label' for='selectObjectDiv'>Select Object</label>"+
        "<div  class='controls'>"+
            "<select id='selectObject' class='form-control' name='objectName'>"+
            "<option value='#'>--select an object--</option>" +
                selectOptionStringHTML+
            "</select>"+
        "</div>"

    );

    var selectObjectJq = $("#selectObject");
    selectObjectJq.on("change", function () {
        //var selectObjectJq = $("#selectObject");
        //var currentObject = selectObjectJq.val();
 
        $("#putValueFieldDiv").html("");
        //$("#createXMLShowDiv").html("");
        $("#keyOrQueryDiv").html("");
        $("#returnFormatDiv").html("");
        $("#docParIdDiv").html("");
        //$("#executeXMLDiv").html("");
        $( "#queryForm").html("");
        $("#selectFieldDiv").html("");

        var selectMethodDivJq = $("#selectMethodDiv");
        if($(this).val() == "#") {
            selectMethodDivJq.html(
                "<label class='control-label' for='selectMethod'>Select Generic Method</label>" +
                "                                    <div class='controls'>" +
                "                                        <select id='selectMethod' class='form-control' name='methodName'>" +
                "                                            <option value='#'>--select a generic method--</option>" +
                "                                            <option value='getAPISession'>getAPISession</option>" +
                "                                            <option value='getUserPermissions'>getUserPermissions</option>" +
                "                                        </select>" +
                "                                    </div>"
            );
            var defaultXMLString =
                    "<content> " +
                    "   <function controlid='testControlId'>"+
                    "   <!-- Put your API-3.0 functions here  or use above Request XML - Builder to build it --> "+
                    "   </function> " +
                    "</content> "
                ;
            defaultXMLString = vkbeautify.xml(defaultXMLString);
            constructedXMLShowFormPopulateData(defaultXMLString, false);

            $("#selectMethod").on( "change", function(){
                //console.log("selectMethod->onChange");
//        event.preventDefault();
                var selectFieldDivJq = $("#selectFieldDiv");
                var docParIdDivJq = $("#docParIdDiv");

                selectFieldDivJq.html("<img height='50em' width='50em' src='./img/ajax-loader.gif' id='loading-indicator' />");
                $("#putValueFieldDiv").html("");
                //$("#createXMLShowDiv").html("");
                $("#keyOrQueryDiv").html("");
                $("#returnFormatDiv").html("");
                docParIdDivJq.html("");
                //$("#executeXMLDiv").html("");
                $( "#queryForm").html("");

                selectedMethod = $("#selectMethod").val();
                var xmlString = "";
                if(selectedMethod == "#"){
                    selectFieldDivJq.html("");
                    return;
                } else if(selectedMethod == "getAPISession") { //handle getAPISession method separately
                    console.log("selectedMethod ==>" + selectedMethod);
                    selectFieldDivJq.html("");
                    xmlString = constructGetAPISessionXML();
                    xmlString = constructContentWrapper(xmlString);
                    constructedXMLShowFormPopulateData(xmlString, true);
                    return;
                } else if(selectedMethod == "getUserPermissions") { //handle getUserPermissions method separately
                    console.log("selectedMethod ==>" + selectedMethod);

                    var endPointURL = $('#endPointURL').val();
                    console.log('endPointURL==>'+endPointURL);

                    var objectSelectJSON = nameValueToJSON($('#objectSelectForm').serializeArray());
                    console.log('objectSelectJSON==>'+JSON.stringify(objectSelectJSON)); //objectSelectJSON==>{"objectName":"PROJECT","methodName":"readByQuery"}

                    var credentialJSON = nameValueToJSON($('#configuration').serializeArray());
                    //console.log('credentialJSON==>'+JSON.stringify(credentialJSON));

                    var apiSession = new API_Session(credentialJSON['endPointURL'], credentialJSON['senderId'], credentialJSON['senderPassword'], "", "", "3.0");
                    //var apiSession = new API_Session(credentialJSON['endPointURL'], credentialJSON['senderId'], credentialJSON['senderPassword'], credentialJSON['controlId'], credentialJSON['uniqueId'], "3.0", credentialJSON['policyId'], credentialJSON['encodingType']);

                    var sessionId = $("#sessionId").val();

                    if(sessionId != ""){
                        apiSession.ip_setSessionID(sessionId);
                    }else{
                        apiSession.ip_setCredentials(credentialJSON['companyId'], credentialJSON['userName'], credentialJSON['userPassword'], "", "");
                    }
                    apiSession.ip_readByQuery("USERINFO", "LOGINID","", "", "xml", selectMethodCallbackFunction);
                }


            });


            return;
        }

        selectMethodDivJq.html(
            "<label class='control-label' for='selectMethod'>Select Method</label>" +
            "                                    <div class='controls'>" +
            "                                        <select id='selectMethod' class='form-control' name='methodName'>" +
            "                                            <option value='#'>--select a method--</option>" +
            "                                            <option value='inspect'>inspect</option>" +
            "                                            <option value='create'>create</option>" +
            "                                            <option value='update'>update</option>" +
            "                                            <option value='read'>read</option>" +
            "                                            <option value='readByName'>readByName</option>" +
            "                                            <option value='readByQuery'>readByQuery</option>" +
            "                                            <option value='readMore'>readMore</option>" +
            "                                            <option value='delete'>delete</option>" +
            "                                        </select>" +
            "                                    </div>"
        );


        $("#selectMethod").on( "change", function(){
            //console.log("selectMethod->onChange");
//        event.preventDefault();
            var selectFieldDivJq = $("#selectFieldDiv");
            var docParIdDivJq = $("#docParIdDiv");

            selectFieldDivJq.html("<img height='50em' width='50em' src='./img/ajax-loader.gif' id='loading-indicator' />");
            $("#putValueFieldDiv").html("");
            //$("#createXMLShowDiv").html("");
            $("#keyOrQueryDiv").html("");
            $("#returnFormatDiv").html("");
            docParIdDivJq.html("");
            //$("#executeXMLDiv").html("");
            $( "#queryForm").html("");

            selectedMethod = $("#selectMethod").val();
            var xmlString = "";
            if(selectedMethod == "#"){
                selectFieldDivJq.html("");
                return;
            } else if(selectedMethod == "readMore"){ //handle readMore method separately
                console.log("selectedMethod ==>" + selectedMethod);
                //selectFieldDivJq.html("");
                //xmlString = constructReadMoreXML();
                //xmlString = constructContentWrapper(xmlString);
                //constructedXMLShowFormPopulateData(xmlString, true);
                //return;
                constructKeyInputForm(selectedMethod);

                selectFieldDivJq.html("");
                docParIdDivJq.html(
                    "<div class='row'>" +
                    "<div class='col-md-8 col-md-offset-4'>"+
                    "<button type='button' id = 'constructReadMoreXMLBtn' class='btn btn-primary' >Construct Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
                    "</div>" +
                    "</div>"
                );

                $("#constructReadMoreXMLBtn").on("click", function(){
                    var xmlString = constructReadMoreXML( $("#keyForm"));
                    xmlString = constructContentWrapper(xmlString);
                    constructedXMLShowFormPopulateData(xmlString, true);
                });

                return;

            }else if(selectedMethod == "delete"){ //handle delete method separately
                constructKeyInputForm(selectedMethod);

                selectFieldDivJq.html("");
                docParIdDivJq.html(
                    "<div class='row'>" +
                    "<div class='col-md-8 col-md-offset-4'>"+
                    "<button type='button' id = 'constructDeleteXMLBtn' class='btn btn-primary' >Construct Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
                    "</div>" +
                    "</div>"
                );
                $("#constructDeleteXMLBtn").on("click", function(){
                    var xmlString = constructDeleteXML( $("#keyForm"));
                    xmlString = constructContentWrapper(xmlString);
                    constructedXMLShowFormPopulateData(xmlString, true);
                });

                return;
            } else if(selectedMethod == "inspect"){ //handle inspect method separately
                constructKeyInputForm(selectedMethod);

                selectFieldDivJq.html("");
                docParIdDivJq.html(
                    "<div class='row'>" +
                    "<div class='col-md-8 col-md-offset-4'>"+
                    "<button type='button' id = 'constructInspectXMLBtn' class='btn btn-primary' >Construct Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
                    "</div>" +
                    "</div>"
                );
                $("#constructInspectXMLBtn").on("click", function(){
                    var xmlString = constructInspectXML( $("#keyForm"));
                    xmlString = constructContentWrapper(xmlString);
                    constructedXMLShowFormPopulateData(xmlString, true);
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
            //var apiSession = new API_Session(credentialJSON['endPointURL'], credentialJSON['senderId'], credentialJSON['senderPassword'], credentialJSON['controlId'], credentialJSON['uniqueId'], "3.0", credentialJSON['policyId'], credentialJSON['encodingType']);

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

    var defaultXMLString =
            "<content> " +
            "   <function controlid='testControlId'>"+
            "   <!-- Put your API-3.0 functions here  or use above Request XML - Builder to build it --> "+
            "   </function> " +
            "</content> "
        ;
    defaultXMLString = vkbeautify.xml(defaultXMLString);

    constructedXMLShowFormPopulateData(defaultXMLString, false);

    selectObjectJq.trigger("change");
}

/**
 *  AJAX Callback Function, inspect for an object call
 **/
function selectMethodCallbackFunction(data) {

    var x2js = new X2JS();

    console.log("responseData==>");
    console.log(data);

    //alert("data==>" + data);
    var responseDataJSON = x2js.xml_str2json(data);

    console.log("responseDataJSON==>");
    console.log(responseDataJSON);
    //alert(jsonData);
    var selectFieldDivJq = $('#selectFieldDiv');
    if(responseDataJSON == null) {
        //selectFieldDivJq.html("<b style='color : red; font-size: 1.5em;'>Check Network connection, also make sure the Post URL is correct.</b>");

        var errorString = "Check Network connection, also make sure the Post URL is correct.";
        selectFieldDivJq.html("<div class='alert alert-danger' role='alert'>" + errorString + "</div>");

        alert("Connection Failure!");
        throw new Error("Connection Failure!");
    }

    var senderAuthenticationStatus = responseDataJSON["response"]["control"]["status"];

    if(senderAuthenticationStatus != "success") {
        //make sure, onClick of API 3.0 Constructor Tab getAllObjects been called
        getAllObjectsFlag = true;

        //selectFieldDivJq.html("<b style='color : red'>Check CompanyConfig!!! make sure credentials are correct :)</b>");

        var errorString = "Check CompanyConfig!!! make sure credentials are correct :)";
        selectFieldDivJq.html("<div class='alert alert-danger' role='alert'>" + errorString + "</div>");

        console.log('data: ' + JSON.stringify (responseDataJSON));
        alert("Sender Authentication Failure!");
        throw new Error("Sender Authentication Failure!");
    }


    var userAuthenticationStatus = responseDataJSON["response"]["operation"]["authentication"]["status"];

    if(userAuthenticationStatus  != "success") {
        //make sure, onClick of API 3.0 Constructor Tab getAllObjects been called
        getAllObjectsFlag = true;

        //selectFieldDivJq.html("<b style='color : red'>Check CompanyConfig!!! make sure credentials are correct :)</b>");
        var errorString = "Check CompanyConfig!!! make sure credentials are correct :)";
        selectFieldDivJq.html("<div class='alert alert-danger' role='alert'>" + errorString + "</div>");

        console.log('data: ' + JSON.stringify (responseDataJSON));
        alert("User Authentication Failure!");
        throw new Error("User Authentication Failure!");
    }

    var dataJSON = responseDataJSON["response"]["operation"]["result"]["data"];

    console.log("dataJSON==>");
    console.log(dataJSON);

    if(selectedMethod.indexOf("getUserPermissions") > -1){
        constructUserInputForm(dataJSON);
        return;
    }

    responseData = dataJSON;

    //sort the fields by field Name
    dataJSON["Type"]["Fields"]["Field"] = sortArrayByKey(dataJSON["Type"]["Fields"]["Field"], "Name");

    responseData["Type"]["Fields"] = getAssociativeObjectFromArray(dataJSON["Type"]["Fields"]["Field"]);

    console.log(JSON.stringify(dataJSON));

    var processedResponseData = processResponseData(responseData, selectedMethod);
    if(selectedMethod.indexOf("read") > -1){
        selectFieldFormPopulateData(processedResponseData);
    }else{
        objectSelectFieldFormPopulateData(processedResponseData);
    }
}

/**
 *  AJAX Callback Function to show response XML from API-3.0 request posted earlier
 **/
function populateShowApiResponseDiv(apiResponse, apiRequest) {

    console.log("inside populateShowApiResponseDiv()::apiRequest==>" +apiRequest);

    var xmlDocAPIRequest = vkbeautify.xml(apiRequest);

    console.log("apiRequest::formatted==>" +xmlDocAPIRequest);

    var showResponseDivHTML =
            //"<div class='row'>"+
                "<ul id='responseTab' class='nav nav-tabs nav-custom'>"+
                    "<li class='active'><a  id='responseXMLTab' href='#responseXML' data-toggle='tab'>API Response</a></li>"+
                    "<li><a  id='requestXMLTab' href='#requestXML' data-toggle='tab'>API Request</a></li>"+
                "</ul>"+
                "<div id='responseTabContent' class='tab-content'>"+
                    "<div class='tab-pane fade active in' id='responseXML'>"+
                        //"<div class='row'>"+
                            "<form id='showResponseForm' class='form-horizontal'  method='post'  action='#'>" +
                            "<legend>"+selectedMethod+"-method :: API Response</legend>"+
                            "<fieldset>" +
                            "   <div class='col-sm-12' >"+
                            "		<div class='form-group'>"+
                            "		<label class='control-label'>API Response</label>"+
                            "       <textarea id='showResponse' class='form-control' >"+apiResponse+"</textarea>"+
                            "		</div>"+
                            "	</div>" +
                            "</fieldset>"+
                            "</form>"+
                        //"</div>"+
                    "</div>"+
                    "<div class='tab-pane fade' id='requestXML'>"+
                        //"<div class='row'>"+
                            "<form id='showRequestForm' class='form-horizontal'  method='post'  action='#'>" +
                                "<legend>"+selectedMethod+"-method :: API Request</legend>"+
                                "<fieldset>" +
                                "   <div class='col-sm-12' >"+
                                "		<div class='form-group'>"+
                                "		<label class='control-label'>API Request</label>"+
                                "       <textarea  rows='30' id='showRequest' class='form-control'></textarea>"+ //" + xmlDocAPIRequest + "
                                "		</div>"+
                                "	</div>" +
                                "</fieldset>"+
                            "</form>"+
                        //"</div>"+
                    "</div>"+
                "</div>"
           // "</div>"
        ;

    $('#showResponseDiv').html(showResponseDivHTML);

    //$('#showResponseForm').append(
    //    "<fieldset>" +
    //    "   <div class='col-sm-12' >"+
    //    "		<div class='form-group'>"+
    //    "		<label class='control-label'>API Response</label>"+
    //    "       <textarea id='showResponse' class='form-control' >"+apiResponse+"</textarea>"+
    //    "		</div>"+
    //    "	</div>" +
    //    "</fieldset>"
    //);


    //$('textarea').autoResize();
    var showResponseJq = $("textarea#showResponse");
    //resizeTextArea();
    console.log("showResponseJq[0].scrollHeight==>" +showResponseJq[0].scrollHeight);
    showResponseJq.height( (showResponseJq[0].scrollHeight)-12);


    //$('#showRequestForm').append(
    //    "<fieldset>" +
    //    "   <div class='col-sm-12' >"+
    //    "		<div class='form-group'>"+
    //    "		<label class='control-label'>API Request</label>"+
    //    "       <textarea id='showRequest' class='form-control' >"+xmlDocAPIRequest+"</textarea>"+
    //    "		</div>"+
    //    "	</div>" +
    //    "</fieldset>"
    //);

    //showRequestJq.

    var showRequestJq = $("#showRequest");
    //following didnt work
    //console.log("showRequestJq[0].scrollHeight==>" +showRequestJq[0].scrollHeight);
    //showRequestJq.height( (showRequestJq[0].scrollHeight)-12 );
    //showRequestJq.height( 800 );

    showRequestJq.val(xmlDocAPIRequest); //.trigger('change');
    var xmlDocAPIRequestLength = xmlDocAPIRequest.split(/\r\n|\r|\n/).length;
    //console.log("xmlDocAPIRequestLength==>" + xmlDocAPIRequestLength);

    showRequestJq.attr("rows", xmlDocAPIRequestLength);
    //$("textarea").trigger('propertychange');

}

/**
 *  AJAX Callback Function to show response XML from API-2.1 request posted earlier
 **/
function populateShowApiResponseDiv_2_1(apiResponse, apiRequest){
    console.log("inside populateShowApiResponseDiv_2_1()::apiRequest==>" +apiRequest);
    var xmlDocAPIRequest = vkbeautify.xml(apiRequest);
    console.log("apiRequest::formatted==>" +xmlDocAPIRequest);

    var showResponseDivHTML_2_1 =
            //"<div class='row'>"+
            "<ul id='responseTab_2_1' class='nav nav-tabs nav-custom'>"+
            "<li class='active'><a  id='responseXMLTab_2_1' href='#responseXML_2_1' data-toggle='tab'>API Response</a></li>"+
            "<li><a  id='requestXMLTab_2_1' href='#requestXML_2_1' data-toggle='tab'>API Request</a></li>"+
            "</ul>"+
            "<div id='responseTabContent_2_1' class='tab-content'>"+
            "<div id='responseXML_2_1' class='tab-pane fade active in' >"+
                //"<div class='row'>"+
            "<form id='showResponseForm_2_1' class='form-horizontal'  method='post'  action='#'>" +
            //"<legend>API Response</legend>"+
            "<fieldset>" +
            "   <div class='col-sm-12' >"+
            "		<div class='form-group'>"+
            "		<label class='control-label'>API Response</label>"+
            "       <textarea id='showResponse_2_1' class='form-control' >"+apiResponse+"</textarea>"+
            "		</div>"+
            "	</div>" +
            "</fieldset>"+
            "</form>"+
                //"</div>"+
            "</div>"+
            "<div id='requestXML_2_1' class='tab-pane fade'>"+
                //"<div class='row'>"+
            "<form id='showRequestForm_2_1' class='form-horizontal'  method='post'  action='#'>" +
            //"<legend>API Request</legend>"+
            "<fieldset>" +
            "   <div class='col-sm-12' >"+
            "		<div class='form-group'>"+
            "		<label class='control-label'>API Request</label>"+
            "       <textarea  id='showRequest_2_1' class='form-control'></textarea>"+ //" + xmlDocAPIRequest + "
            "		</div>"+
            "	</div>" +
            "</fieldset>"+
            "</form>"+
                //"</div>"+
            "</div>"+
            "</div>"
    // "</div>"
        ;

    $('#showResponseDiv_2_1').html(showResponseDivHTML_2_1);
    var showResponseJq = $("textarea#showResponse_2_1");
    console.log("showResponseJq[0].scrollHeight==>" +showResponseJq[0].scrollHeight);
    showResponseJq.height( (showResponseJq[0].scrollHeight)-12);

    var showRequestJq = $("#showRequest_2_1");
    showRequestJq.val(xmlDocAPIRequest);
    var xmlDocAPIRequestLength = xmlDocAPIRequest.split(/\r\n|\r|\n/).length;
    showRequestJq.attr("rows", xmlDocAPIRequestLength);

//    $('#showResponseDiv_2_1').html("<form id='showResponseForm_2_1' class='form-horizontal'  method='post'  action='#'>" +
//        "<legend>API-2.1 Response</legend>"+
//        "</form>"
//    );
//    $('#showResponseForm_2_1').append(
//        "<fieldset><div class='col-sm-12' >"+
//        "		<div class='form-group'>"+
//        "		<label class='control-label'>API Response</label>"+
//        "       <textarea id='showResponse_2_1' class='form-control' >"+apiResponse+"</textarea>"+
////            "			<input type='text' class='form-control '  name='createXML' value='"+data+"'/>"+  //"+((value.isRequired)?'has-error':'')+"
//        "		</div>"+
//        "	</div></fieldset>"
//    );
//    //$('textarea').autoResize();
//    var showResponse_2_1Jq = $("textarea#showResponse_2_1");
//    showResponse_2_1Jq.height( (showResponse_2_1Jq[0].scrollHeight)-12);
}

/**
 *  Function to show the content part of request XML constructed by the API-3.0 Request Builder
 **/
function constructedXMLShowFormPopulateData(data, constructedXMLFlag){
    var legendString = "";
    if(constructedXMLFlag === true) {
        legendString = "<legend>"+selectedMethod+"-method :: constructed Request XML</legend>";
    } else {
        legendString = "<legend>API-3.0 Request XML</legend>";
    }
    $('#createXMLShowDiv').html("<form id='createXMLShowForm' class='form-horizontal'  method='post'  action='#'>" +
        legendString +
        "</form>"
    );
    $('#createXMLShowForm').append(
        "<fieldset><div class='col-sm-12' >"+
        "		<div class='form-group'>"+
        "		<label class='control-label'>API Request</label>"+
        "       <textarea id='createXML' class='form-control' >"+data+"</textarea>"+
//            "			<input type='text' class='form-control '  name='createXML' value='"+data+"'/>"+  //"+((value.isRequired)?'has-error':'')+"
        "		</div>"+
        "	</div></fieldset>"
    );
    //$('textarea').autoResize();
    var createXMLJq = $("textarea#createXML");
    //createXMLJq.height( (createXMLJq[0].scrollHeight)-12);

    var xmlDocAPIRequestLength = data.split(/\r\n|\r|\n/).length;
    console.log("xmlDocAPIRequestLength==>" + xmlDocAPIRequestLength);
    createXMLJq.attr("rows", xmlDocAPIRequestLength);


    if(constructedXMLFlag === true) {
        legendString = "<legend>"+selectedMethod+"-method :: Post Request XML</legend>";
    } else {
        legendString = "<legend>Post Request XML</legend>";
    }
    $('#executeXMLDiv').html("<form id='executeXMLForm' class='form-horizontal'  method='post'  action='#'>" +
        legendString +
        "</form>"
    );

    var executeXMLFormJq = $('#executeXMLForm');

    executeXMLFormJq.append(
        "<div class='line-break'></div>"+
        "<fieldset><div class='row' >"+
        "<div class='col-md-8 col-md-offset-4'>"+
        "<button type='submit' id = 'executeXMLBtn' class='btn btn-primary' >Post Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
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

/**
 *  Function to show the content part of request XML constructed by the API-2.1 Request Builder
 **/
function constructGetListXML_2_1(selectedGetListObject, requestContent_2_1, selectedAttribute) {

    var reqContents = null;

    var filterXML = getGetListOperationXML(requestContent_2_1, "filter");
    var sortXML = getGetListOperationXML(requestContent_2_1, "sorts");
    var fieldXML = getGetListOperationXML(requestContent_2_1, "fields");

    if(selectedAttribute == "filter") {
        filterXML += getFilterBody(); //(filterXML == "" )?(getFilterBody()):(filterXML);
        return getGetListXML(selectedGetListObject, filterXML, sortXML, fieldXML);

    } else if(selectedAttribute == "sort") {
        sortXML += getSortOrFieldBody("sort"); //(sortXML == "" )?(getSortOrFieldBody("sort")):(sortXML);
        return getGetListXML(selectedGetListObject, filterXML, sortXML, fieldXML);

    }else if(selectedAttribute == "field") {
        fieldXML += getSortOrFieldBody("field"); //(fieldXML == "" )?(getSortOrFieldBody("field")):(fieldXML);
        return getGetListXML(selectedGetListObject, filterXML, sortXML, fieldXML);
    }
}

/**
 *  Function to draw HTML for API-2.1 Get List Request XML - Builder
 **/
function objectSelectDivPopulateData_2_1() {
    $('#objectSelectDiv_2_1')
        .html(
        "<form id='objectSelectForm_2_1' class='form-horizontal' method='post'>" +
        "<fieldset>" +
        "<legend>Get List Request XML - Builder</legend>" +
            //"<div class='row'>" +
        "<div class='col-md-5 col-md-5-custom'>" +
        "<div class='control-group'>" +
        "<label class='control-label' for='selectObjectDiv_2_1'>Select Object</label>" +
        "<div id='selectObjectDiv_2_1' class='controls'>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<div class='div-custom'>" + //style='float: none'
        "<label class='control-label col-md-6' for='primary-div-custom' style='text-align : left'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Get List Operations:</label>" +
        "<div id='primary-div-custom' class='col-md-6'>" +
        "<div class='control-group'>" +

        "<div id='filterDiv_2_1' class='col-md-2 col-md-offset-1 btn-primary-div-custom'>" +
        "<button name='filter' type='button' id = 'filter_2_1' class='btn btn-primary'>&nbsp;&nbsp;&nbsp;filter&nbsp;&nbsp;&nbsp;</button>" +
        "</div>" +
        "<div id='sortDiv_2_1' class='col-md-2 col-md-offset-2 btn-primary-div-custom'>" +
        "<button name='sort' type='button' id = 'sort_2_1' class='btn btn-primary'>&nbsp;&nbsp;&nbsp;sort&nbsp;&nbsp;&nbsp;</button>" +
        "</div>" +
        "<div id='fieldsDiv_2_1' class='col-md-2 col-md-offset-2 btn-primary-div-custom'>" +
        "<button name='field' type='button' id = 'fields_2_1' class='btn btn-primary'>&nbsp;&nbsp;&nbsp;fields&nbsp;&nbsp;&nbsp;</button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</fieldset>" +
        "</form>" +
        "<div class='line-break'></div>"
    );
    var selectObjectDiv_2_1_Jq = $("#selectObjectDiv_2_1");
    var selectOptionStringHTML_2_1 = "";
    $.each(GET_LIST_OBJECTS, function(key, val){
        selectOptionStringHTML_2_1 += "<option value='"+val+"'>" + val + "</option>"
    });

    selectObjectDiv_2_1_Jq.html(
        "<select id='selectObject_2_1' class='form-control' name='objectName'>"+
        "   <option value='#'>--select an object--</option>" +
        selectOptionStringHTML_2_1+
        "</select>"
    );
    var selectObject_2_1Jq = $("#selectObject_2_1");
    var divCustom_2_1Jq = $(".div-custom");

    selectObject_2_1Jq.on("change", function () {

        console.log("selectObject_2_1 on change");
        var selectedGetListObject =  selectObject_2_1Jq.val(); //find('option:selected').text();
        divCustom_2_1Jq.hide();
        if(selectedGetListObject == "#"){

            var requestContent_2_1 =
                    "<content> " +
                    "   <function controlid='testControlId' > "+
                    "   <!-- Put your API-2.1 function here  or use above Get List Request XML - Builder to build it --> "+
                    "   </function> " +
                    "</content> "
                ;
            constructXMLShowFormPopulateData_2_1(requestContent_2_1);
        } else {
            divCustom_2_1Jq.show();
            requestContent_2_1 = getGetListXML(selectedGetListObject, "", "", "");
            constructXMLShowFormPopulateData_2_1(requestContent_2_1);
        }

    });

    selectObject_2_1Jq.trigger("change");

    var btnPrimary_2_1Jq = $(".btn-primary-div-custom [type='button']");
    btnPrimary_2_1Jq.on("click", function() {

        var createXML_2_1Jq = $("textarea#createXML_2_1");
        var selectedAttribute = $(this).attr("name");
        console.log("button click::selectedAttribute==>");
        console.log(selectedAttribute);

        var requestContent_2_1 = createXML_2_1Jq.val();

        var selectedGetListObject =  selectObject_2_1Jq.find('option:selected').text();
        var createXML = constructGetListXML_2_1(selectedGetListObject, requestContent_2_1, selectedAttribute);
        //createXML = vkbeautify.xml(createXML);
        //createXML_2_1Jq.height( 10 );
        //createXML_2_1Jq.val(createXML);
        //createXML_2_1Jq.height( (createXML_2_1Jq[0].scrollHeight)-12);
        constructXMLShowFormPopulateData_2_1(createXML);
    });

}

/**
 *  Function to show the content part of request XML constructed by the API-2.1 Request Builder
 **/
function constructXMLShowFormPopulateData_2_1(requestContent_2_1) {

    $('#createXMLShowDiv_2_1')
        .html(

        "<form id='createXMLShowForm_2_1' class='form-horizontal'  method='post'  action='#'>" +
        "<legend>API-2.1 Request XML</legend>"+
        "</form>"
    );


    $('#createXMLShowForm_2_1').append(
        "<fieldset>" +
        "   <div class='col-sm-12 custom-font-size' >"+
        "		<div class='form-group'>"+
        "		    <label class='control-label'>API Request</label>"+
        "           <textarea id='createXML_2_1' class='form-control' ></textarea>"+
        "		</div>"+
        "	</div>" +
        "</fieldset>"
    );
    //$('textarea').autoResize();
    var createXML_2_1Jq = $("textarea#createXML_2_1");
    //createXML_2_1Jq.height( 200 );


    //createXML_2_1Jq.val(formatXml(requestContent_2_1));
    requestContent_2_1 = vkbeautify.xml(requestContent_2_1);
    createXML_2_1Jq.val(requestContent_2_1);
    //console.log("createXML_2_1Jq[0].scrollHeight==>" +createXML_2_1Jq[0].scrollHeight);
    //createXML_2_1Jq.height( (createXML_2_1Jq[0].scrollHeight)-12);
    var xmlDocAPIRequestLength = requestContent_2_1.split(/\r\n|\r|\n/).length;
    console.log("xmlDocAPIRequestLength==>" + xmlDocAPIRequestLength);
    createXML_2_1Jq.attr("rows", xmlDocAPIRequestLength);

    var executeXMLDiv_2_1Jq = $('#executeXMLDiv_2_1');

    executeXMLDiv_2_1Jq.html("<form id='executeXMLForm_2_1' class='form-horizontal'  method='post'  action='#'>" +
        "<legend>Execute API-2.1 Request XML</legend>"+
        "</form>"
    );

    var executeXMLForm_2_1Jq = $('#executeXMLForm_2_1');

    executeXMLForm_2_1Jq.append(
        "<div class='line-break'></div>"+
        "<fieldset><div class='row' >"+
        "<div class='col-md-8 col-md-offset-4'>"+
        "<button type='submit' id = 'executeXMLBtn_2_1' class='btn btn-primary' >Post Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
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

/**
 *  Function to construct and return request XML for Create and Update methods
 **/
function constructCreateOrUpdateXML(formObj){
    var xmlString = getTabOffsetString(2) + "<"+selectedMethod + "> \n";
    xmlString += getTabOffsetString(3) + "<"+ responseData["Type"]["_Name"] + ">\n";
    xmlString += constructFormXMLRemovingDot(formObj, 4);
    xmlString += getTabOffsetString(3) + "</" + responseData["Type"]["_Name"] + ">\n";
    xmlString += getTabOffsetString(2) + "</"+selectedMethod + ">\n";
//    console.log("xmlString==>"+xmlString);
    return xmlString;
}

/**
 *  Function to return the string of tabs based on numOfTabOffset
 **/
function getTabOffsetString(numOfTabOffset){
    var tabOffset = "";
    for(var i=numOfTabOffset; i>0 ;i--){
        tabOffset +="\t";
    }
//    console.log("xmlString==>"+xmlString);
    return tabOffset;
}

/**
 *  Function to construct and return XML element string from the input forms
 *  mainly for create and update methods to transform
 *  <DISPLAYCONTACT.FIRSTNAME>value</DISPLAYCONTACT.FIRSTNAME>   -->  <DISPLAYCONTACT><FIRSTNAME>value</FIRSTNAME></DISPLAYCONTACT>
 **/
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
                    }
                }

            }

            formXML += getTabOffsetString(numOfTabOffset)+"<"+tagSplitArray[tagSplitArray.length - 1]+">"+iterator['value']+"</"+tagSplitArray[tagSplitArray.length - 1]+"> \n";

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

/**
 *  Function to construct XML by reading values from the forms
 *  mainly for read* & delete call
 **/
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

/**
 *  Function to return content wrapped XML with function XML as input
 **/
function constructContentWrapper(xmlString) {
    return "<content>\n" +
        getTabOffsetString(1)+"<function controlid='testControlId'>\n"+
        xmlString+
        getTabOffsetString(1)+"</function>\n"+
        "</content>"
    ;
}

/**
 *  Function to return HTML options tag string from valid value object
 **/
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

/**
 *  Function to construct Put value in the Fields form HTML component
 **/
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
                "		<div class='control-group' >"+ //"+((value['isRequired'] == "true")?'has-error':'')+"
                "		    <label class='control-label'>"+value['Name']+"</label>"+
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
                "		<div class='control-group'>"+ //"+((value['isRequired'] == "true")?'has-error':'')+"
                "		<label class='control-label'>"+value['Name']+"</label>"+
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
        "<div class='row'>"+
        "<div class='col-md-8 col-md-offset-4'>"+
        "<button type='submit' id = 'constructCreateXMLBtn' class='btn btn-primary' >Construct Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
        "</div>"+
        "</fieldset>"+
        "</div>"
    ;
    $("#putValueFieldDiv").html(
        putValueFieldDivHTML+
        putValueInFieldsFormHTML+
        "</form>"
    );

    instantiateFormValidate("putValueInFieldsForm");

    $("#putValueInFieldsForm").on("submit",function( event ){
        event.preventDefault();

        // if form is not validated dont create the Request XML
        if(!triggerFormValidation($(this).attr("id"))) {
            return false;
        }

//        console.log("selectedMethod==>"+selectedMethod);
        var xmlString = constructCreateOrUpdateXML(this);

        xmlString = constructContentWrapper(xmlString);

        constructedXMLShowFormPopulateData(xmlString, true);
    });
}

/**
 *  Function to create putValueInFieldsFormData  by reading checkbox from objectSelectFieldForm
 *  and call putValueInFieldsFormPopulateData() method to construct HTML component
 **/
function putValueInFieldsForm(responseData){
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

/**
 *  Function to construct objectSelectFieldForm from processed data
 *  mainly for create and update methods
 **/
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
    putValueInFieldsForm(responseData);
    $("#objectSelectFieldForm").find("input[name='selectedFields']").on("change", function (event) {

        event.preventDefault();
        putValueInFieldsForm(responseData);
    });
}

/**
 *  Function to construct QueryForm from the given queryIndex
 **/
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
            "		<label class='control-label'>Select Field to Query</label>" +
            "           <select id='queryFormSelectField"+queryIndex+"' class='form-control' name='queryFormSelectField"+queryIndex+"'>"+
            "			    "+selectFieldStringHTML+  //"+((value.isRequired)?'has-error':'')+"
            "           </select>"+
            "        </div>" +
            "</div>"
        ;
    queryFormHTML +=
        "<div class='col-md-2' >" +
        "		<div class='control-group'>" +
        "		<label class='control-label'>Select Operation</label>" +
        "           <select id='queryFormSelectOperation"+queryIndex+"' class='form-control' name='queryFormSelectField"+queryIndex+"'>"+
        "			    "+selectOperationStringHTML+  //"+((value.isRequired)?'has-error':'')+"
        "           </select>"+
        "       </div>" +
        "</div>"
    ;
    queryFormHTML +=
        "<div id='readByQueryInputValueDiv"+queryIndex+"' class='col-md-4' >" +
        "		<div class='control-group'>" +
        "		    <label class='control-label'>Input Query Value</label>" +
        "           <input type='text' id='queryValue"+queryIndex+"' name='queryValue"+queryIndex+"' placeholder='type:integer; maxLength:8' class='form-control'/>" +
        "       </div>" +
        "</div>"
    ;


    return queryFormHTML;
}

/**
 *  jquery Callback Function definatin for on-change of $("#queryFormSelectField"+queryIndex+"")
 **/
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
                "		    <label class='control-label'>Select Query Value</label>"+
                "           <select id='queryValue"+currentIndex+"' name='queryValue"+currentIndex+"' class='form-control'>"+
                "			    "+selectOptionStringHTML+  //"+((value.isRequired)?'has-error':'')+"
                "           </select>"+
                "		</div>"
            ;
        }else{
            readByQueryInputValueDivHTML =
                "		<div class='control-group'>" +
                "		    <label class='control-label'>Input Query Value</label>" +
                "           <input type='text' id='queryValue"+currentIndex+"' name='queryValue"+currentIndex+"' placeholder='"+"type:" + queryFormSelectFieldValue['externalDataName'] + "; " + ((queryFormSelectFieldValue['maxLength'] != 0)?"maxLength:" + queryFormSelectFieldValue['maxLength']+"; ":'') + "' class='form-control' />" +
                "       </div>"
            ;
        }
        $("#readByQueryInputValueDiv"+currentIndex+"").html(readByQueryInputValueDivHTML);
    });
}

/**
 *  Function to construct UserInputForm from responseData object
 **/
function constructUserInputForm(dataJSON) {

    console.log("constructUserInputForm(userInfo)::userInfo==>");
    console.log(dataJSON);

    console.log(JSON.stringify(dataJSON));

    var keyOrQueryDivHTML = "";
    var keyFormHTML = "";
    var keyOrQueryDivJq = $('#keyOrQueryDiv');
    var selectFieldDivJq = $("#selectFieldDiv");

    var selectOptionStringHTML = "";
    $.each(dataJSON["userinfo"], function(index,loginIdObj){
        console.log(loginIdObj);
        var loginId = loginIdObj["LOGINID"];
        selectOptionStringHTML += "<option value='" + loginId + "'>" + loginId + "</option>";//selectOptionStringHTML += "<option value='"+index+"'>"+validValue+"</option>"
    });

    keyOrQueryDivHTML =
        "<form id='keyForm' class='form-horizontal'  method='post'  action='#' role='form' data-toggle='validator'>"
    ;

    //var index = 0;
    keyFormHTML =
        "<fieldset>" +
        "<legend>" + selectedMethod + "-method :: User ID Selection</legend>" +
        "<div class='row'>"+
        "		<div class='control-group col-md-5 ' >"+ //has-error
        "		    <label class='control-label'>Select User ID Value</label>"+
        "           <select id='userId' name='userId' class='form-control'>"+
        "			    "+selectOptionStringHTML+  //"+((value.isRequired)?'has-error':'')+"
        "           </select>"+
        "		</div>"+
        "</div>" +
        "</fieldset>"
    ;
    keyOrQueryDivHTML += keyFormHTML;
    keyOrQueryDivJq.html(
        keyOrQueryDivHTML +
        "</form>"
        // + "<div id='queryComponentDiv'></div>"
    );

    var userIdJq = $("#userId");
    userIdJq.on("change", function() {
        selectFieldDivJq.html("");
        var userId = $(this).val();
        xmlString = constructGetUserPermissionsXML(userId);
        xmlString = constructContentWrapper(xmlString);
        constructedXMLShowFormPopulateData(xmlString, true);
    });

    userIdJq.trigger("change");

}

/**
 *  Function to construct KeyInputForm from given method name
**/
function constructKeyInputForm(methodName){

    var keyOrQueryDivHTML = "";
    var keyFormHTML = "";
    var keyOrQueryDivJq = $('#keyOrQueryDiv');
    var queryIndex = 1;

    if(methodName.indexOf("inspect") != -1) {
        keyOrQueryDivHTML =
                "<form id='keyForm' class='form-horizontal'  method='post'  action='#' role='form' data-toggle='validator' >"
            ;

        //var index = 0;
        keyFormHTML =
                "<fieldset>" +
                "<legend>" + selectedMethod + "-method :: with details</legend>" +
                "<div class='row'>"
            ;
        keyFormHTML +=
            "<div class='col-md-4' >"+
            "		<div class= 'checkbox'>"+
            "			    <input type='checkbox' id='inspectWithDetail' name='inspectWithDetail' value='true' >"+"Inspect With Detail"+
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
    }else if(methodName.indexOf("readMore") != -1) {
        keyOrQueryDivHTML =
            "<form id='keyForm' class='form-horizontal'  method='post'  action='#' role='form' data-toggle='validator' >"
        ;

        //var index = 0;
        keyFormHTML =
            "<fieldset>" +
            "<legend>" + selectedMethod + "-method :: with resultId</legend>" +
            "<div id='readMoreWithResultIdDiv' class='row'>"
        ;
        keyFormHTML +=
            "<div class='col-md-5' >"+
            "		<div class='checkbox'>"+
            "			    <input type='checkbox' id='readMoreWithResultId' name='readMoreWithResultId' value='true'>" + "readMore with ResultId" +
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

        $("#readMoreWithResultId").on("click", function() {
            //console.log("readMoreWithResultId:onClick");
            if($(this).is(":checked")) {
                console.log("readMoreWithResultId:checked");
                $("#readMoreWithResultIdDiv").append(
                    "<div id='resultIdDiv' class='col-md-5' >" +
                    "		<div class='control-group'>" +
                    "		    <label class='control-label'> Result Id </label>" + //class='control-label'
                    "			    <input type='text' id='resultId' name='resultId' placeholder='Input readByQuery or readView resultId' class='form-control' required />" +  //"+((value.isRequired)?'has-error':'')+"                "		</div>" +
                    "       </div>"+
                    "</div>"
                );
            } else {
                console.log("readMoreWithResultId:notChecked");
                $("#resultIdDiv").remove();
            }

        });


        return;
    }   else if(methodName.indexOf("Query") != -1) { //keyOrQueryDiv
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
                "		        <label class='control-label'>Logical Operator</label>" +
                "               <select id='queryFormLogicalOperator"+queryIndex+"' class='form-control' name='queryFormLogicalOperator"+queryIndex+"'>"+
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
                "<form id='keyForm' class='form-horizontal'  method='post'  action='#' role='form' data-toggle='validator'>"
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
            "		<div class='control-group'>" +
            "		<label class='control-label'> keys </label>" + //class='control-label'
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

         //var keyFormValidator = $("#keyForm").validate();
         $("#keyForm").removeAttr("novalidate");
        instantiateFormValidate("keyForm");


    }
}

/**
 *  Function to construct returnFormatForm HTML component
 **/
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
        "		    <label class='control-label'>returnFormat</label>"+
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

/**
 *  Function to extract the values from form Object and to create well-formatted CSV string
 **/
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

/**
 *  Function to extract the values from queryForm Object and to create query body XML string
 **/
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

/**
 *  Function to construct XML string for read, readByQuery and readByName methods,
 *  by reading input values from selectedFieldsForm, keyForm, returnFormatForm and docParIdForm
 **/
function constructReadStarXML(selectedFieldsForm, keyForm, returnFormatForm, docParIdForm){
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

/**
 *  Function to construct docParIdForm
 **/
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
            "		<label class='control-label'>docparid</label>"+
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
        "<div class='col-md-8 col-md-offset-4'>"+
        "<button type='button' id = 'constructReadStarXMLBtn' class='btn btn-primary'>Construct Request XML</button>"+ //type='submit' onsubmit='constructCreateXML();'
        "</div>" +
        "</div>"
    );

    $("#constructReadStarXMLBtn").on("click", function(){



        //todo formvalidation

        if($("#keyForm").length > 0) {
            console.log("$(#keyForm).length > 0");
            if(triggerFormValidation("keyForm")) {
                var xmlString = constructReadStarXML($("#selectFieldForm"), $("#keyForm"), $("#returnFormatForm"), $("#docParIdForm"));
                xmlString = constructContentWrapper(xmlString);
                constructedXMLShowFormPopulateData(xmlString, true);
            }

        } else {
            var xmlString = constructReadStarXML($("#selectFieldForm"), $("#keyForm"), $("#returnFormatForm"), $("#docParIdForm"));
            xmlString = constructContentWrapper(xmlString);
            constructedXMLShowFormPopulateData(xmlString, true);
        }


        //var keyFormValidator = $("#keyForm").validate();
        //keyFormValidator.form();
        //
        //

        //
        //if(keyFormValidator.form()) {
        //    var xmlString = constructReadStarXML($("#selectFieldForm"), $("#keyForm"), $("#returnFormatForm"), $("#docParIdForm"));
        //    xmlString = constructContentWrapper(xmlString);
        //    constructedXMLShowFormPopulateData(xmlString, true);
        //}



    });
}

/**
 *  Function to construct selectFieldForm as per processedData as input parameter
 *  used mainly for read* methods
 **/
function selectFieldFormPopulateData(processedData){

    console.log('processedData==>');
    console.log(processedData);
    var selectFieldDivHTML =
            "<form id='selectFieldForm' class='form-horizontal'  method='post'  action='#'>"
        ;
    var index = 0;
    var selectFieldFormHTML =
            "<fieldset>"+
            "<legend>"+selectedMethod+"-method :: select fields"+
            "   <span class='selectAllFieldsSpan'>"+
            "       <input  type='checkbox' name='selectAllFields' id='selectAllFields' >&nbsp;Select All&nbsp;"+
            "   </span>"+
            "</legend>"+
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
    //todo readRelated
    //if(selectedMethod == "readRelated"){
    //    //constructRelationForm();
    //}
    constructReturnFormatForm();
    constructDocParIdForm(responseData["Type"]["_Name"], selectedMethod, true);

    //select all fields checkbox functionality
    $('#selectAllFields').on("click", function() {

       if($("#selectAllFields:checked").length > 0) {
           $("input[name=selectedFields]").prop("checked", true);
       } else {
           $("input[name=selectedFields]").prop("checked", false);
       }
    });
}

/**
 *  Function to process responseData into processedResponseData based on input method either create or update
 *  used mainly for create and update
 **/
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

        //processedResponseData["Type"]["Fields"] = sortArrayByKey(processedResponseData["Type"]["Fields"], "Name");

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
/**
 *  Function to show response headers like response state, response text and response time
 **/
function readyStateChangeCallback(xRequest, xmlRequestBody, dtdVersion) {
    console.log("readyStateChangeCallback");
    //$('#responseHeaderDiv').html("Status:" + xRequest.status + "statusText:" + xRequest.statusText);

    //document.getElementById('xmlresulthdr').innerHTML = "XMLHTTP Status: " + this.readyState;

    var responseHeaderDivHTML = "";
    var responseHeaderString = "";
    var alertClass = "alert alert-success";
    $("#showResponseDiv").show();

    switch (xRequest.readyState)
    {
        case 0 :
            responseHeaderString = "Request not initialize...";
            break;
        case 1 :
            responseHeaderString = "Server connection opened...";
            break;
        case 2 :
            responseHeaderString = "Response received...";
            break;
        case 3 :
            responseHeaderString = "Processing response...";
            break;
        case 4 :
            // if "OK"
            if (xRequest.status==200)
            {
                // XML data is OK
                var postEndTime = new Date().getTime();
                console.log("postEndTime==>" + postEndTime);

                var postStatTImeHTMLId =  (dtdVersion == "3.0")? ("postStartTime"):("postStartTime_2_1");
                var postStartTimeJq = $("#" + postStatTImeHTMLId);
                var postStartTime = parseInt(postStartTimeJq.val());
                console.log("postStartTime==>" + postStartTime);

                var responseTime = postEndTime - postStartTime;
                console.log("responseTime==>" + responseTime);

                var responseTimeInSeconds = responseTime/1000;
                var statusCode = xRequest.status;

                responseHeaderString = "<strong>Response Time:</strong> " + responseTimeInSeconds + " sec &nbsp;&nbsp;&nbsp;<strong>Status Text:</strong>" + xRequest.statusText + " &nbsp;&nbsp;&nbsp;<strong>Status Code:</strong> " + xRequest.status;

                if(statusCode != 200) {
                    alertClass = "alert alert-danger";
                    $("#showResponseDiv").hide();
                }

                //console.log("readyStateChangeCallback==>" + xmlRequestBody);

                if(dtdVersion == "3.0") {
                    populateShowApiResponseDiv(xRequest.responseText, xmlRequestBody);
                } else if(dtdVersion == "2.1") {
                    populateShowApiResponseDiv_2_1(xRequest.responseText, xmlRequestBody);
                }
                //document.getElementById('xmlresponse').value = xRequest.responseText;
            }
            else
            {
                alertClass = "alert alert-danger";
                responseHeaderString = "Problem retrieving XML data from server. &nbsp;&nbsp;&nbsp;<strong>Status Text:</strong>" + xRequest.statusText + " &nbsp;&nbsp;&nbsp;<strong>Status Code:</strong> " + xRequest.status;
                $("#showResponseDiv").hide();
                //alert("Problem retrieving XML data.  Status: " + this.status);
                //alert("Response Text: " + this.responseText);
            }
            break;
    }

    var responseMetricsFormId = (dtdVersion == "3.0")? ("responseMetricsForm"):("responseMetricsForm_2_1");
    responseHeaderDivHTML = "<form id='" + responseMetricsFormId + "' class='form-horizontal'  method='post'  action='#'>" +
        "<legend>Response Metrics</legend>"+
        "<fieldset>" +
        "<div class='" + alertClass + "' role='alert'>" + responseHeaderString + "</div>"+
        "</fieldset>"+
        "</form>";
    var responseMetricDivId = (dtdVersion == "3.0")? ("responseMetricDiv"):("responseMetricDiv_2_1");
    $("#" + responseMetricDivId).html(responseHeaderDivHTML);
}

/*
 *  setPostStartTime in hidden input HTML component
 */
function setPostStartTime(dtdVersion) {
    var postStatTImeId =  (dtdVersion == "3.0")? ("postStartTime"):("postStartTime_2_1");
    var postStartTimeJq = $("#" + postStatTImeId);
    var postStartTime = new Date().getTime();
    console.log("postStartTime==>" + postStartTime);
    postStartTimeJq.val(postStartTime);

}

/*
 * Populate TabsSelectUserDiv by fetching the Users from localStorage
 *
 */
function populateTabsSelectUserDiv() {
    // retrieve
    var userInfo = localStorage.getItem("IATUserInfo");

    // check if exists
    if(userInfo != undefined) {
        console.log("IATUserInfo==>");
        console.log(userInfo);

        var userInfoObj = JSON.parse(userInfo);
        console.log("userInfoObj==>");
        console.log(userInfoObj);

        var tabsSelectUserHTML = "";
        var tabsUsersHTML = "";

        var index = 0;
        $.each(userInfoObj , function(key,v){

            index++;
            console.log("key==>");
            console.log(key);

            console.log("index==>");
            console.log(index);


            tabsSelectUserHTML +=
                "<div class='media account-select'>"+
                "                                                    <a href='#user-"+ index +"' data-toggle='tab'>"+
                "                                                        <div class='pull-left'>"+
                "                                                            <img class='select-img' src='../img/defaultUserDP.png'"+
                "                                                                 alt=''>"+
                "                                                        </div>"+
                "                                                        <div class='media-body'>"+
                "                                                            <h4 class='select-name'>" + key + "</h4>"+
                "                                                        </div>"+
                "                                                    </a>"+
                "                                                </div>"+
                "                                                <hr />";

            tabsUsersHTML +=
                "<div class='tab-pane' id='user-" + index + "'>"+
                "                                            <img class='profile-img' src='../img/defaultUserDP.png'"+
                "                                                 alt=''>"+
                "                                            <h3 class='text-center'>" + key + "</h3>"+
                "											 <form id='signInForm' class='form-signin' action='' method=''>"+
                "                                                <input id='appUserNameSignIn' name='appUserName' type='hidden' value='" + key + "'>"+
                "                                                <input id='appUserPasswordSignIn' name='appUserPassword' type='password' class='form-control' placeholder='Password' required>"+
                "                                                <input type='submit' class='btn btn-lg btn-default btn-block' value='Sign In' />"+
                "                                            </form>"+
                "                                            <p class='text-center'><a href='#login' data-toggle='tab'>Back to Login</a></p>"+
                "                                            <p class='text-center'><a href='#select' data-toggle='tab'>Select another Account</a></p>"+
                "                                        </div>";

        });

        tabsSelectUserHTML +="<p class='text-center'><a href='#login' data-toggle='tab'>Back to Login</a></p>";

        $("#tabsSelectUser").html(tabsSelectUserHTML);
        $("#my-tab-content").append(tabsUsersHTML);



    }
}