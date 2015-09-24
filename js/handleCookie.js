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

            saveCookie();

            //$(this).trigger('reset'); // reset form

            loadConfiguration();

            $("#configDetailsSaveAlertDiv").attr("class", "alert alert-success text-center").html("You have saved the Company Configuration Details! &nbsp;Now you can choose it from above Saved Configuration to load it.");

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

        console.log('value---------------------==>'+JSON.stringify(cookieVar[valueSelected]));
        $('#sessionId').val('');


        configurationJq.trigger('reset');
        configurationJq.loadJSON(cookieVar[valueSelected]);

        //$('#configuration').refresh();

        //getAllObjects once configuration changes
        getAllObjectsFlag = true;
        clearDivsAfterConfigurationChanges();

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
        deleteCurrentConfig(valueSelected);
    });

    if(docCookies.getItem('interactiveAPIToolCookie')){
        loadConfiguration();
    }
    else{
        //set default values
    }

});