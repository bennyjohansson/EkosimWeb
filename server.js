var express = require('express');
var app = express();
let DBFunctions = require('./DBConnection')
const sqlite3 = require('sqlite3').verbose();


var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*'); //'http://localhost:8888

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.put('/ekosim/put/:myCountry', function (req, res) {

    var ParameterID = req.body.PARAMETER;
    var value = req.body.VALUE;

    var myPath = './myDB/';
    var myCountry = req.params.myCountry; // //
    var myDatabase = myPath.concat(myCountry);
    myDatabase = myDatabase.concat('.db');

    //console.log(value);
    //console.log(ParameterID);


    if (!value || value === "") {
        res.status(500).send({ error: "Provide value" });
    }
    else {
        var idFound = false;

    }

    DBFunctions.insertFunction(myDatabase, ParameterID, value)
    res.send('Parameter ' + ParameterID + ' probably updated to value ' + value);

});



app.get('/ekosim/read/:myCountry', (req, res, next) => {

    var myPath = './myDB/';
    var myCountry = req.params.myCountry; // //
    var myDatabase = myPath.concat(myCountry);
    myDatabase = myDatabase.concat('.db');

    var params = [req.query.parameterID];

    //let db = new sqlite3.Database('/home/ec2-user/ekosimProject/myDB/ekosimDB.db', sqlite3.OPEN_READONLY, (err) => {
    let db = new sqlite3.Database(myDatabase, sqlite3.OPEN_READONLY, (err) => {

        //./app/app.js
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the ekosim database.');
    });

    var sql = "select * from PARAMETERS WHERE PARAMETER = ?"// InterestRateMethod TargetInterestRate
    //params = [];
    //console.log(sql);
    //console.log(params);
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": row
        })
    });

    //Closing the database
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });

});

app.get('/ekosim/getAllParameters/:myCountry', (req, res, next) => {

    var myPath = './myDB/';
    var myCountry = req.params.myCountry; // //
    var myDatabase = myPath.concat(myCountry);
    myDatabase = myDatabase.concat('.db');

    //myDatabase = './myDB/Bennyland.db';


    console.log(myDatabase);
    myTable = getTable(myDatabase, 'PARAMETERS');


    var mytableJSON = myTable.then((result) => {
        //console.log(result[31]) // "Some User token"
        //return result[31];
        return res.json({
            "message": "success",
            "data": result
        })
    });


    //console.log(mytableJSON)

});


app.get('/ekosim/getCompany/:myCountry', (req, res, next) => {

    var myPath = './myDB/';
    var myCountry = req.params.myCountry; // //
    var myDatabase = myPath.concat(myCountry);
    myDatabase = myDatabase.concat('.db');

    var myCompany = req.query.myCompany;

    myTable = getCompanyTable(myDatabase, 'COMPANY_TABLE', myCompany);

    //let db = new sqlite3.Database('/home/ec2-user/ekosimProject/myDB/ekosimDB.db', sqlite3.OPEN_READONLY, (err) => {
    var mytableJSON = myTable.then((result) => {
        //console.log(result[31]) // "Some User token"
        //return result[31];
        return res.json({
            "message": "success",
            "data": result
        })
    });
});



app.get('/ekosim/moneytable/update/:myCountry', (req, res, next) => {

    var myPath = './myDB/';
    var myCountry = req.params.myCountry; // //
    var myDatabase = myPath.concat(myCountry);
    myDatabase = myDatabase.concat('.db');

    //myDatabase = './myDB/Bennyland.db';

    var lastTime = req.query.timestamp;

    console.log(lastTime)
    console.log(myDatabase);
    myTable = getMoneyTableUpdate(lastTime, myDatabase, 'MONEY_DATA');


    var mytableJSON = myTable.then((result) => {
        //console.log(result[31]) // "Some User token"
        //return result[31];
        return res.json({
            "message": "success",
            "data": result
        })
    });


    //console.log(mytableJSON)

});

app.get('/ekosim/timetable/update/:myCountry', (req, res, next) => {

    var myPath = './myDB/';
    var myCountry = req.params.myCountry; //'./myDB/Bennyland.db' //
    var myDatabase = myPath.concat(myCountry);
    myDatabase = myDatabase.concat('.db');

    var lastTime = req.query.timestamp;
    myTable = getMoneyTableUpdate(lastTime, myDatabase, 'TIME_DATA');

    var mytableJSON = myTable.then((result) => {
        //console.log(result[31]) // "Some User token"
        //return result[31];
        return res.json({
            "message": "success",
            "data": result
        })
    });


    //console.log(mytableJSON)

});

app.get('/ekosim/worldtable/', (req, res, next) => {

    //var lastTime = [req.datab.lastTimestamp];
    //console.log(lastTime)

    myTable = getWorldTable('WORLD_TABLE');

    var mytableJSON = myTable.then((result) => {
        //console.log(result[31]) // "Some User token"
        //return result[31];
        return res.json({
            "message": "success",
            "data": result
        })
    });


    //console.log(mytableJSON)

});

app.get('/ekosim/paramtest/', (req, res) => {
    console.log(req.query.paramA);

    if (typeof req.query.paramA !== 'undefined' && typeof req.query.paramB !== 'undefined') {
        let paramA = req.query.paramA;
        let paramB = req.query.paramB;
        //do something with paramA and paramB
        console.log(paramA);
        console.log(paramB);
        res.send('Parameters identified: ' + paramA + ' and ' + paramB);
    }
    else {
        console.log("Cant get parmeters");
        res.status(500).send({ error: "Cant get parmeters" });

    }


});





/*const port = process.env.port || 3000;
app.listen(3000, function () {


    console.log('Forst API running on port 3000');
});
*/

app.get("/", (req, res, next) => {
    console.log(__dirname + '/index.html');
    res.sendFile(__dirname + '/index.html');
    //res.json(["Tony","Lisa","Michael","Ginger","Food"]);

});

//8080
app.listen(8080, function () {


    console.log('Forst API running on port 8080');
    //console.log(port);
});

/*
* --------------------------
*/

// app.get('/ekosim/readmoney/', (req, res, next) => {

//     let db = new sqlite3.Database('./myDB/Bennyland.db', sqlite3.OPEN_READONLY, (err) => {
//         if (err) {
//             console.error(err.message);
//         }
//         console.log('Connected to the ekosim database.');
//     });

//     var params = [];
//     var sql = "select * from MONEY_DATA"// InterestRateMethod TargetInterestRate
//     //params = [];
//     //console.log(sql);
//     //console.log(params);
//     db.get(sql, params, (err, row) => {
//         if (err) {
//             res.status(400).json({ "error": err.message });
//             return;
//         }
//         res.json({
//             "message": "success",
//             "data": row
//         })
//         //console.log(row)
//     });

//     //Closing the database
//     db.close((err) => {
//         if (err) {
//             console.error(err.message);
//         }
//         console.log('Close the database connection.');
//     });
// });

// app.get('/ekosim/test', (req, res, next) => {



//     res.json({
//                 "message": "success",
//                  "data": "Test succeeded"});

// });



// app.get('/ekosim/readmoneytable/:table', (req, res, next) => {

//     var myGetTable = [req.params.table];
//     myTable = resolveReturnTable(myGetTable);

//     var mytableJSON = myTable.then((result) => {
//         //console.log(result[31]) // "Some User token"
//         //return result[31];
//         return res.json({
//             "message": "success",
//             "data": result
//         })
//     });


//     //console.log(mytableJSON)

// });