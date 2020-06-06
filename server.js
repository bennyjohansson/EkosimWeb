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


app.get('/ekosim/read/:param', (req, res, next) => {

    let db = new sqlite3.Database('/Users/bennyjohansson/Projects/ekosim/myDB/ekosimDB.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the ekosim database.');
    });
    var params = [req.params.param];
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
});



app.get('/ekosim/readmoney/', (req, res, next) => {

    let db = new sqlite3.Database('/Users/bennyjohansson/Projects/ekosim/myDB/ekosimDB.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the ekosim database.');
    });

    var params = [];
    var sql = "select * from MONEY_DATA"// InterestRateMethod TargetInterestRate
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
        //console.log(row)
    });
});

app.get('/ekosim/readmoneytable/:table', (req, res, next) => {

    var myGetTable = [req.params.table];
    myTable = resolveReturnTable(myGetTable);

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


app.get('/ekosim/moneytable/update/:lastTimestamp', (req, res, next) => {

    var lastTime = [req.params.lastTimestamp];
    //console.log(lastTime)

    myTable = getMoneyTableUpdate(lastTime, 'MONEY_DATA');

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

app.get('/ekosim/timetable/update/:lastTimestamp', (req, res, next) => {

    var lastTime = [req.params.lastTimestamp];
    //console.log(lastTime)

    myTable = getMoneyTableUpdate(lastTime, 'TIME_DATA');

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




app.put('/ekosim/:parameterID', function (req, res) {

    var ParameterID = req.params.parameterID;
    var value = req.body.VALUE;
    //console.log(value);
    //console.log(ParameterID);


    if (!value || value === "") {
        res.status(500).send({ error: "Provide value" });
    }
    else {
        var idFound = false;

    }

    DBFunctions.insertFunction(ParameterID, value)
    res.send('Parameter ' + ParameterID + ' probably updated to value ' + value);

});
/*const port = process.env.port || 3000;
app.listen(3000, function () {


    console.log('Forst API running on port 3000');
});
*/

app.get("/", (req, res, next) => {
    console.log(__dirname+'/index.html');
    res.sendFile(__dirname+'/index.html');
    //res.json(["Tony","Lisa","Michael","Ginger","Food"]);
    
});

app.listen(8080, function () {


    console.log('Forst API running on port 3000');
    console.log(port);
});