//var XMLHttpRequest = require("xhr-browserify").XMLHttpRequest;

//Called by change function
function putParameter(parameter, value) { //parameter

    var myCountry = getCountry();


    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/put/'; //TargetInteputrestRate';
    url = url.concat(myCountry);


    let myBody = {
        "PARAMETER": "TargetInterestRate",
        "VALUE": "0.04"
    };

    myBody.PARAMETER = parameter;
    myBody.VALUE = value;

    console.log(url);
    console.log(myBody);
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(myBody));

}

function putCompanyParameter(parameter, value) { //parameter

    var myCountry = getCountry();
    var myCompany = document.getElementById("selectedCompany").innerHTML;

    var isChecked = document.getElementById("checkChangeAll").checked;

    console.log(isChecked);

    if(isChecked) {
        myCompany = "*"
        console.log('Checkbox is checked')
    }


    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/putCompanyParameter/'; //TargetInteputrestRate';
    url = url.concat(myCountry);
    url = url.concat('?myCompany=');
    url = url.concat(myCompany);

    console.log(url);
    // url = url.concat('?parameter=');
    // url = url.concat(value);


    let myBody = {
        "PARAMETER": "TargetInterestRate",
        "VALUE": "0.04"
    };

    myBody.PARAMETER = parameter;
    myBody.VALUE = value;

    console.log(url);
    console.log(myBody);
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(myBody));

}


function setWageConst() {

    var myValue = document.getElementById("WageConst").value/100;
    
    putCompanyParameter('WAGE_CONST', myValue);

}

function setWageChange() {

    var myValue = document.getElementById("WageCh").value/100;
    
    putCompanyParameter('WAGE_CH', myValue);

}

function setReinvest() {

    var myValue = document.getElementById("Reinvest").value/100;
    
    putCompanyParameter('PBR', myValue);

}

function populateParameters(initialUpdate) {

    myCompany = document.getElementById("selectedCompany").innerHTML;

    getCompanyParameters(myCompany, initialUpdate, populateCallback);
}

function populateCallback(companyParameters, initialUpdate) {

    var JSONData = JSON.parse(companyParameters).data;

    var wage_const = JSONData[0].WAGE_CONST;
    var pbr = JSONData[0].PBR;
    var capacity = JSONData[0].CAPACITY;
    var wage_ch = JSONData[0].WAGE_CH;
    var production = JSONData[0].PRODUCTION;
    var utilization = production/capacity;
    utilization = utilization.toFixed(3)*100;


    if(initialUpdate){
        document.getElementById("Reinvest").value = pbr*100;
        document.getElementById("WageConst").value = wage_const*100;
        document.getElementById("WageCh").value = wage_ch*100;

    }
    document.getElementById("Capacity").value = capacity;
    document.getElementById("Utilization").value = utilization;


}

function companyChange() {


    myCompany = document.getElementById("companySelect").value;
    if (myCompany == '--Select Company--' || myCountry == "") {

        myCompany = 'bempa_CO'
    }

    document.getElementById("selectedCompany").innerHTML = myCompany;

    refreshCompanyData('COMPANY_TABLE', myMoneyChart1,myMoneyChart2, updateCompanyData);



}

function countryChange() {

    var myCountry = getCountry();
    document.getElementById("countryText").innerHTML = myCountry;

    refreshCompanyData('COMPANY_TABLE', myMoneyChart1,myMoneyChart2, updateCompanyData);

}

function changeWageConstant() {
    var set_spendwill = document.getElementById("spendwillInput").value / 100;
    putParameter('AverageSpendwill', set_spendwill);

}


var getParameter = function (parameter, mycallback) {

    var myCountry = getCountry();

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/read/';
    url = url.concat(myCountry);
    url = url.concat('?parameterID=');
    url = url.concat(parameter);


    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        //console.log(xhr.readyState);
        if (xhr.readyState == 4) { //XMLHttpRequest.DONE
            var response = xhr.responseText;
            console.log("response: " + response); //Correctly prints JSON content to console

            // call it here
            mycallback(response);
        }
    }
    xhr.send(null);

};

var getCompanyParameters = function (companyName, initialUpdate, mycallback) {

    var myCountry = getCountry();

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/getCompany/';
    url = url.concat(myCountry);
    url = url.concat('?myCompany=');
    url = url.concat(companyName);

    //console.log(url);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        //console.log(xhr.readyState);
        if (xhr.readyState == 4) { //XMLHttpRequest.DONE
            var response = xhr.responseText;
            //console.log("response: " + response); //Correctly prints JSON content to console

            // call it here
            mycallback(response, initialUpdate);
        }
    }
    xhr.send(null);

};

var getCountry = function () {

    myCountry = document.getElementById("CountryCombo").value;
    if (myCountry == '--Select Country--' || myCountry == "") {

        myCountry = 'Bennyland'
    }

    return myCountry;


};

var getDatabaseLink = function () {

    myCountry = document.getElementById("CountryCombo").value;
    if (myCountry == '--Select Country--' || myCountry == "") {

        myCountry = 'Bennyland'
    }

    var myLink = './myDB/' + myCountry + '.db';
    return myLink;


};




function addMoreCompanyData(table, chart1, chart2, mycallback) {

    timeStamp = chart1.data.labels[chart1.data.labels.length - 1];
    //console.log(timeStamp);

    getCompanyData(chart1, chart2, timeStamp, mycallback, 0);

}

function refreshCompanyData(table, chart1, chart2, mycallback) {

    timeStamp = 0; //myGDPChart.data.labels[myGDPChart.data.labels.length - 1];

    getCompanyData(chart1, chart2, timeStamp, mycallback, 1);

}


