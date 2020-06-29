//var dbFunctions = require('./DBConnection');
//var XMLHttpRequest = require("xhr-browserify").XMLHttpRequest;

//Called by change function
function putParameter(parameter, value) { //parameter

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/put/'; //TargetInteputrestRate';
    url = url.concat(parameter);

    //console.log(url);
    let myBody = {
        "PARAMETER": "TargetInterestRate",
        "VALUE": "0.05"
    };

    myBody.PARAMETER = parameter; 
    myBody.VALUE = value;

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

    getParameter('TargetInterestRate', function(result) {
        var JSONData = JSON.parse(result).data;
        console.log(JSONData.VALUE);
        document.getElementById("interestRateInput").value = JSONData.VALUE*100;
        }
    );

}

function changeCapitalReserveRatio() {
    var reserveRatio = document.getElementById("reserveRatioInput").value;
    putParameter('CapitalReserveRatio', reserveRatio);

    getParameter('CapitalReserveRatio', function(result) {
        var JSONData = JSON.parse(result).data;
        console.log(JSONData.VALUE);
        document.getElementById("reserveRatioInput").value = JSONData.VALUE;
        }
    );

}

function changeSpendwill() {
    var set_spendwill = document.getElementById("spendwillInput").value/100;
    putParameter('AverageSpendwill', set_spendwill);

    getParameter('AverageSpendwill', function(result) {
        var JSONData = JSON.parse(result).data;
        console.log(JSONData.VALUE);
        document.getElementById("spendwillInput").value = JSONData.VALUE*100;
        }
    );

}

function changeBorrowwill() {
    var set_borrowwill = document.getElementById("borrowwillInput").value/100;
    putParameter('AverageBorrowwill', set_borrowwill);

    getParameter('AverageBorrowwill', function(result) {
        var JSONData = JSON.parse(result).data;
        console.log(JSONData.VALUE);
        document.getElementById("borrowwillInput").value = JSONData.VALUE*100;
        }
    );

}




var getParameter = function (parameter, mycallback) {

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/read/';
    url = url.concat(parameter);

    //console.log(url);

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

// /ekosim/moneytable/update/'
// /ekosim/timetable/update/'
// /ekosim/read/
// /ekosim/:parameter


function getMoneyData(table, chart, mycallback) {

    //var lastTimestamp = 0;
    lastTimestamp = chart.data.labels[chart.data.labels.length - 1];
    //console.log(chart.data.datasets);
    //console.log(lastTimestamp);


    
    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/moneytable/update/';
    url = url.concat(lastTimestamp);

    //console.log(url);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        //console.log(xhr.readyState);
        if (xhr.readyState == 4) { //XMLHttpRequest.DONE
            var response = xhr.responseText;
            //console.log("response: " + response); //Correctly prints JSON content to console

            // call it here
            mycallback(chart, response);
        }
    }
    xhr.send(null);
    
    
}

function getGDPData(table,  myGDPChart, myDIVChart, mycallback) {

    //var lastTimestamp = 0;
    lastTimestamp = myGDPChart.data.labels[myGDPChart.data.labels.length - 1];
    //console.log(chart.data.datasets);
    //console.log(lastTimestamp);


    
    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/timetable/update/';
    url = url.concat(lastTimestamp);

    //console.log(url);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        //console.log(xhr.readyState);
        if (xhr.readyState == 4) { //XMLHttpRequest.DONE
            var response = xhr.responseText;
            //console.log("response: " + response); //Correctly prints JSON content to console

            // call it here
            mycallback(myGDPChart, myDIVChart, response);
        }
    }
    xhr.send(null);
    
    
}


