/**
 * Created by shegde on 08-10-2014.
 */

var cookieVar= {};//new Array();

//{'name' :companyId, 'value' : 'INTACCT'} ==> {companyId : 'INTACCT'}
function nameValueToJSON(nameValueObject){
    var jsonObj ={};
    $.each(nameValueObject , function(k,v){
        jsonObj[v.name] = v.value;
    });
    return jsonObj;
}

/**
 * Function to save the cookie object as cookie string interactiveAPIToolCookie
 *
 */
function saveCookie() {
    var cookieVal = JSON.stringify(cookieVar);
    console.log('cookieVal==>'+cookieVal);


    var sec=3600000*24*30;
    //console.log('Here we go');
    //console.log('$_SERVER[HTTP_HOST]==>'+ "<?php echo $_SERVER['HTTP_HOST']; ?>");
    //console.log('$_SERVER[REQUEST_URI]==>'+"<?php echo $_SERVER['REQUEST_URI']; ?>");
    console.log('window.location.pathname==>'+window.location.pathname);
    console.log('window.location.hostname==>'+window.location.hostname);
    //console.log('window.location.pathname -1 ==>'+window.location.pathname.substring(1));
    if(docCookies.setItem('interactiveAPIToolCookie', cookieVal, sec, '', window.location.hostname)){
        console.log('interactiveAPIToolCookie set');
    }
}

/**
 * Function to populate chooseCompanyID selectbox
 *
 */
function populateConfiguration() {
    var chooseCompanyIDJq = $("#chooseCompanyID");
    var deleteButtonJq = $("#deleteConfig");

    console.log("$.isEmptyObject(cookieVar)==>" + $.isEmptyObject(cookieVar));

    //if there are no saved configuration
    if($.isEmptyObject(cookieVar)) {
        chooseCompanyIDJq.html("<option value='#'>Save Configuration to list here</option>");
        //clear configuration form contents if saved configuration is empty
        clearFormContents($("#configuration"));
        chooseCompanyIDJq.trigger( "change" );
        deleteButtonJq.hide();
    } else {
        $.each(cookieVar, function(key, value) {
            chooseCompanyIDJq.append("<option value='"+key+"' selected = 'true' >"+key+"</option>");
        });

        deleteButtonJq.show();
        chooseCompanyIDJq.trigger( "change" );
    }


}
/**
 * Function to load Configuration to the  configuration form
 * 
 */
function loadConfiguration() {

    var configurationJq = $('#configuration');
    var chooseCompanyIDJq = $("#chooseCompanyID");
    var cookieVarString =docCookies.getItem('interactiveAPIToolCookie');

    //console.log('cookieVarString--------------------==>'+cookieVarString);
    cookieVar = $.parseJSON(cookieVarString);
    console.log("cookieVar==>" + cookieVar);

    chooseCompanyIDJq.html('');
    //console.log('cookieLength==>'+cookieVar.length);

    populateConfiguration();
}

/**
 * Function to populate chooseCompanyID selectbox
 *
 */
function populateConfigurationFromLocalStorage(appUserConfigListObj) {

    var chooseCompanyIDJq = $("#chooseCompanyID");
    var deleteButtonJq = $("#deleteConfig");

    console.log("$.isEmptyObject(appUserConfigListObj)==>" + $.isEmptyObject(appUserConfigListObj));
    console.log("appUserConfigListObj==>");
    console.log(appUserConfigListObj);

    chooseCompanyIDJq.html('');

    //if there are no saved configuration
    if($.isEmptyObject(appUserConfigListObj)) {
        chooseCompanyIDJq.html("<option value='#'>Save Configuration to list here</option>");
        //clear configuration form contents if saved configuration is empty
        clearFormContents($("#configuration"));
        chooseCompanyIDJq.trigger("change");
        deleteButtonJq.hide();
    } else {
        $.each(appUserConfigListObj, function(key, value) {
            console.log("key==>" + key);
            console.log("value==>" + value);
            chooseCompanyIDJq.append("<option value='" + value + "' selected = 'true' >" + value + "</option>");
        });

        console.log("chooseCompanyIDJq==>");
        console.log(chooseCompanyIDJq.html());

        deleteButtonJq.show();
        // to initiate the load of configuration details in the configuration form
        chooseCompanyIDJq.trigger("change");
    }

}

/**
 * Function to load Configuration in localStorage to the  configuration form
 *
 */
