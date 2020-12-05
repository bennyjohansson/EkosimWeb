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

function changeInterestRate() {
    var targetInterestRate = document.getElementById("interestRateInput").value / 100;
    putParameter('InterestRateMethod', 2)
    putParameter('TargetInterestRate', targetInterestRate);

    // getParameter('TargetInterestRate', function(result) {
    //     var JSONData = JSON.parse(result).data;
    //     console.log(JSONData.VALUE);
    //     document.getElementById("interestRateInput").value = JSONData.VALUE*100;
    //     }
    // );

}

function changeInterestRate2() {
    var targetInterestRate = document.getElementById("FixedRate").value / 100;
    console.log("Testing change interest rate 2")
    putParameter('InterestRateMethod', 2)
    putParameter('TargetInterestRate', targetInterestRate);
    console.log("Testing change interest rate 2")
    // getParameter('TargetInterestRate', function(result) {
    //     var JSONData = JSON.parse(result).data;
    //     console.log(JSONData.VALUE);
    //     document.getElementById("interestRateInput").value = JSONData.VALUE*100;
    //     }
    // );

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

function populateParameters() {

    myCompany = document.getElementById("selectedCompany").innerHTML;

    getCompanyParameters(myCompany, populateCallback);



}

function populateCallback(companyParameters) {

    var JSONData = JSON.parse(companyParameters).data;

    var wage_const = JSONData[0].WAGE_CONST;
    var pbr = JSONData[0].PBR;
    var capacity = JSONData[0].CAPACITY;
    var wage_ch = JSONData[0].WAGE_CH;

    console.log(JSONData[0]);

    console.log(wage_const);
    console.log(pbr);
    console.log(capacity);
    console.log(wage_ch);


    document.getElementById("Reinvest").value = pbr*100;
    document.getElementById("WageConst").value = wage_const*100;
    document.getElementById("Capacity").value = capacity;
    document.getElementById("WageCh").value = wage_ch*100;


    // document.getElementById("WageConst").value = JSONData[0].WAGE_CONST;
    // document.getElementById("Reinvest").value = JSONData[0].PBR;
    // document.getElementById("Capacity").value = JSONData[0].CAPACITY;
    // document.getElementById("WageCh").value = JSONData[0].WAGE_CH;

}

function companyChange() {


    myCompany = document.getElementById("companySelect").value;
    if (myCompany == '--Select Company--' || myCountry == "") {

        myCompany = 'bempa_CO'
    }

    document.getElementById("selectedCompany").innerHTML = myCompany;


}

function countryChange() {

    //var myCountry = document.getElementById("CountryCombo").value;
    //Testing
    var myCountry = getCountry();
    document.getElementById("countryText").innerHTML = myCountry;

    refreshCompanyData('COMPANY_TABLE', myMoneyChart, updateCompanyData);
    //refreshGDPData('TIME_DATA', myGDPChart, myDIVChart, updateGDPData);



}

function changeSpendwill() {
    var set_spendwill = document.getElementById("spendwillInput").value / 100;
    putParameter('AverageSpendwill', set_spendwill);

    // getParameter('AverageSpendwill', function(result) {
    //     var JSONData = JSON.parse(result).data;
    //     console.log(JSONData.VALUE);
    //     document.getElementById("spendwillInput").value = JSONData.VALUE*100;
    //     }
    // );

}

function changeWageConstant() {
    var set_spendwill = document.getElementById("spendwillInput").value / 100;
    putParameter('AverageSpendwill', set_spendwill);

}

function changeBorrowwill() {
    var set_borrowwill = document.getElementById("borrowwillInput").value / 100;
    putParameter('AverageBorrowwill', set_borrowwill);

    // getParameter('AverageBorrowwill', function(result) {
    //     var JSONData = JSON.parse(result).data;
    //     console.log(JSONData.VALUE);
    //     document.getElementById("borrowwillInput").value = JSONData.VALUE*100;
    //     }
    // );

}




var getParameter = function (parameter, mycallback) {

    var myCountry = getCountry();

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/read/';
    url = url.concat(myCountry);
    url = url.concat('?parameterID=');
    url = url.concat(parameter);

    console.log(url);

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

var getCompanyParameters = function (companyName, mycallback) {

    var myCountry = getCountry();

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/getCompany/';
    url = url.concat(myCountry);
    url = url.concat('?myCompany=');
    url = url.concat(companyName);

    console.log(url);

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




function addMoreCompanyData(table, chart, mycallback) {

    timeStamp = myMoneyChart.data.labels[myMoneyChart.data.labels.length - 1];

    getCompanyData(table, chart, timeStamp, mycallback, 0);

}

function refreshCompanyData(table, chart, mycallback) {

    timeStamp = 0; //myGDPChart.data.labels[myGDPChart.data.labels.length - 1];

    getCompanyData(table, chart, timeStamp, mycallback, 1);

}


function getCompanyData(chart, timeStamp, mycallback, resetChart) {

    //var lastTimestamp = 0;
    var myCountry = getCountry();
    //console.log(chart.data.datasets);
    //console.log(lastTimestamp);

    myCompany = document.getElementById("selectedCompany").innerHTML;

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/companytable/update/';
    url = url.concat(myCountry);
    url = url.concat('?timestamp=');
    url = url.concat(timeStamp);
    url = url.concat('&myCompany=' + myCompany)

    console.log(url);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        //console.log(xhr.readyState);
        if (xhr.readyState == 4) { //XMLHttpRequest.DONE
            var response = xhr.responseText;
            //console.log("response: " + response); //Correctly prints JSON content to console

            // call it here
            mycallback(chart, response, resetChart);
        }
    }
    xhr.send(null);


}

function updateCompanyData(chart, newData, resetChart) {

    //Parsing API-data
    var JSONData = JSON.parse(newData).data;
    //console.log(JSONData);

    if (resetChart == 0) {
        var timeData = chart.data.labels;
        var capcity = chart.data.datasets[4].data;
    }
    else {

        var timeData = [];
        var capacity = [];

    }

    //console.log(consumerCapital.length);
    //console.log(companyCapital.length);


    for (var i in JSONData) {
        timeData.push(JSONData[i].TIME);
        capacity.push(JSONData[i].CAPACITY);
    };


    chart.data.labels = timeData;
    chart.data.datasets[0].data = capacity;

    chart.update();

}




initiateCompanyTable = function (myChart) {


    var chartData = {
        labels: [0],
        datasets: [
            {
                label: "Capacity",
                borderColor: "black",
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

populateParameters();




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
var ctxMoney = document.getElementById('myMoneyChart').getContext("2d");

var myMoneyChart = new Chart(ctxMoney, {
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

initiateCompanyTable(myMoneyChart);



/*
* POPULATING CHARTS
*/
//refreshMoneyData('MONEY_DATA', myMoneyChart, updateMoneyData);
//refreshGDPData('TIME_DATA', myGDPChart, myDIVChart, updateGDPData);

/*
* REGULAR UPDATE OF CHARTS
*/

setInterval(function () {
    addMoreCompanyData('COMPANY_TABLE', myMoneyChart, updateCompanyData);
    populateParameters();

}, 2000);


