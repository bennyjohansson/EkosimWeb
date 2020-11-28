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

function changeInterestRate() {
    var targetInterestRate = document.getElementById("interestRateInput").value/100;
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
    var targetInterestRate = document.getElementById("FixedRate").value/100;
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

function changeSpendwill() {
    var set_spendwill = document.getElementById("spendwillInput").value/100;
    putParameter('AverageSpendwill', set_spendwill);

    // getParameter('AverageSpendwill', function(result) {
    //     var JSONData = JSON.parse(result).data;
    //     console.log(JSONData.VALUE);
    //     document.getElementById("spendwillInput").value = JSONData.VALUE*100;
    //     }
    // );

}

function changeBorrowwill() {
    var set_borrowwill = document.getElementById("borrowwillInput").value/100;
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

var getCompany = function (companyName, mycallback) {

    var myCountry = getCountry();

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/getCompany/';
    url = url.concat(myCountry);
    url = url.concat('?companyName=');
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

    myCountry =  document.getElementById("CountryCombo").value;
    if(myCountry == '--Select Country--' || myCountry == "") {

        myCountry = 'Bennyland'
    }

    return myCountry;


} ;

var getDatabaseLink = function () {

    myCountry =  document.getElementById("CountryCombo").value;
    if(myCountry == '--Select Country--' || myCountry == "") {

        myCountry = 'Bennyland'
    }

    var myLink = './myDB/' + myCountry + '.db';
    return myLink;


} ;

// /ekosim/moneytable/update/'
// /ekosim/timetable/update/'
// /ekosim/read/
// /ekosim/:parameter

function addMoreMoneyData(table, chart, mycallback) {

    timeStamp = myGDPChart.data.labels[myGDPChart.data.labels.length - 1];

    getMoneyData(table, chart, timeStamp, mycallback, 0) ;

}

function addMoreGDPData(table, myGDPChart, myDIVChart, mycallback) {

    timeStamp = myGDPChart.data.labels[myGDPChart.data.labels.length - 1];

    getGDPData(table, myGDPChart, myDIVChart, timeStamp, mycallback, 0) ;

}

function refreshMoneyData(table, chart, mycallback) {

    timeStamp = 0; //myGDPChart.data.labels[myGDPChart.data.labels.length - 1];

    getMoneyData(table, chart, timeStamp, mycallback, 1) ;

}

function refreshGDPData(table, myGDPChart, myDIVChart, mycallback) {

    timeStamp = 0; //myGDPChart.data.labels[myGDPChart.data.labels.length - 1];

    getGDPData(table, myGDPChart, myDIVChart, timeStamp, mycallback, 1) ;

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



function getGDPData(table,  myGDPChart, myDIVChart, timeStamp, mycallback, resetChart) {

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
    
    if(resetChart == 0) {
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


    for(var i in JSONData) {
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

function updateGDPData(GDPChart, DIVChart, newData, resetChart) {

    //Parsing API-data
    var JSONData = JSON.parse(newData).data;

    var no_consumers = 3000;
    var employed = [];

    //Preparing GDP-data & DIV-data

    if(resetChart == 0) {
        console.log("Not resetting data for GDP-data")
        var timeData = GDPChart.data.labels;
        var nominal_gdp = GDPChart.data.datasets[0].data;
        var real_gdp = GDPChart.data.datasets[1].data;
        var items = GDPChart.data.datasets[2].data;
        var investments = GDPChart.data.datasets[3].data;
        //var demand = GDPChart.data.datasets[1].data;

        //Preparing DIV-data
        var price_out = DIVChart.data.datasets[0].data;
        var interest_rate = DIVChart.data.datasets[1].data;
        //var employed = DIVChart.data.datasets[3].data;
        var wages = DIVChart.data.datasets[4].data;
        var cap_reserv_ratio = DIVChart.data.datasets[3].data;
         //DIVChart.data.datasets[5].data;
        var unemployment = DIVChart.data.datasets[5].data;

    }
    else {
        console.log("Resetting data for GDP-data")
        var timeData = [];
        var nominal_gdp = [];
        var price_out = [];
        var interest_rate = [];
        var wages =[];
        var real_gdp = [];
        var items = [];
        var investments = [];
        var cap_reserv_ratio = [];
        var unemployment = []; //new Array(timeData.length);

    }

  


    for(var i in JSONData) {
        timeData.push(JSONData[i].TIME);
        nominal_gdp.push(JSONData[i].GDP_NOMINAL);
        real_gdp.push(JSONData[i].GDP_NOMINAL*price_out[1]/JSONData[i].PRICE); //Should be price[0] perhaps...
        items.push(JSONData[i].GDP_ITEMS);
        //demand.push(JSONData[i].DEMAND);
        investments.push(JSONData[i].INVESTMENTS);

        //DIVChart.data.labels.push(JSONData[i].TIME);
        price_out.push(JSONData[i].PRICE);
        interest_rate.push(JSONData[i].INTEREST_RATE*100);
        cap_reserv_ratio.push(JSONData[i].CAP_RES_RATIO*10);

        unemployment.push(JSONData[i].UNEMPLOYMENT*10);
        wages.push(JSONData[i].WAGES);
    };
   
    //Calculating growth
    let GDPreal = new Array(timeData.length);
    let Growthx10 = new Array(timeData.length);
    Growthx10MA = new Array(timeData.length);
    Growthx10[0] = 0;


    let Inflation = new Array(timeData.length);
    let Inflation10MA = new Array(timeData.length);



    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    for(i=0; i<timeData.length; i++) {
        GDPreal[i]=nominal_gdp[i]*price_out[1]/price_out[i];
        Growthx10[i] = ((nominal_gdp[i+1]*price_out[1]/price_out[i+1])/GDPreal[i]-1)*100;
        Growthx10MA[i] =  Growthx10.slice(Math.max(0,i-9), i+1).reduce(reducer)/10;

        Inflation[i] = price_out[i+1]/price_out[i] - 1;
        Inflation10MA[i] = Inflation.slice(Math.max(0,i-9), i+1).reduce(reducer)/10;

        //Unemployment.push((no_consumers - employed[i])/no_consumers);

    }

    GDPChart.data.labels = timeData;
    GDPChart.data.datasets[0].data = nominal_gdp;
    GDPChart.data.datasets[1].data = real_gdp;
    GDPChart.data.datasets[2].data = items;
    //demand.push(JSONData[i].DEMAND);
    GDPChart.data.datasets[3].data = investments;

    DIVChart.data.labels = timeData;
    DIVChart.data.datasets[0].data = price_out;
    DIVChart.data.datasets[1].data = interest_rate;
    DIVChart.data.datasets[3].data = cap_reserv_ratio;

    //console.log(DIVChart.data.datasets[3].data);

    //Replacing old GDP data with new data & Updating
    DIVChart.data.datasets[2].data = Growthx10MA;
    DIVChart.data.datasets[4].data = Inflation10MA;
    DIVChart.data.datasets[5].data = unemployment;
    DIVChart.data.datasets[6].data = wages;





    //Updaind the rest
    //var employed = chart.data.datasets[2].data;
    //var wages = chart.data.datasets[3].data;

    DIVChart.update();
    GDPChart.update();

   
}






initiateMoneyTable = function(myChart) {
   
   
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
            borderDash: [15,3],
            data: [0]
        },
        {
            label: "Bank Capital",
            borderColor: "cyan",
            pointRadius: 0,
            borderDash: [15,3],
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
            borderDash: [15,3],
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
            borderDash: [15,3],
            data: [0]
        }
        ]
    };

    myChart.data = chartData;

};

initiateGDPTable = function(myChart) {
   
   
    var chartData = {
        labels: [0], 
        datasets: [
        {
            label: "Nominal GDP",
            borderColor: "black",
            pointRadius: 0,
            data: [0]
            
        },
        {
            label: "Real GDP",
            borderColor: "Green",
            pointRadius: 0,
            data: [0]
            
        }, 
        {
            label: "Items produced",
            borderColor: "Red",
            pointRadius: 0,
            data: [0]
            
        }, 
        {
            label: "investments",
            borderColor: "blue",
            pointRadius: 0,
            data: [0]
            
        }
        
        ]
    }

    myChart.data = chartData;

};

initiateDIVTable = function(myChart) {
   
   
    var chartData = {
        labels: [0], 
        datasets: [
        {
            label: "Price",
            borderColor: "black",
            pointRadius: 0,
            data: [0]
            
        },
        {
            label: "Interest rate %",
            borderColor: "blue",
            pointRadius: 0,
            data: [0]
            
        },
        {
            label: "Growth",
            borderColor: "green",
            pointRadius: 0,
            data: [0]
            
        },
        {
            label: "Cap reserve ratio x10",
            borderColor: "red",
            pointRadius: 0,
            data: [0]
            
        },
        {
            label: "Inflation",
            borderColor: "yellow",
            pointRadius: 0,
            data: [0]
            
        },
        {
            label: "Unemployment x10",
            borderColor: "cyan",
            pointRadius: 0,
            data: [0]
            
        },
        {
            label: "Average wage Bempa CO/1000",
            borderColor: "purple",
            pointRadius: 0,
            data: [0]
            
        }
    ]
    }

    myChart.data = chartData;

};



/*
* Reading initial parameters
*/


getParameter('InterestRateMethod', function(result) {
    var JSONData = JSON.parse(result).data;
    console.log(JSONData.VALUE);
    var irMethod;
    //element.innerHTML = "New Heading";
    if(JSONData.VALUE == 1) {
        irMethod = 'Market Interest Rate used';
    }
    else {
        irMethod = 'Target Interest Rate used';
    }
    document.getElementById("irMethod").innerHTML = irMethod;
    }
);

getParameter('TargetInterestRate', function(result) {
    var JSONData = JSON.parse(result).data;
    console.log(JSONData.VALUE);
    document.getElementById("interestRateInput").value = JSONData.VALUE*100;
    }
);

getParameter('CapitalReserveRatio', function(result) {
    var JSONData = JSON.parse(result).data;
    console.log(JSONData.VALUE);
    document.getElementById("reserveRatioInput").value = JSONData.VALUE;
    }
);

getParameter('AverageSpendwill', function(result) {
    var JSONData = JSON.parse(result).data;
    console.log(JSONData.VALUE);
    document.getElementById("spendwillInput").value = JSONData.VALUE*100;
    }
);

getParameter('AverageBorrowwill', function(result) {
    var JSONData = JSON.parse(result).data;
    console.log(JSONData.VALUE);
    document.getElementById("borrowwillInput").value = JSONData.VALUE*100;
    }
);

/*
* POPULATING DROPDOWN
*/

function add_option (select_id, text) {

    var select = document.getElementById(select_id);
    select.options[select.options.length] = new Option(text);
}

function clear_combo (select_id) {
   
    var select = document.getElementById(select_id);
    select.options.length = 0;
}

function load_combo (select_id, option_array) {

    for (var i = 0; i < option_array.length; i++) {
        add_option (select_id, option_array[i]);
    }
}


function countryChange() {

    //var myCountry = document.getElementById("CountryCombo").value;
    //Testing
    var myCountry = getCountry();
    document.getElementById("countryText").innerHTML = myCountry;

    refreshMoneyData('MONEY_DATA', myMoneyChart, updateMoneyData);
    refreshGDPData('TIME_DATA', myGDPChart, myDIVChart, updateGDPData);



}

testarray = ['Bennyland', 'Saraland', 'Otherland'];
add_option ('CountryCombo', '--Select Country--');
load_combo('CountryCombo', testarray);
document.getElementById("CountryCombo").addEventListener("change", countryChange); 
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
* INITIATING GDP CHART
*/
var ctxGDP = document.getElementById('myGDPChart').getContext("2d");

var myGDPChart = new Chart(ctxGDP, {
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
         text: 'GDP and investments'
     }
   }
});


initiateGDPTable(myGDPChart);


/*
* INITIATING INTEREST ETC. CHART
*/
var ctxDIV = document.getElementById('myDIVChart').getContext("2d");

var myDIVChart = new Chart(ctxDIV, {
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
         text: 'Interest, price and growth'
     }
   }
});


initiateDIVTable(myDIVChart);


/*
* POPULATING CHARTS
*/
//refreshMoneyData('MONEY_DATA', myMoneyChart, updateMoneyData);
//refreshGDPData('TIME_DATA', myGDPChart, myDIVChart, updateGDPData);

/*
* REGULAR UPDATE OF CHARTS
*/

setInterval(function() {
    addMoreMoneyData('MONEY_DATA', myMoneyChart, updateMoneyData);
    addMoreGDPData('TIME_DATA', myGDPChart, myDIVChart, updateGDPData);

    }, 2000);



