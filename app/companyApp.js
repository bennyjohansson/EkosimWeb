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

function putCompanyParameter(company, parameter, value) { //parameter

    var myCountry = getCountry();

    var isChecked = document.getElementById("checkChangeAll").checked;

    console.log(isChecked);

    if(isChecked) {
        company = "*"
        console.log('Checkbox is checked')
    }


    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/putCompanyParameter/'; //TargetInteputrestRate';
    url = url.concat(myCountry);
    url = url.concat('?myCompany=');
    url = url.concat(company);
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

function changeCapitalReserveRatio() {
    var reserveRatio = document.getElementById("reserveRatioInput").value;
    putParameter('CapitalReserveRatio', reserveRatio);

    // getParameter('CapitalReserveRatio', function(result) {
    //     var JSONData = JSON.parse(result).data;
    //     console.log(JSONData.VALUE);
    //     document.getElementById("reserveRatioInput").value = JSONData.VALUE;
    //     }
    // );

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


    document.getElementById("Reinvest").value = pbr;
    document.getElementById("WageConst").value = wage_const;
    document.getElementById("Capacity").value = capacity;
    document.getElementById("WageCh").value = wage_ch;


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

    refreshMoneyData('MONEY_DATA', myMoneyChart, updateMoneyData);
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

// /ekosim/moneytable/update/'
// /ekosim/timetable/update/'
// /ekosim/read/
// /ekosim/:parameter

function addMoreMoneyData(table, chart, mycallback) {

    timeStamp = myMoneyChart.data.labels[myMoneyChart.data.labels.length - 1];

    getMoneyData(table, chart, timeStamp, mycallback, 0);

}

function addMoreGDPData(table, myGDPChart, myDIVChart, mycallback) {

    timeStamp = myGDPChart.data.labels[myGDPChart.data.labels.length - 1];

    getGDPData(table, myGDPChart, myDIVChart, timeStamp, mycallback, 0);

}

function refreshMoneyData(table, chart, mycallback) {

    timeStamp = 0; //myGDPChart.data.labels[myGDPChart.data.labels.length - 1];

    getMoneyData(table, chart, timeStamp, mycallback, 1);

}

function refreshGDPData(table, myGDPChart, myDIVChart, mycallback) {

    timeStamp = 0; //myGDPChart.data.labels[myGDPChart.data.labels.length - 1];

    getGDPData(table, myGDPChart, myDIVChart, timeStamp, mycallback, 1);

}

//refreshGDPData('TIME_DATA', myGDPChart, myDIVChart, updateGDPData);






function getMoneyData(table, chart, timeStamp, mycallback, resetChart) {

    //var lastTimestamp = 0;
    var myCountry = getCountry();
    //console.log(chart.data.datasets);
    //console.log(lastTimestamp);



    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/moneytable/update/';
    url = url.concat(myCountry);
    url = url.concat('?timestamp=');
    url = url.concat(timeStamp);

    //console.log(url);

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



function getGDPData(table, myGDPChart, myDIVChart, timeStamp, mycallback, resetChart) {

    //var lastTimestamp = 0;
    var myCountry = getCountry();
    lastTimestamp = myGDPChart.data.labels[myGDPChart.data.labels.length - 1];
    //console.log(chart.data.datasets);
    //console.log(lastTimestamp);



    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/timetable/update/';
    url = url.concat(myCountry);
    url = url.concat('?timestamp=');
    url = url.concat(timeStamp);

    //console.log(url);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        //console.log(xhr.readyState);
        if (xhr.readyState == 4) { //XMLHttpRequest.DONE
            var response = xhr.responseText;
            //console.log("response: " + response); //Correctly prints JSON content to console

            // call it here
            mycallback(myGDPChart, myDIVChart, response, resetChart);
        }
    }
    xhr.send(null);


}


function updateMoneyData(chart, newData, resetChart) {

    //Parsing API-data
    var JSONData = JSON.parse(newData).data;
    //console.log(JSONData);

    if (resetChart == 0) {
        var timeData = chart.data.labels;
        var totalMoney = chart.data.datasets[0].data;
        var consumerCapital = chart.data.datasets[1].data;
        var consumerDebts = chart.data.datasets[2].data;
        var consumerDeposits = chart.data.datasets[3].data;
        var bankCapital = chart.data.datasets[4].data;
        var bankLoans = chart.data.datasets[5].data;
        var bankDeposits = chart.data.datasets[6].data;
        var bankLiquiditys = chart.data.datasets[7].data;
        var companyCapital = chart.data.datasets[8].data;
        var companyDebts = chart.data.datasets[9].data;
        var marketCapital = chart.data.datasets[10].data;
        var cityCapital = chart.data.datasets[11].data;
    }
    else {

        var timeData = [];
        var totalMoney = [];
        var consumerCapital = [];
        var consumerDebts = [];
        var consumerDeposits = [];
        var bankCapital = [];
        var bankLoans = [];
        var bankDeposits = [];
        var bankLiquiditys = [];
        var companyCapital = [];
        var companyDebts = [];
        var marketCapital = [];
        var cityCapital = [];



    }

    //console.log(consumerCapital.length);
    //console.log(companyCapital.length);


    for (var i in JSONData) {
        timeData.push(JSONData[i].TIME);
        totalMoney.push(JSONData[i].TOTAL_CAPITAL);
        consumerCapital.push(JSONData[i].CONSUMER_CAPITAL);
        consumerDebts.push(JSONData[i].CONSUMER_DEBTS);
        consumerDeposits.push(JSONData[i].CONSUMER_DEPOSITS);
        bankCapital.push(JSONData[i].BANK_CAPITAL);
        bankLoans.push(JSONData[i].BANK_LOANS);
        bankDeposits.push(JSONData[i].BANK_DEPOSITS);
        bankLiquiditys.push(JSONData[i].BANK_LIQUIDITY);
        companyCapital.push(JSONData[i].COMPANY_CAIPTAL);
        companyDebts.push(JSONData[i].COMPANY_DEBTS);
        marketCapital.push(JSONData[i].MARKET_CAPITAL);
        cityCapital.push(JSONData[i].CITY_CAPITAL);
    };


    chart.data.labels = timeData;
    chart.data.datasets[0].data = totalMoney;
    chart.data.datasets[1].data = consumerCapital;
    chart.data.datasets[2].data = consumerDebts;
    chart.data.datasets[3].data = consumerDeposits;
    chart.data.datasets[4].data = bankCapital;
    chart.data.datasets[5].data = bankLoans;
    chart.data.datasets[6].data = bankDeposits;
    chart.data.datasets[7].data = bankLiquiditys;
    chart.data.datasets[8].data = companyCapital;
    chart.data.datasets[9].data = companyDebts;
    chart.data.datasets[10].data = marketCapital;
    chart.data.datasets[11].data = cityCapital;

    chart.update();

}








initiateMoneyTable = function (myChart) {


    var chartData = {
        labels: [0],
        datasets: [
            {
                label: "Total money",
                borderColor: "black",
                pointRadius: 0,
                data: [0]

            },
            {
                label: "Consumer Capital",
                borderColor: "blue",
                pointRadius: 0,
                data: [0]
            },
            {
                label: "Consumer Debts",
                borderColor: "green",
                pointRadius: 0,
                data: [0]
            },
            {
                label: "Consumer Deposits",
                borderColor: "red",
                pointRadius: 0,
                borderDash: [15, 3],
                data: [0]
            },
            {
                label: "Bank Capital",
                borderColor: "cyan",
                pointRadius: 0,
                borderDash: [15, 3],
                data: [0]
            },
            {
                label: "Bank Loans",
                borderColor: "black",
                pointRadius: 0,
                data: [0]
            },
            {
                label: "Bank Deposits",
                borderColor: "grey",
                pointRadius: 0,
                data: [0]
            },
            {
                label: "Bank Liquidity",
                borderColor: "purple",
                pointRadius: 0,
                borderDash: [15, 3],
                data: [0]
            },
            {
                label: "Company Capital",
                borderColor: "pink",
                pointRadius: 0,
                data: [0]
            },
            {
                label: "Company Debts",
                borderColor: "yellow",
                pointRadius: 0,
                data: [0]
            },
            {
                label: "Market Capital",
                borderColor: "#36a2eb",
                pointRadius: 0,
                data: [0]
            },
            {
                label: "City Capital",
                borderColor: "#ff6384",
                pointRadius: 0,
                borderDash: [15, 3],
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


//document.getElementById("SetFixedRateButton").addEventListener("click", changeInterestRate2);
//document.getElementById('CountryCombo').onclick = print_combo();

/*
* GENERATING CHARTS
*/

Chart.defaults.global.elements.line.borderWidth = 1;
Chart.defaults.global.elements.point.pointRadius = 0;
Chart.defaults.global.elements.line.fill = false;

/*
* INITIATING MONEY CHART
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
            text: 'Money Distribution'
        }
    }
});

initiateMoneyTable(myMoneyChart);



/*
* POPULATING CHARTS
*/
//refreshMoneyData('MONEY_DATA', myMoneyChart, updateMoneyData);
//refreshGDPData('TIME_DATA', myGDPChart, myDIVChart, updateGDPData);

/*
* REGULAR UPDATE OF CHARTS
*/

setInterval(function () {
    addMoreMoneyData('MONEY_DATA', myMoneyChart, updateMoneyData);

}, 2000);


