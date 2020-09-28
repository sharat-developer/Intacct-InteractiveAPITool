// A pointer to understand the hashing and encryption logic in the project
// File: custom.js

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

        saveUserInfo(appUserRegisterObj);

        //auto login the registered user
        //save user-credential in sessionStorage
        saveSession(appUserRegisterJSON["appUserName"], enteredPassword, userSalt);

        $("#myModal").modal("hide");
        //$(".dropdown").html(loginButtonHTML(appUserKey));
        activeSessionRoutines(appUserKey);
    });
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


                var enteredAppUserPasswordHash = CryptoJS.SHA3(enteredAppUserPassword);
                console.log("enteredAppUserPasswordHash==>" + enteredAppUserPasswordHash);

                if(currentUserPasswordHash == enteredAppUserPasswordHash){
                    $("#loginMessageSpan").html("");
                    console.log("####################### User Sign In successful #######################");

                    var currentAppUserSalt = currentUserObj["appUserSalt"];
                    console.log("currentAppUserSalt==>" + currentAppUserSalt);

                    //save user-credential in sessionStorage
                    saveSession(enteredAppUserName, enteredAppUserPassword, currentAppUserSalt);

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


// File: handleStorage.js


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
 * function to create  and get EncryptionKey
 * @param appUserPassword
 * @param appUserSalt
 */
function createEncryptionKey(appUserPassword, appUserSalt) {
    return CryptoJS.PBKDF2(appUserPassword, appUserSalt, { keySize: 512/32 }).toString();
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

    ////storing of password removed for security concerns
    //configObject["userPassword"] = "";
    configObject["userPassword"] = encryptedUserPassword;

    //configObject["senderPassword"] = "";
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


    ////storing of password removed for security concerns
    //configObject["userPassword"] = "";
    configObject["userPassword"] = decryptedUserPassword;

    //configObject["senderPassword"] = "";
    configObject["senderPassword"] = decryptedSenderPassword;

    return configObject;
}
