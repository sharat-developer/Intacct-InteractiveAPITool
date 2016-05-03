/**
 * Created by shegde on 08-10-2014.
 */

/**
 * mod operation doesn't work for negative number fix
 * NOTE - not working as expected :(
 * @param n
 * @returns {number}
 */
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};


//{'name' :companyId, 'value' : 'INTACCT'} ==> {companyId : 'INTACCT'}
function nameValueToJSON(nameValueObject){
    var jsonObj ={};
    $.each(nameValueObject , function(k,v){
        jsonObj[v.name] = v.value;
    });
    return jsonObj;
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

        //console.log("chooseCompanyIDJq==>");
        //console.log(chooseCompanyIDJq.html());

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
 * function to create  and get EncryptionKey
 * @param appUserPassword
 * @param appUserSalt
 */
function createEncryptionKey(appUserPassword, appUserSalt) {
    return CryptoJS.PBKDF2(appUserPassword, appUserSalt, { keySize: 512/32 }).toString();
}

/**
 * function to get EncryptionKey from sessionStorage
 *
 */
function getLoggedInAppUserEncryptionKey() {
    var loggedInAppUserKey =  sessionStorage.getItem("loggedInAppUserKey");
    if(loggedInAppUserKey != undefined) {
        return loggedInAppUserKey;
    } else {
        return false;
    }
}

/**
 * Function to encrypt the Sensitive Data in configDetails
 */
function encryptSensitiveData(configObject) {

    var userPassword = configObject["userPassword"];
    var senderPassword = configObject["senderPassword"];


    //console.log("userPassword==>" + userPassword);
    //console.log("senderPassword==>" + senderPassword);
    //console.log("appUserPassword==>" + appUserPassword);
    //console.log("appUserPassword==>" + appUserPasswordEn);
    //console.log("appUserSalt==>" + appUserSalt);

    var encryptionKey512Bits = getLoggedInAppUserEncryptionKey();
    //console.log("encryptionKey512Bits==>" + encryptionKey512Bits);


    var encryptedUserPassword = CryptoJS.AES.encrypt(userPassword, encryptionKey512Bits).toString();
    //console.log("encryptedUserPassword==>" + encryptedUserPassword);


    var encryptedSenderPassword = CryptoJS.AES.encrypt(senderPassword, encryptionKey512Bits).toString();
    //console.log("encryptedSenderPassword==>" + encryptedSenderPassword);

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

    var encryptionKey512Bits = getLoggedInAppUserEncryptionKey();
    console.log("encryptionKey512Bits==>" + encryptionKey512Bits);


    var decryptedUserPassword = CryptoJS.AES.decrypt(encryptedUserPassword, encryptionKey512Bits).toString(CryptoJS.enc.Utf8);
    //console.log("decryptedUserPassword==>" + decryptedUserPassword);


    var decryptedSenderPassword = CryptoJS.AES.decrypt(encryptedSenderPassword, encryptionKey512Bits).toString(CryptoJS.enc.Utf8);
    //console.log("decryptedSenderPassword==>" + decryptedSenderPassword);

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
    var loggedInAppUserName = getLoggedInAppUserName();
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
    var loggedInAppUserName = getLoggedInAppUserName();
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
 *  Function to removeItems from sessionStorage
 */
function removeSessionItems() {
    sessionStorage.removeItem("loggedInAppUserName");
    sessionStorage.removeItem("loggedInAppUserKey");
}

/**
 * Function to delete sessionStorage variables related to this App
 */
function clearAppSessionStorage() {
    //removeItems from sessionStorage to kill the session
    removeSessionItems();

    window.memoryStorage = {"loggedOut" : true};

    localStorage.setItem('endSession', JSON.stringify(window.memoryStorage));
    localStorage.removeItem('endSession');
}

/**
 * Function to convert raw string to Base64 encoded string
 */
function getBase64EncodedString(rawStr) {
    //var wordArray = CryptoJS.enc.Utf8.parse(rawStr);
    //var base64 = CryptoJS.enc.Base64.stringify(wordArray);
    var words = CryptoJS.enc.Utf8.parse(rawStr); // WordArray object
    var base64 = CryptoJS.enc.Base64.stringify(words); // string: 'SGVsbG8gd29ybGQ='
    //console.log('Base64EncodedString==>', base64);
    return base64;
}

/**
 * Function to convert Base64 encoded string to raw string
 */
function getBase64DecodedString(encodedStr) {
    //var parsedWordArray = CryptoJS.enc.Base64.parse(encodedStr);
    //var parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
    var words = CryptoJS.enc.Base64.parse(encodedStr);
    var parsedStr = CryptoJS.enc.Utf8.stringify(words); // 'Hello world'
    //console.log("Base64DecodedString:",parsedStr);
    return parsedStr;
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
 * Function which calls localStorage related Init methods
 */
function localStorageCreateFunction(localStorageName, dataObj) {
    localStorage.setItem(localStorageName, JSON.stringify(dataObj));
}


/**
 *  Function to save loggedInAppUserName, loggedInAppUserPassword, loggedInAppUserSalt in sessionStorage
 * @param loggedInAppUserName
 * @param loggedInAppUserPassword
 * @param loggedInAppUserSalt
 */
function saveSession(loggedInAppUserName, loggedInAppUserPassword, loggedInAppUserSalt) {
    //store login username in session
    sessionStorage.setItem("loggedInAppUserName", loggedInAppUserName);
    //sessionStorage.setItem("loggedInAppUserPassword", enteredAppUserPassword);

    var loggedInAppUserEncryptionKey = createEncryptionKey(loggedInAppUserPassword, loggedInAppUserSalt);
    sessionStorage.setItem("loggedInAppUserKey", loggedInAppUserEncryptionKey);

    //save session in memoryStorage also for cross-tab authentication
    window.memoryStorage = sessionStorage;
    localStorage.setItem('sessionStorage', JSON.stringify(window.memoryStorage));
    localStorage.removeItem('sessionStorage');
}

/**
 *  Function to save loggedInAppUserName, loggedInAppUserKey in sessionStorage
 * @param loggedInAppUserName
 * @param loggedInAppUserKey
 */
function savePasswordEncodedSession(loggedInAppUserName, loggedInAppUserKey) {
    //store login username in session
    sessionStorage.setItem("loggedInAppUserName", loggedInAppUserName);
    sessionStorage.setItem("loggedInAppUserKey", loggedInAppUserKey);
    
    //save session in memoryStorage also for cross-tab authentication
    window.memoryStorage = sessionStorage;
    localStorage.setItem('sessionStorage', JSON.stringify(window.memoryStorage));
    localStorage.removeItem('sessionStorage');
}

/**
 *  Function to initiate loadConfiguration if session exists
 */
function setSessionOnPageLoad() {
    //for initial load-configuration using sessionStorage
    var loggedInAppUserName = getLoggedInAppUserName();
    console.log("loggedInAppUserName==>");
    console.log(loggedInAppUserName);

    if(loggedInAppUserName) {
        console.log("user session already exist in sessionStorage==>");
        console.log(sessionStorage);

        window.memoryStorage = sessionStorage;
        console.log("window.memoryStorage==>");
        console.log(window.memoryStorage);
        activeSessionRoutines(loggedInAppUserName);
    } else {
        console.log("user session doesn't exist in sessionStorage==>");
        console.log(sessionStorage);
        console.log("window.memoryStorage==>");
        console.log(window.memoryStorage);

        var sessionInMemory = window.memoryStorage;
        console.log("sessionInMemory==>");
        console.log(sessionInMemory);

        if(sessionInMemory["loggedInAppUserName"] != undefined) {
            savePasswordEncodedSession(sessionInMemory["loggedInAppUserName"], sessionInMemory["loggedInAppUserKey"]);
            activeSessionRoutines(sessionInMemory["loggedInAppUserName"]);
        }
    }
}
/**
 *  Function to check if object 'o' is empty
 * @param o
 * @returns {boolean}
 */
function isEmpty(o) {
    for (var i in o) {
        return false;
    }
    return true;
}

/**
 * function to get Current AppUserConfigDetailsName from localStorage
 */
function getCurrentAppUserConfigDetailsName() {
    var configurationName = $('#configurationName').val();
    return getAppUserConfigDetailsName(configurationName);
}

/**
 * function to get updated RequestHistory circular array
 * @param ddtVersionId
 * @param requestHistory
 * @param payload
 */
function getUpdatedRequestHistory(ddtVersionId, requestHistory, payload) {

    var dtdHistory = requestHistory[ddtVersionId];
    var headIndex = dtdHistory["headIndex"];
    var requests = dtdHistory["requests"];
    console.log("headIndex==>");
    console.log(headIndex);
    console.log("requests==>");
    console.log(requests);

    if(headIndex == -1){
        requestHistory[ddtVersionId] = {
            "headIndex" : 0, "requests" : [payload]
        };
    } else {
        headIndex = (headIndex + 1) % REQUEST_HISTORY_LIMIT;
        console.log("new:headIndex==>");
        console.log(headIndex);
        requests[headIndex] = payload;
        console.log("new:requests==>");
        console.log(requests);
        requestHistory[ddtVersionId] = {
            "headIndex" : headIndex, "requests" : requests
        };
    }

    return requestHistory;
}

/**
 *
 * @param storageName
 * @param key
 * @param value
 */
function updateValueOfKeyInLocalStorage(storageName, key, value) {
    // retrieve
    var localStorageDB = localStorage.getItem(storageName);
    if(localStorageDB != undefined) {
        var localStorageDBJSON = JSON.parse(localStorageDB);
        console.log("localStorageDBJSON==>");
        console.log(localStorageDBJSON);
        localStorageDBJSON[key] = value;

        var localStorageDBJSONString = JSON.stringify(localStorageDBJSON);
        //set the localStorage with new updated value
        localStorage.setItem(storageName, localStorageDBJSONString);
        return localStorageDBJSON;
    }
}

/**
 * function to getFirstRequestFromAPIRequestHistory
 * @param apiReqHist
 * @param headIndex
 * @param currentIndex
 * @returns {*}
 */
function getPreviousRequestFromAPIRequestHistory(apiReqHist, headIndex, currentIndex) {
    console.log("apiReqHist==>");
    console.log(apiReqHist);
    console.log("headIndex==>");
    console.log(headIndex);
    console.log("currentIndex==>");
    console.log(currentIndex);
    var previousIndex =  (((currentIndex - 1) % REQUEST_HISTORY_LIMIT)+ REQUEST_HISTORY_LIMIT) % REQUEST_HISTORY_LIMIT ;
    console.log("previousIndex==>");
    console.log(previousIndex);
    if(apiReqHist["requests"][previousIndex]) {
        return previousIndex;
    }
    return false;
}

/**
 * function to getNextRequestFromAPIRequestHistory
 * @param apiReqHist
 * @param headIndex
 * @param currentIndex
 * @returns {*}
 */
function getNextRequestFromAPIRequestHistory(apiReqHist, headIndex, currentIndex) {
    console.log("apiReqHist==>");
    console.log(apiReqHist);
    console.log("headIndex==>");
    console.log(headIndex);
    console.log("currentIndex==>");
    console.log(currentIndex);
    var nextIndex =  (currentIndex + 1) % REQUEST_HISTORY_LIMIT ;
    if(apiReqHist["requests"][nextIndex]) {
        return nextIndex;
    }
    return false;
}

/**
 * function to get Last RequestHistory
 * @param apiVersion
 */
function getNextRequestFromRequestHistory(apiVersion) {
    var apiVersionId = convertDotToUnderScore(apiVersion);
    var requestHistory = getRequestHistoryFromDB();
    if(requestHistory) {
        var apiReqHist = requestHistory[apiVersionId];
        var headIndex = apiReqHist["headIndex"];
        var currentIndex = getCurrentRequestIndex(apiVersionId);
        var nextIndex = getNextRequestFromAPIRequestHistory(apiReqHist, headIndex, currentIndex);
        setCurrentRequestIndex(nextIndex, apiVersionId);
        return apiReqHist["requests"][nextIndex];
    }
    return false;
}

/**
 * function to get Last RequestHistory
 * @param apiVersion
 */
function getPreviousRequestFromRequestHistory(apiVersion) {
    var apiVersionId = convertDotToUnderScore(apiVersion);
    var requestHistory = getRequestHistoryFromDB();
    if(requestHistory) {
        var apiReqHist = requestHistory[apiVersionId];
        var headIndex = apiReqHist["headIndex"];
        var currentIndex = getCurrentRequestIndex(apiVersionId);
        var previousIndex = getPreviousRequestFromAPIRequestHistory(apiReqHist, headIndex, currentIndex);
        setCurrentRequestIndex(previousIndex, apiVersionId);
        return apiReqHist["requests"][previousIndex];
    }
    return false;
}

/**
 * function to getLastRequestFromAPIRequestHistory
 * @param apiReqHist
 * @param headIndex
 * @returns {*}
 */
function getLastRequestFromAPIRequestHistory(apiReqHist, headIndex) {
    console.log("apiReqHist==>");
    console.log(apiReqHist);
    console.log("headIndex==>");
    console.log(headIndex);
    if(apiReqHist["requests"][headIndex]) {
        return headIndex;
    } else { //not likely
        return false;   
    }
}

/**
 * function to getFirstRequestFromAPIRequestHistory
 * @param apiReqHist
 * @param headIndex
 * @returns {*}
 */
function getFirstRequestFromAPIRequestHistory(apiReqHist, headIndex) {
    console.log("apiReqHist==>");
    console.log(apiReqHist);
    console.log("headIndex==>");
    console.log(headIndex);
    for(var i = 1; i <= REQUEST_HISTORY_LIMIT; i++) {
        console.log("i==>");
        console.log(i);
        var firstIndex = ((headIndex + REQUEST_HISTORY_LIMIT + i) % REQUEST_HISTORY_LIMIT);
        console.log("firstIndex==>");
        console.log(firstIndex);
        if(apiReqHist["requests"][firstIndex]) {
            return firstIndex;
        }
    }
    return false;
}


//todo disable the relevant navigation buttons http://stackoverflow.com/questions/23385741/how-to-disable-anchor-tag-in-jquery

/**
 * function to get Last RequestHistory
 * @param apiVersion
 */
function getLastRequestFromRequestHistory(apiVersion) {
    var apiVersionId = convertDotToUnderScore(apiVersion);
    var requestHistory = getRequestHistoryFromDB();
    if(requestHistory) {
        var apiReqHist = requestHistory[apiVersionId];
        var headIndex = apiReqHist["headIndex"];
        var lastIndex = getLastRequestFromAPIRequestHistory(apiReqHist, headIndex);
        setCurrentRequestIndex(lastIndex, apiVersionId);
        return apiReqHist["requests"][lastIndex];
    }
    return false;
}

/**
 * function to get First RequestHistory
 * @param apiVersion
 */
function getFirstRequestFromRequestHistory(apiVersion) {
    var apiVersionId = convertDotToUnderScore(apiVersion);
    var requestHistory = getRequestHistoryFromDB();
    if(requestHistory) {
        var apiReqHist = requestHistory[apiVersionId];
        var headIndex = apiReqHist["headIndex"];
        var firstIndex = getFirstRequestFromAPIRequestHistory(apiReqHist, headIndex);
        setCurrentRequestIndex(firstIndex, apiVersionId);
        return apiReqHist["requests"][firstIndex];
    }
    return false;
}

/**
 * function to get the Request History
 * @returns {boolean}
 */
function getRequestHistoryFromDB() {

    var appUserConfigDetailsName =  getCurrentAppUserConfigDetailsName();
    // retrieve
    var appUserConfigDetailsDB = localStorage.getItem(appUserConfigDetailsName);

    if(appUserConfigDetailsDB != undefined) {
        console.log("appUserConfigDetailsDBJSON != undefined");

        console.log("appUserConfigDetailsDB==>");
        console.log(appUserConfigDetailsDB);
        var appUserConfigDetailsDBJSON = JSON.parse(appUserConfigDetailsDB);
        console.log("appUserConfigDetailsDBJSON==>");
        console.log(appUserConfigDetailsDBJSON);

        var requestHistory = appUserConfigDetailsDBJSON["requestHistory"];
        return requestHistory;
    } else {
        return false;
    }
}

/**
 * function to getHeadIndexFromRequestHistory
 * @param reqHist
 * @param apiVersion
 * @returns {*}
 */
function getHeadIndexFromRequestHistory(reqHist, apiVersion) {
    var apiVersionId = convertDotToUnderScore(apiVersion);
    return reqHist[apiVersionId]["headIndex"];
}

/**
 * function to saveAPIPayloadInRequestHistory
 * @param payload
 * @param apiDTDVersion
 */
function saveAPIPayloadInRequestHistory(payload, apiDTDVersion) {
    console.log("payload==>");
    console.log(payload);
    console.log("apiDTDVersion==>");
    console.log(apiDTDVersion);

    var appUserConfigDetailsName =  getCurrentAppUserConfigDetailsName();

    // retrieve
    var appUserConfigDetailsDB = localStorage.getItem(appUserConfigDetailsName);

    if(appUserConfigDetailsDB != undefined) {
        console.log("appUserConfigDetailsDBJSON != undefined");

        console.log("appUserConfigDetailsDB==>");
        console.log(appUserConfigDetailsDB);
        var appUserConfigDetailsDBJSON = JSON.parse(appUserConfigDetailsDB);
        console.log("appUserConfigDetailsDBJSON==>");
        console.log(appUserConfigDetailsDBJSON);

        var requestHistory = appUserConfigDetailsDBJSON["requestHistory"];
        var ddtVersionId =  convertDotToUnderScore(apiDTDVersion);

        var newRequestHistory = getUpdatedRequestHistory(ddtVersionId, requestHistory, payload);

        console.log("newRequestHistory==>");
        console.log(newRequestHistory);

        // update the newRequestHistory into 'appUserConfigDetailsName' localStorage
        updateValueOfKeyInLocalStorage(appUserConfigDetailsName, "requestHistory", newRequestHistory);
        
        //update the currentRequest_[ddtVersionId] to have the headIndex in it so that requestHistory navigation will run smooth
        var headIndex = getHeadIndexFromRequestHistory(newRequestHistory, apiDTDVersion);
        setCurrentRequestIndex(headIndex, ddtVersionId);

    } else {
        //throw new Error("there is something wrong in localStorage:" + appUserConfigDetailsName + " retrieval");
    }

}

/**
 * document.ready() function
 */
$(function() {
    //$("form").submit(function(){
    //    alert("Submitted");
    //});

    /* Sharing memoryStorage between tabs for secure multi-tab authentication since sessionStorage will not support multi-tab */
    /* multi-tab authentication start */
    window.memoryStorage = {};

    if (isEmpty(memoryStorage)) {
        // Ask other tabs for memoryStorage
        localStorage.setItem('getSessionStorage', Date.now());
    }

    window.addEventListener('storage', function (event) {

        //console.log('storage event', event);

        if (event.key == 'getSessionStorage') {
            // Some tab asked for the memoryStorage -> send it

            console.log("memoryStorage==>");
            console.log(window.memoryStorage);

            localStorage.setItem('sessionStorage', JSON.stringify(window.memoryStorage));
            localStorage.removeItem('sessionStorage');

        } else if (event.key == 'sessionStorage' ) {//&& isEmpty(memoryStorage)
            // sessionStorage is empty -> fill it

            var data = JSON.parse(event.newValue),
                value;

            for (key in data) {
                window.memoryStorage[key] = data[key];
            }

            setSessionOnPageLoad();
        } else if (event.key == 'endSession') {//
            // session is logged-out remove session variables
            //clearAppSessionStorage();
            removeSessionItems();

            $("#logOutButton").trigger("click");
        }
    });

    window.addEventListener('load', function () {
        setSessionOnPageLoad();
    });

    /* multi-tab authentication end */

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

            var tempConfigurationObject = nameValueToJSON(configurationArray);

            if(!isActiveSessionExist()) {

                var tempConfigurationObjectString = JSON.stringify(tempConfigurationObject);
                //set the user input configuration in sessionStorage
                sessionStorage.setItem("tempConfigurationObject", tempConfigurationObjectString);

                //$("#logInModalButton").trigger("click");
                $("#loginDisplaySpan").trigger("click");
                console.log("after:logInModalButton click trigger");


            } else {

                //initializing requestHistory
                var requestHistory = {
                    "3_0":{ "headIndex" : -1, "requests" : []
                    },
                    "2_1":{ "headIndex" : -1, "requests" : []
                    }
                };
                //store the request-history
                tempConfigurationObject["requestHistory"] = requestHistory;

                console.log("requestHistory==>");
                console.log(requestHistory);

                localStorageRelatedInitFunctions(configurationName, tempConfigurationObject);
                loadConfigurationFromLocalStorage();

                $("#configDetailsSaveAlertDiv").attr("class", "alert alert-success text-center").html("You have saved the Company Configuration Details! &nbsp;Now you can choose it from above Saved Configuration to load it.");

            }

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


        //using localStorage
        //get login username in session
        var loggedInAppUserName = getLoggedInAppUserName();
        var appUserConfigDetailsName = "IAT__" + loggedInAppUserName + "__" + valueSelected;

        // retrieve
        var appUserConfigDetailsDB = localStorage.getItem(appUserConfigDetailsName);

        if(appUserConfigDetailsDB != undefined) {
            console.log("appUserConfigDetailsDBJSON != undefined");

            console.log("appUserConfigDetailsDB==>");
            console.log(appUserConfigDetailsDB);
            var appUserConfigDetailsDBJSON = JSON.parse(appUserConfigDetailsDB);
            //console.log("appUserConfigDetailsDBJSON==>");
            //console.log(appUserConfigDetailsDBJSON);

            configurationJq.trigger("reset");
            var configObject = decryptSensitiveData(appUserConfigDetailsDBJSON);
            configurationJq.loadJSON(configObject);
            console.log("after configurationJq.loadJSON()::configObject==>");
            configurationJq.loadJSON(configObject);

        } else {
            //throw new Error("there is something wrong in localStorage:" + appUserConfigDetailsName + " retrieval");
        }


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



    //initiate loadConfiguration if session exists
    setSessionOnPageLoad();



});