function loadConfigurationFromLocalStorage() {

    var configurationJq = $('#configuration');
    var chooseCompanyIDJq = $("#chooseCompanyID");

    var loggedInAppUserName = sessionStorage.getItem("loggedInAppUserName");
    var appUserConfigListName = "IAT__" + loggedInAppUserName + "__" + "configList" ;

    // retrieve
    var appUserConfigListDB = localStorage.getItem(appUserConfigListName);

    if(appUserConfigListDB != undefined) {
        console.log("appUserConfigListDB==>");
        console.log(appUserConfigListDB);
        var appUserConfigListDBJSON = JSON.parse(appUserConfigListDB);
        console.log("appUserConfigListDBJSON==>");
        console.log(appUserConfigListDBJSON);
        populateConfigurationFromLocalStorage(appUserConfigListDBJSON);

    } else {
        //appUserConfigListDB is empty
        console.log("else::appUserConfigListDB==>");
        console.log(appUserConfigListDB);
        populateConfigurationFromLocalStorage({});
    }

}

/**
 * function to clear all divs after when there is change in configuration
 */
function clearDivsAfterConfigurationChanges() {
    $( "#selectMethodDiv" ).html( "" );
    $("#selectFieldDiv").html("");
    $("#putValueFieldDiv").html("");
    $("#createXMLShowDiv").html("");
    $("#keyOrQueryDiv").html("");
    $("#returnFormatDiv").html("");
    $("#docParIdDiv").html("");
    $("#executeXMLDiv").html("");
    $("#addQueryBtn").hide();
    $("#configDetailsSaveAlertDiv").removeClass("alert").html("");
}

/**
 * Function to delete selected configuration from cookie
 *
 */
function deleteCurrentConfig(valueSelected) {
    //delete the selected value
    delete cookieVar[valueSelected];

    console.log('after delete::cookieVar==>'+ cookieVar);
    saveCookie();
    var chooseCompanyIDJq = $("#chooseCompanyID");
    chooseCompanyIDJq.html('');
    populateConfiguration();
}

/**
 * Function to delete selected configuration from localStorage
 *
 */
function deleteCurrentConfigWithLocalStorage(valueSelected) {
    //delete the selected value

    var appUserConfigListName = getAppUserConfigListName();

    // retrieve
    var appUserConfigListDB = localStorage.getItem(appUserConfigListName);
    if(appUserConfigListDB != undefined) {
        console.log("appUserConfigListDB==>");
        console.log(appUserConfigListDB);
        var appUserConfigListDBJSON = JSON.parse(appUserConfigListDB);

        appUserConfigListDBJSON = $.grep(appUserConfigListDBJSON, function(value) {
            return value != valueSelected;
        });

        console.log("after remove():appUserConfigListDB==>");
        console.log(appUserConfigListDBJSON);

        var appUserConfigListObjectString = JSON.stringify(appUserConfigListDBJSON);
        //set the appUserConfigListName
        localStorage.setItem(appUserConfigListName, appUserConfigListObjectString);

        //remove appUserConfigDetailsName
        var appUserConfigDetailsName =  getAppUserConfigDetailsName(valueSelected);
        localStorage.removeItem(appUserConfigDetailsName);
    }


    var chooseCompanyIDJq = $("#chooseCompanyID");
    chooseCompanyIDJq.html('');
    loadConfigurationFromLocalStorage();
}

/**
 * Function to encrypt the Sensitive Data in configDetails
 */
function encryptSensitiveData(configObject) {

    var userPassword = configObject["userPassword"];
    var senderPassword = configObject["senderPassword"];

    var appUserName = sessionStorage.getItem("loggedInAppUserName");
    var appUserPassword = sessionStorage.getItem("loggedInAppUserPassword");
    var appUserSalt = sessionStorage.getItem("loggedInAppUserSalt");

    console.log("userPassword==>" + userPassword);
    console.log("senderPassword==>" + senderPassword);
    console.log("appUserPassword==>" + appUserPassword);
    console.log("appUserSalt==>" + appUserSalt);

    var encryptionKey512Bits = CryptoJS.PBKDF2(appUserPassword, appUserSalt, { keySize: 512/32 }).toString();
    console.log("encryptionKey512Bits==>" + encryptionKey512Bits);


    var encryptedUserPassword = CryptoJS.AES.encrypt(userPassword, encryptionKey512Bits).toString();
    console.log("encryptedUserPassword==>" + encryptedUserPassword);


    var encryptedSenderPassword = CryptoJS.AES.encrypt(senderPassword, encryptionKey512Bits).toString();
    console.log("encryptedSenderPassword==>" + encryptedSenderPassword);

    configObject["userPassword"] = encryptedUserPassword;
    configObject["senderPassword"] = encryptedSenderPassword;

    return configObject;
}

/**
 * Function to decrypt the Sensitive Data in configDetails
 */
