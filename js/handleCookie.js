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


$(function() {

    if(docCookies.getItem('interactiveAPIToolCookie')){
        setvalues();
    }
    else{
        //set default values
    }

    var configurationJq = $('#configuration');

    configurationJq.submit(function (e) {
            e.preventDefault();

            var configurationArray = $('#configuration').serializeArray();
            //console.log('configurationArray==>'+JSON.stringify(configurationArray));

            var companyId = $('#companyId').val();
            console.log('companyCred-------------------------------------==>'+nameValueToJSON(configurationArray));

            cookieVar[companyId] = nameValueToJSON(configurationArray);


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

            $(this).trigger('reset'); // reset form
            setvalues();

        }

    );

    function setvalues()
    {

        var configurationJq = $('#configuration');
        var chooseCompanyIDJq = $("#chooseCompanyID");
        var cookieVarString =docCookies.getItem('interactiveAPIToolCookie');

        //console.log('cookieVarString--------------------==>'+cookieVarString);

        cookieVar = $.parseJSON(cookieVarString);

        chooseCompanyIDJq.html('');
        //console.log('cookieLength==>'+cookieVar.length);

        chooseCompanyIDJq.on('change', function (e) {
            //var optionSelected = $("option:selected", this);
            var valueSelected = this.value;
            console.log('valueSelected==>'+valueSelected);
            //console.log('value---------------------==>'+JSON.stringify(cookieVar[valueSelected]));
            $('#sessionId').val('');
            configurationJq.trigger('reset');
            configurationJq.loadJSON(cookieVar[valueSelected]);

            //$('#configuration').refresh();

            //getAllObjects once configuration changes
            getAllObjectsFlag = true;

            $( "#selectMethodDiv" ).html( "" );
            $("#selectFieldDiv").html("");
            $("#putValueFieldDiv").html("");
            $("#createXMLShowDiv").html("");
            $("#keyOrQueryDiv").html("");
            $("#returnFormatDiv").html("");
            $("#docParIdDiv").html("");
            $("#executeXMLDiv").html("");
            $("#addQueryBtn").hide();

        });

        //console.log('cookieVar.length==>'+Object.keys(cookieVar).length);

        $.each(cookieVar, function(key, value) {
            chooseCompanyIDJq.append("<option value='"+key+"' selected = 'true' >"+key+"</option>");
        });

        chooseCompanyIDJq.trigger( "change" );
    }
});