function updateMoneyData(chart, newData) {

    //Parsing API-data
    var JSONData = JSON.parse(newData).data;
    //console.log(JSONData);
    
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

function updateGDPData(GDPChart, DIVChart, newData) {

    //Parsing API-data
    var JSONData = JSON.parse(newData).data;

    //Preparing GDP-data
    var timeData = GDPChart.data.labels;
    var nominal_gdp = GDPChart.data.datasets[0].data;
    //var real_gdp = GDPChart.data.datasets[1].data;
    //var items = GDPChart.data.datasets[2].data;
    //var investments = GDPChart.data.datasets[3].data;
    //var demand = GDPChart.data.datasets[1].data;

    //Preparing DIV-data
    var price_out = DIVChart.data.datasets[0].data;
    //var interest_rate = DIVChart.data.datasets[1].data;
    //var employed = DIVChart.data.datasets[3].data;
    //var wages = DIVChart.data.datasets[4].data;
    //var growth = DIVChart.data.datasets[4].data;

  


    for(var i in JSONData) {
        GDPChart.data.labels.push(JSONData[i].TIME);
        GDPChart.data.datasets[0].data.push(JSONData[i].GDP_NOMINAL);
        GDPChart.data.datasets[1].data.push(JSONData[i].GDP_NOMINAL*price_out[1]/JSONData[i].PRICE); //Should be price[0] perhaps...
        GDPChart.data.datasets[2].data.push(JSONData[i].GDP_ITEMS);
        //demand.push(JSONData[i].DEMAND);
        GDPChart.data.datasets[3].data.push(JSONData[i].INVESTMENTS);

        DIVChart.data.labels.push(JSONData[i].TIME);
        DIVChart.data.datasets[0].data.push(JSONData[i].PRICE);
        DIVChart.data.datasets[1].data.push(JSONData[i].INTEREST_RATE*100);
        DIVChart.data.datasets[3].data.push(JSONData[i].CAP_RES_RATIO*10);

        //employed.push(JSONData[i].NO_EMPLOYED);
        //wages.push(JSONData[i].WAGES);
    };
   
    //Calculating growth
    let GDPreal = new Array(timeData.length);
    let Growthx10 = new Array(timeData.length);
    Growthx10MA = new Array(timeData.length);
    Growthx10[0] = 0;

    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    for(i=0; i<timeData.length; i++) {
        GDPreal[i]=nominal_gdp[i]*price_out[1]/price_out[i];
        Growthx10[i] = ((nominal_gdp[i+1]*price_out[1]/price_out[i+1])/GDPreal[i]-1)*100;
        Growthx10MA[i] =  Growthx10.slice(Math.max(0,i-9), i+1).reduce(reducer)/10;

    }

    //console.log(DIVChart.data.datasets[3].data);

    //Replacing old GDP data with new data & Updating
    DIVChart.data.datasets[2].data = Growthx10MA;




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
            
        }
    ]
    }

    myChart.data = chartData;

};

/*
* PUPULATING BUTTONS AND FIELDS WITH INITIAL VALUES
*/

// var getTest = function (mycallback) {
//     var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/test';
//     //url = url.concat(parameter);

//     //console.log(url);

//     var xhr = new XMLHttpRequest();
//     xhr.open('GET', url, true);
//     xhr.onreadystatechange = function () {
//         //console.log(xhr.readyState);
//         if (xhr.readyState == 4) { //XMLHttpRequest.DONE
//             var response = xhr.responseText;
//             console.log("response: " + response); //Correctly prints JSON content to console

//             // call it here
//             mycallback(response);
//         }
//     }
//     xhr.send(null);



// };

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




setInterval(function() {
    getMoneyData('MONEY_DATA', myMoneyChart, updateMoneyData);
    getGDPData('TIME_DATA', myGDPChart, myDIVChart, updateGDPData);

    }, 2000);



/*
*----------------------------------------------------------------------------------------
*----------------------------------------------------------------------------------------
*----------------------------------------------------------------------------------------
*----------------------------------------------------------------------------------------
*----------------------------------------------------------------------------------------
* OLD STUFF
*----------------------------------------------------------------------------------------
*----------------------------------------------------------------------------------------
*----------------------------------------------------------------------------------------
*----------------------------------------------------------------------------------------
*----------------------------------------------------------------------------------------
*/