function getCompanyData(chart1, chart2, timeStamp, mycallback, resetChart) {

    //var lastTimestamp = 0;
    var myCountry = getCountry();
    //console.log(chart.data.datasets);
    //console.log(lastTimestamp);
    //timeStamp = 0;

    myCompany = document.getElementById("selectedCompany").innerHTML;

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/companytable/update/';
    url = url.concat(myCountry);
    url = url.concat('?timestamp=');
    url = url.concat(timeStamp);
    url = url.concat('&myCompany=' + myCompany)

    //console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        //console.log(xhr.readyState);
        if (xhr.readyState == 4) { //XMLHttpRequest.DONE
            var response = xhr.responseText;
            //console.log("response: " + response); //Correctly prints JSON content to console

            // call it here
            mycallback(chart1, chart2, response, resetChart);
        }
    }
    xhr.send(null);


}

function updateCompanyData(chart1, chart2, newData, resetChart) {

    //Parsing API-data
    var JSONData = JSON.parse(newData).data;
    //console.log(JSONData);

    if (resetChart == 0) {
        var timeData = chart1.data.labels;
        var capacity = chart1.data.datasets[0].data;
        var production = chart1.data.datasets[1].data;
    }
    else {

        var timeData = [];
        var capacity = [];
        var production = [];

    }

    //console.log(consumerCapital.length);
    //console.log(companyCapital.length);


    for (var i in JSONData) {
        timeData.push(JSONData[i].TIME_STAMP);
        capacity.push(JSONData[i].CAPACITY);
        production.push(JSONData[i].PRODUCTION);
    };

    let Utilization = new Array(timeData.length);

    for(i=0; i<timeData.length; i++) {
        if(capacity[i] == 0) {
            Utilization[i] = 0;
        //Unemployment.push((no_consumers - employed[i])/no_consumers);
        }
        else{
            Utilization[i]=production[i]/capacity[i];
        }
    }
    //console.log(Utilization);

    chart1.data.labels = timeData;
    chart1.data.datasets[0].data = capacity;
    chart1.data.datasets[1].data = production;
    chart1.update();

    chart2.data.labels = timeData;
    chart2.data.datasets[0].data = Utilization;
    chart2.update();

}




initiateCompanyTable1 = function (myChart) {


    var chartData = {
        labels: [0],
        datasets: [
            {
                label: "Capacity",
                borderColor: "black",
                pointRadius: 0,
                data: [0]

            },
            {
                label: "Production",
                borderColor: "blue",
                pointRadius: 0,
                data: [0]

            }
        ]
    };

    myChart.data = chartData;

};

initiateCompanyTable2 = function (myChart) {


    var chartData = {
        labels: [0],
        datasets: [
            {
                label: "Utilization",
                borderColor: "blue",
                pointRadius: 0,
                data: [0]

            }
        ]
    };

    myChart.data = chartData;

};





/*
* POPULATING stuff
*/

function add_option(select_id, text) {

    var select = document.getElementById(select_id);
    select.options[select.options.length] = new Option(text);
}

function clear_combo(select_id) {

    var select = document.getElementById(select_id);
    select.options.length = 0;
}

function load_combo(select_id, option_array) {

    for (var i = 0; i < option_array.length; i++) {
        add_option(select_id, option_array[i]);
    }
}

populateParameters(1);




countryArray = ['Bennyland', 'Saraland', 'Otherland'];
add_option('CountryCombo', '--Select Country--');
load_combo('CountryCombo', countryArray);

companyArray = ['johansson_och_johansson', 'limpan_AB', 'bempa_AB', 'bempa_CO', 'benny_enterprises', 'benny_inc'];
add_option('companySelect', '--Select Company--');
load_combo('companySelect', companyArray);
document.getElementById("CountryCombo").addEventListener("change", countryChange);
document.getElementById("companySelect").addEventListener("change", companyChange);
document.getElementById("companySelect").addEventListener("change", populateParameters);
document.getElementById("setWageConstButton").addEventListener("click", setWageConst);
document.getElementById("setWageChangeButton").addEventListener("click", setWageChange);
document.getElementById("setReinvestButton").addEventListener("click", setReinvest);

//document.getElementById("SetFixedRateButton").addEventListener("click", changeInterestRate2);
//document.getElementById('CountryCombo').onclick = print_combo();

/*
* GENERATING CHARTS
*/

Chart.defaults.global.elements.line.borderWidth = 1;
Chart.defaults.global.elements.point.pointRadius = 0;
Chart.defaults.global.elements.line.fill = false;

/*
* INITIATING COMPANY CHART
*/
var ctxMoney1 = document.getElementById('myMoneyChart1').getContext("2d");
var ctxMoney2 = document.getElementById('myMoneyChart2').getContext("2d");

var myMoneyChart1 = new Chart(ctxMoney1, {
    type: 'line',
    data: {
    },
    options: {
        legend: {
            position: "top"
        },
        animation: {
            duration: 0
        },
        title: {
            display: true,
            text: 'Company development'
        }
    }
});

var myMoneyChart2 = new Chart(ctxMoney2, {
    type: 'line',
    data: {
    },
    options: {
        legend: {
            position: "top"
        },
        animation: {
            duration: 0
        },
        title: {
            display: true,
            text: 'Company development2'
        }
    }
});


initiateCompanyTable1(myMoneyChart1);
initiateCompanyTable2(myMoneyChart2);




/*
* POPULATING CHARTS
*/
//refreshMoneyData('MONEY_DATA', myMoneyChart, updateMoneyData);
//refreshGDPData('TIME_DATA', myGDPChart, myDIVChart, updateGDPData);

/*
* REGULAR UPDATE OF CHARTS
*/

setInterval(function () {
    addMoreCompanyData('COMPANY_TABLE', myMoneyChart1, myMoneyChart2, updateCompanyData);
    populateParameters(0);

}, 2000);