function decryptSensitiveData(configObject) {

    var encryptedUserPassword = configObject["userPassword"];
    var encryptedSenderPassword = configObject["senderPassword"];

    var appUserName = sessionStorage.getItem("loggedInAppUserName");
    var appUserPassword = sessionStorage.getItem("loggedInAppUserPassword");
    var appUserSalt = sessionStorage.getItem("loggedInAppUserSalt");

    console.log("encryptedUserPassword==>" + encryptedUserPassword);
    console.log("encryptedSenderPassword==>" + encryptedSenderPassword);
    console.log("appUserPassword==>" + appUserPassword);
    console.log("appUserSalt==>" + appUserSalt);

    var encryptionKey512Bits = CryptoJS.PBKDF2(appUserPassword, appUserSalt, { keySize: 512/32 }).toString();
    console.log("encryptionKey512Bits==>" + encryptionKey512Bits);


    var decryptedUserPassword = CryptoJS.AES.decrypt(encryptedUserPassword, encryptionKey512Bits).toString(CryptoJS.enc.Utf8);
    console.log("decryptedUserPassword==>" + decryptedUserPassword);


    var decryptedSenderPassword = CryptoJS.AES.decrypt(encryptedSenderPassword, encryptionKey512Bits).toString(CryptoJS.enc.Utf8);
    console.log("decryptedSenderPassword==>" + decryptedSenderPassword);

    configObject["userPassword"] = decryptedUserPassword;
    configObject["senderPassword"] = decryptedSenderPassword;

    return configObject;
}

/**
 * Function to get LoggedInAppUserName if exists
 */
function getLoggedInAppUserName() {
    var loggedInAppUserName = sessionStorage.getItem("loggedInAppUserName");
    if(loggedInAppUserName != undefined) {
        return loggedInAppUserName;
    } else {
        return false;
    }
}

/**
 * Function to get appUserConfigListName if exists
 */
function getAppUserConfigListName() {
    var loggedInAppUserName = sessionStorage.getItem("loggedInAppUserName");
    if(loggedInAppUserName != undefined) {
        return "IAT__" + loggedInAppUserName + "__" + "configList";
    } else {
        return false;
    }
}

/**
 * Function to get appUserConfigListName if exists
 */
function getAppUserConfigDetailsName(configurationName) {
    var loggedInAppUserName = sessionStorage.getItem("loggedInAppUserName");
    if(loggedInAppUserName != undefined) {
        return "IAT__" + loggedInAppUserName + "__" + configurationName;
    } else {
        return false;
    }
}

/**
 * Function which calls localStorage related Init methods
 */
function localStorageRelatedInitFunctions(configurationName, configObject) {

    //encrypt the sensitive fields in configObject
    var encryptedConfigObj = encryptSensitiveData(configObject);

    //get login username in session
    var loggedInAppUserName = getLoggedInAppUserName();
    if(loggedInAppUserName == false) {
        return;
    }
    var appUserConfigListName = getAppUserConfigListName();
    var appUserConfigDetailsName = getAppUserConfigDetailsName(configurationName);

    // retrieve
    var appUserConfigListDB = localStorage.getItem(appUserConfigListName);
    var configListObjData = [];

    if(appUserConfigListDB != undefined) {
        console.log("appUserConfigListDB==>");
        console.log(appUserConfigListDB);
        var appUserConfigListDBJSON = JSON.parse(appUserConfigListDB);

        //check if configurationName exists in appUserConfigList if-not push element to it or else push it top
        if($.inArray(configurationName, appUserConfigListDBJSON) === -1) {
            appUserConfigListDBJSON.push(configurationName);
        } else {
            appUserConfigListDBJSON = $.grep(appUserConfigListDBJSON, function(value) {
                return value != configurationName;
            });
            appUserConfigListDBJSON.push(configurationName);
        }


        configListObjData = appUserConfigListDBJSON;
        console.log("appUserConfigListDBJSON==>");
        console.log(appUserConfigListDBJSON);
        console.log("appUserConfigListDB != undefined");

    } else {
        console.log("else::appUserConfigListDB==>");
        console.log(appUserConfigListDB);

        console.log("configObject==>");
        console.log(configObject);

        //var appUserConfigObject = JSON.parse(configObject);

        //var configurationName = configObject["configurationName"];

        configListObjData.push(configurationName);

        console.log("else::configListObjData");
        console.log(configListObjData);

    }

    // create Configuration List DB
    localStorageCreateFunction(appUserConfigListName, configListObjData);

    // create Configuration Details DB
    localStorageCreateFunction(appUserConfigDetailsName, encryptedConfigObj);

}

/**
 * Function which calls localStorage related Init methods
 */
function localStorageCreateFunction(localStorageName, dataObj) {
    localStorage.setItem(localStorageName, JSON.stringify(dataObj));
}


/**
 * document.ready() function
 */