/*

getTest(function(result) {
    console.log(result);    
    var JSONData = JSON.parse(result).data;
    var myResponse;
    myResponse = JSONData //.data;
    //element.innerHTML = "New Heading";
    console.log(myResponse);

    document.getElementById("TestText").innerHTML = myResponse;
    }
);

generateTimeChart = function(result) {

    //Fetching time series data
    var JSONData = JSON.parse(result).data;
       
    var timeData = [];

    var items = [];
    var demand = [];
    var price_out = [];
    var employed = [];
    var wages = [];
    var interest_rate = [];
    var investments = [];
    var nominal_gdp = [];



    for(var i in JSONData) {
        timeData.push(JSONData[i].TIME);
        items.push(JSONData[i].GDP_ITEMS);
        demand.push(JSONData[i].DEMAND);
        price_out.push(JSONData[i].PRICE);
        employed.push(JSONData[i].NO_EMPLOYED);
        wages.push(JSONData[i].WAGES);
        interest_rate.push((JSONData[i].INTEREST_RATE));
        investments.push(JSONData[i].INVESTMENTS);
        nominal_gdp.push(JSONData[i].GDP_NOMINAL);
    };



    //Plotting GDP and stuff in first chart
    var myGDPChart = document.getElementById('myGDPChart').getContext('2d');

    let GDPreal = new Array(nominal_gdp.length);
    let Growthx10 = new Array(nominal_gdp.length);
    Growthx10MA = new Array(nominal_gdp.length);
    Growthx10[0] = 0;

    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    for(i=0; i<nominal_gdp.length; i++) {
        GDPreal[i]=nominal_gdp[i]*price_out[0]/price_out[i];
        Growthx10[i] = ((nominal_gdp[i+1]*price_out[0]/price_out[i+1])/GDPreal[i]-1)*100;
        Growthx10MA[i] =  Growthx10.slice(Math.max(0,i-9), i+1).reduce(reducer)/10;

    }

    //console.log(Growthx10MA);

    var timeChart = new Chart(myGDPChart, {

        type: 'line', 
        data: {
            labels: timeData, 
            datasets: [
            {
                label: "Nominal GDP",
                borderColor: "black",
                pointRadius: 0,
                data: nominal_gdp
                
            },
            {
                label: "investments",
                borderColor: "blue",
                pointRadius: 0,
                data: investments
                
            }, 
            {
                label: "GDP Index Year 0",
                borderColor: "Green",
                pointRadius: 0,
                data: GDPreal
                
            }, 
            {
                label: "Items produced",
                borderColor: "Red",
                pointRadius: 0,
                data: items
                
            }
            
            ]
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
                text: 'Growth and investments'
            }
        }
    });


    
    let irx100 = interest_rate.map(function(x) { return x * 100; });
    //Plotting interest rate & and stuff in second chart
    let myDIVChart = document.getElementById('myDIVChart').getContext('2d');

    let DIVChart = new Chart(myDIVChart, {

        type: 'line', 
        data: {
            labels: timeData, 
            datasets: [
            {
                label: "Price",
                borderColor: "black",
                pointRadius: 0,
                data: price_out
                
            },
            {
                label: "interest_rate*100",
                borderColor: "blue",
                pointRadius: 0,
                data: irx100
                
            },
            {
                label: "Growth",
                borderColor: "green",
                pointRadius: 0,
                data: Growthx10MA
                
            },
            {
                label: "Growth",
                borderColor: "green",
                pointRadius: 0,
                data: Growthx10MA
                
            }
        ]
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
                text: 'Price and interest rate'
            }
        }
    });
    myReturnChart = timeChart;
    oldData = myReturnChart.data.datasets[0].data;
    //console.log(oldData);
    //return timeChart;
};

generateMoneyTable = function(result) {
    var JSONData = JSON.parse(result).data;
    
    var timeData = [];
   
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
    var totalMoney = [];


    for(var i in JSONData) {
        timeData.push(JSONData[i].TIME);
        consumerCapital.push(JSONData[i].CONSUMER_CAPITAL);
        consumerDebts.push(JSONData[i].CONSUMER_DEBTS);
        consumerDeposits.push(JSONData[i].CONSUMER_DEPOSITS);
        bankCapital.push(JSONData[i].BANK_CAPITAL);
        bankLoans.push(JSONData[i].CONSUMER_CAPITAL);
        bankDeposits.push(JSONData[i].BANK_DEPOSITS);
        bankLiquiditys.push(JSONData[i].BANK_LIQUIDITY);
        companyCapital.push(JSONData[i].COMPANY_CAIPTAL);
        companyDebts.push(JSONData[i].COMPANY_DEBTS);
        marketCapital.push(JSONData[i].MARKET_CAPITAL);
        cityCapital.push(JSONData[i].CITY_CAPITAL);
        totalMoney.push(JSONData[i].TOTAL_CAPITAL);
    };

    var moneyChartCanvas = document.getElementById('myMoneyChart').getContext('2d');

    
    var moneyChart = new Chart(moneyChartCanvas, {

        type: 'line', 
        data: {
            labels: timeData, 
            datasets: [
            {
                label: "Total money",
                borderColor: "black",
                pointRadius: 0,
                data: totalMoney
                
            },
            {
                label: "Consumer Capital",
                borderColor: "blue",
                pointRadius: 0,
                data: consumerCapital
            },
            {
                label: "Consumer Debts",
                borderColor: "green",
                pointRadius: 0,
                data: consumerDebts
            },
            {
                label: "Consumer Deposits",
                borderColor: "red",
                pointRadius: 0,
                borderDash: [15,3],
                data: consumerDeposits
            },
            {
                label: "Bank Capital",
                borderColor: "cyan",
                pointRadius: 0,
                borderDash: [15,3],
                data: bankCapital
            },
            {
                label: "Bank Deposits",
                borderColor: "black",
                pointRadius: 0,
                data: bankDeposits
            },
            {
                label: "Bank Liquidity",
                borderColor: "grey",
                pointRadius: 0,
                data: bankLiquiditys
            },
            {
                label: "Bank Loans",
                borderColor: "purple",
                pointRadius: 0,
                borderDash: [15,3],
                data: bankLoans
            },
            {
                label: "Company Capital",
                borderColor: "pink",
                pointRadius: 0,
                data: companyCapital
            },
            {
                label: "Company Debts",
                borderColor: "yellow",
                pointRadius: 0,
                data: companyDebts
            },
            {
                label: "Market Capital",
                borderColor: "#36a2eb",
                pointRadius: 0,
                data: marketCapital
            },
            {
                label: "City Capital",
                borderColor: "#ff6384",
                pointRadius: 0,
                borderDash: [15,3],
                data: cityCapital
            }
            ]
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
                text: 'Money distribution'
            }
        }
    });

};

function getTableData(table, mycallback) {

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/readmoneytable/';
    url = url.concat(table);
    var myReturnChart;

    //console.log(url);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        //console.log(xhr.readyState);
        if (xhr.readyState == 4) { //XMLHttpRequest.DONE
            var response = xhr.responseText;
            //console.log("response: " + response); //Correctly prints JSON content to console

            // call it here
            mycallback(response);
        }
    }
    xhr.send(null);

    
    //oldData = myReturnChart.data.datasets[0].data;
    //console.log(oldData);

    return myReturnChart;
    
}
function updateMoneyData(chart, newData) {

    //Parsing API-data
    var JSONData = JSON.parse(newData).data;
    
    var timeData = [];
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
    var totalMoney = [];


    for(var i in JSONData) {
        timeData.push(JSONData[i].TIME);
        consumerCapital.push(JSONData[i].CONSUMER_CAPITAL);
        consumerDebts.push(JSONData[i].CONSUMER_DEBTS);
        consumerDeposits.push(JSONData[i].CONSUMER_DEPOSITS);
        bankCapital.push(JSONData[i].BANK_CAPITAL);
        bankLoans.push(JSONData[i].CONSUMER_CAPITAL);
        bankDeposits.push(JSONData[i].BANK_DEPOSITS);
        bankLiquiditys.push(JSONData[i].BANK_LIQUIDITY);
        companyCapital.push(JSONData[i].COMPANY_CAIPTAL);
        companyDebts.push(JSONData[i].COMPANY_DEBTS);
        marketCapital.push(JSONData[i].MARKET_CAPITAL);
        cityCapital.push(JSONData[i].CITY_CAPITAL);
        totalMoney.push(JSONData[i].TOTAL_CAPITAL);
    };
    //console.log(timeData);
    //console.log(totalMoney);

    chart.data.labels = timeData;
    chart.data.datasets[0].data = totalMoney;
    chart.update();
   
}


function updateChartData(table, chart, mycallback) {

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.ekosim/readmoneytable/';
    url = url.concat(table);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        //console.log(xhr.readyState);
        if (xhr.readyState == 4) { //XMLHttpRequest.DONE
            var response = xhr.responseText;
            //console.log("response: " + response); //Correctly prints JSON content to console

            // call it here
            mycallback(chart, response);
        }
    }
    xhr.send(null);
}


function updateDIVData(chart, newData) {

    //Parsing API-data
    //Price interest growth
    var JSONData = JSON.parse(newData).data;
    //console.log(JSONData);

    var timeData = chart.data.labels;
    //var nominal_gdp = chart.data.datasets[0].data;
    //var real_gdp = chart.data.datasets[1].data;
    //var items = chart.data.datasets[2].data;
    //var demand = chart.data.datasets[1].data;
    var price_out = chart.data.datasets[0].data;
    var interest_rate = chart.data.datasets[1].data;

    var employed = chart.data.datasets[2].data;
    var wages = chart.data.datasets[3].data;
    //var investments = chart.data.datasets[3].data;
    //var growth = chart.data.datasets[4].data;





    for(var i in JSONData) {
        timeData.push(JSONData[i].TIME);
        price_out.push(JSONData[i].PRICE);
        employed.push(JSONData[i].NO_EMPLOYED);
        wages.push(JSONData[i].WAGES);
        interest_rate.push((JSONData[i].INTEREST_RATE));
        nominal_gdp.push(JSONData[i].GDP_NOMINAL);


    };

    let Growthx10 = new Array(timeData.length);
    Growthx10MA = new Array(timeData.length);
    Growthx10[0] = 0;

    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    for(i=0; i<timeData.length; i++) {
        //GDPreal[i]=nominal_gdp[i]*price_out[0]/price_out[i];
        //Growthx10[i] = ((nominal_gdp[i+1]*price_out[0]/price_out[i+1])/GDPreal[i]-1)*100;
        //Growthx10MA[i] =  Growthx10.slice(Math.max(0,i-9), i+1).reduce(reducer)/10;

    }
   
    
    chart.data.labels = timeData;
    chart.data.datasets[0].data = price_out;
    chart.data.datasets[1].data = interest_rate;
    //chart.data.datasets[2].data = Growthx10MA;
    //chart.data.datasets[3].data = investments;
    //chart.data.datasets[4].data = bankCapital;
    //chart.data.datasets[5].data = bankLoans;
    //chart.data.datasets[6].data = bankDeposits;
    //chart.data.datasets[7].data = bankLiquiditys;
    //chart.data.datasets[8].data = companyCapital;
    //chart.data.datasets[9].data = companyDebts;
    //chart.data.datasets[10].data = marketCapital;
    //chart.data.datasets[11].data = cityCapital;

    chart.update();
   
}

*/