$(function() {
    //$("form").submit(function(){
    //    alert("Submitted");
    //});

    var chooseCompanyIDJq = $("#chooseCompanyID");

    var configurationJq = $('#configuration');
    instantiateFormValidate("configuration");

    configurationJq.submit(function (e) {
            e.preventDefault();

            var formId = $(this).attr("id");
            //instantiateFormValidate(formId);
            //formValidation is false do not save the value
            if(!triggerFormValidation(formId)) {
                return false;
            }

            var configurationArray = $('#configuration').serializeArray();
            console.log('configurationArray==>'+JSON.stringify(configurationArray));

            var companyId = $('#companyId').val();
            var configurationName = $('#configurationName').val();
            var configurationArrayObject = nameValueToJSON(configurationArray);
            console.log('companyCred-------------------------------------==>'+JSON.stringify(configurationArrayObject));

            cookieVar[configurationName] = configurationArrayObject;



            var tempConfigurationObject = nameValueToJSON(configurationArray);

            if(!isActiveSessionExist()) {

                var tempConfigurationObjectString = JSON.stringify(tempConfigurationObject);
                //set the user input configuration in sessionStorage
                sessionStorage.setItem("tempConfigurationObject", tempConfigurationObjectString);

                $("#logInModalButton").trigger("click");
                console.log("after:logInModalButton click trigger");


            } else {

                localStorageRelatedInitFunctions(configurationName, tempConfigurationObject);
                loadConfigurationFromLocalStorage();

                $("#configDetailsSaveAlertDiv").attr("class", "alert alert-success text-center").html("You have saved the Company Configuration Details! &nbsp;Now you can choose it from above Saved Configuration to load it.");

            }


            //saveCookie();

            ////$(this).trigger('reset'); // reset form

            //loadConfiguration();



        }

    );

    chooseCompanyIDJq.on('change', function (e) {
        //var optionSelected = $("option:selected", this);
        var valueSelected = this.value;
        console.log('valueSelected==>'+valueSelected);

        var configurationJq = $('#configuration');
        clearDivsAfterConfigurationChanges();
        //if there are no saved configuration exit
        if(valueSelected == "#") {
            //configurationJq.trigger('reset');
            return;
        }

        //using cookie
        //console.log('value---------------------==>'+JSON.stringify(cookieVar[valueSelected]));

        //using localStorage
        //get login username in session
        var loggedInAppUserName = sessionStorage.getItem("loggedInAppUserName");
        var appUserConfigDetailsName = "IAT__" + loggedInAppUserName + "__" + valueSelected;

        // retrieve
        var appUserConfigDetailsDB = localStorage.getItem(appUserConfigDetailsName);

        if(appUserConfigDetailsDB != undefined) {
            console.log("appUserConfigDetailsDBJSON != undefined");

            console.log("appUserConfigDetailsDB==>");
            console.log(appUserConfigDetailsDB);
            var appUserConfigDetailsDBJSON = JSON.parse(appUserConfigDetailsDB);
            console.log("appUserConfigDetailsDBJSON==>");
            console.log(appUserConfigDetailsDBJSON);

            configurationJq.trigger("reset");
            var configObject = decryptSensitiveData(appUserConfigDetailsDBJSON);
            configurationJq.loadJSON(configObject);
            console.log("after configurationJq.loadJSON()::configObject==>");
            configurationJq.loadJSON(configObject);

        } else {
            //throw new Error("there is something wrong in localStorage:" + appUserConfigDetailsName + " retrieval");
        }

        //console.log('value---------------------==>' + JSON.stringify(cookieVar[valueSelected]));
        //configurationJq.trigger('reset');
        //configurationJq.loadJSON(cookieVar[valueSelected]);


        //getAllObjects once configuration changes
        getAllObjectsFlag = true;
        clearDivsAfterConfigurationChanges();
        $('#sessionId').val("");

        //$("#configDetailsSaveAlertDiv").html("");

    });

    chooseCompanyIDJq.keyup(function(e){
        if(e.keyCode == 46) {
            console.log('Delete Key Pressed');

            var valueSelected = this.value;
            console.log('valueSelected==>'+valueSelected);
            deleteCurrentConfig(valueSelected);
            //chooseCompanyIDJq.trigger( "change" );
        }else {
            //chooseCompanyIDJq.trigger( "change" );
        }
    });

    $("#deleteConfig").on("click", function() {
        var valueSelected = chooseCompanyIDJq.val();
        console.log('valueSelected==>'+valueSelected);
        console.log('delete on click');
        //deleteCurrentConfig(valueSelected);

        deleteCurrentConfigWithLocalStorage(valueSelected);

    });

    //for initial load-configuration using cookie
    if(docCookies.getItem('interactiveAPIToolCookie')){
        //loadConfiguration();
    }
    else{
        //set default values
    }

    //for initial load-configuration using localStorage
    var loggedInAppUserName = sessionStorage.getItem("loggedInAppUserName");
    if(loggedInAppUserName != undefined) {
        loadConfigurationFromLocalStorage();
    }



});