var express = require('express');
var app = express();
let DBFunctions = require('./DBConnection')
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Validation function to check if a country is valid
function isValidCountry(countryName) {
    const invalidPatterns = [
        /world/i,     // Contains "world" (e.g., "Bennyworld")
        /global/i,    // Contains "global"
        /system/i,    // Contains "system"
        /admin/i,     // Contains "admin"
        /users/i      // Contains "users"
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(countryName));
}

// Load environment configuration for authentication
require('dotenv').config();
const AuthRoutes = require('./routes/auth');
const { authConfig, validateAuthConfig } = require('./config/auth.js');


var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Production: Serve Vue build from modern/dist
// Development: This is skipped (Vite handles frontend)
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
    console.log('🚀 Production mode: Serving Vue app from /modern/dist');
    
    // Serve static assets from Vue build
    app.use(express.static(path.join(__dirname, '../modern/dist')));
    
    // For any non-API routes, serve the Vue app (SPA routing)
    app.get('*', (req, res, next) => {
        // Skip API routes - let them be handled by existing endpoints
        if (req.path.startsWith('/ekosim') || 
            req.path.startsWith('/api') || 
            req.path.startsWith('/getWorldTable') || 
            req.path.startsWith('/getHighScore')) {
            return next();
        }
        
        // Serve Vue app for all other routes
        res.sendFile(path.join(__dirname, '../modern/dist/index.html'));
    });
} else {
    console.log('🔧 Development mode: Vue app served by Vite proxy');
    
    // Original static file serving for development
    app.use(express.static('.'));
}

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

    var myPath = '../../ekosim/myDB/';
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

app.put('/ekosim/putCompanyParameter/:myCountry', function (req, res) {

    var ParameterID = req.body.PARAMETER;
    var value = req.body.VALUE;

    var myPath = '../../ekosim/myDB/';
    var myCountry = req.params.myCountry; // //
    var myDatabase = myPath.concat(myCountry);
    myDatabase = myDatabase.concat('.db');

    var myCompany = req.query.myCompany;


    //console.log(value);
    //console.log(ParameterID);


    if (!value || value === "") {
        res.status(500).send({ error: "Provide value" });
    }
    else {
        var idFound = false;

    }

    DBFunctions.insertCompanyParameter(myDatabase, myCompany, ParameterID, value)
    res.send('Parameter ' + ParameterID + ' probably updated to value ' + value);

});



app.get('/ekosim/read/:myCountry', (req, res, next) => {

    var myPath = '../../ekosim/myDB/';
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

    var myCountry = req.params.myCountry;
    
    // Validate country before processing
    if (!isValidCountry(myCountry)) {
        console.error(`Invalid country rejected: ${myCountry}`);
        return res.json({
            "message": "error",
            "data": [],
            "error": `Invalid country: ${myCountry}`
        });
    }
    
    var myPath = '../../ekosim/myDB/';
    var myDatabase = myPath.concat(myCountry);
    myDatabase = myDatabase.concat('.db');

    //myDatabase = '../../ekosim/myDB/Bennyland.db';

    // Validate that the country exists and has a valid database
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(myDatabase)) {
        console.error(`Database not found: ${myDatabase}`);
        return res.json({
            "message": "error",
            "data": [],
            "error": `Country ${myCountry} not found`
        });
    }

    console.log(myDatabase);
    myTable = getTable(myDatabase, 'PARAMETERS');


    var mytableJSON = myTable.then((result) => {
        //console.log(result[31]) // "Some User token"
        //return result[31];
        return res.json({
            "message": "success",
            "data": result
        })
    }).catch((error) => {
        console.error(`Error getting parameters for ${myCountry}:`, error);
        return res.json({
            "message": "error", 
            "data": [],
            "error": `No PARAMETERS table found for ${myCountry}`
        });
    });


    //console.log(mytableJSON)

});


app.get('/ekosim/getCompany/:myCountry', (req, res, next) => {

    var myCountry = req.params.myCountry;
    
    // Validate country before processing
    if (!isValidCountry(myCountry)) {
        console.error(`Invalid country rejected: ${myCountry}`);
        return res.json({
            "message": "error",
            "data": [],
            "error": `Invalid country: ${myCountry}`
        });
    }

    var myPath = '../../ekosim/myDB/';
    var myDatabase = myPath.concat(myCountry);
    myDatabase = myDatabase.concat('.db');

    var Company = req.query.myCompany;

    // Validate that the database exists
    const fs = require('fs');
    if (!fs.existsSync(myDatabase)) {
        console.error(`Database not found: ${myDatabase}`);
        return res.json({
            "message": "error",
            "data": [],
            "error": `Country ${myCountry} not found`
        });
    }

    myTable = getCompanyTable(myDatabase, 'COMPANY_TABLE', Company);

    //let db = new sqlite3.Database('/home/ec2-user/ekosimProject/myDB/ekosimDB.db', sqlite3.OPEN_READONLY, (err) => {
    var mytableJSON = myTable.then((result) => {
        //console.log(result[31]) // "Some User token"
        //return result[31];
        return res.json({
            "message": "success",
            "data": result
        })
    }).catch((error) => {
        console.error(`Error getting company data for ${myCountry}:`, error);
        return res.json({
            "message": "error", 
            "data": [],
            "error": `No COMPANY_TABLE found for ${myCountry}`
        });
    });
});



app.get('/ekosim/moneytable/update/:myCountry', (req, res, next) => {

    var myCountry = req.params.myCountry;
    
    // Validate country before processing
    if (!isValidCountry(myCountry)) {
        console.error(`Invalid country rejected: ${myCountry}`);
        return res.json({
            "message": "error",
            "data": [],
            "error": `Invalid country: ${myCountry}`
        });
    }

    var myPath = '../../ekosim/myDB/';
    var myDatabase = myPath.concat(myCountry);
    myDatabase = myDatabase.concat('.db');

    //myDatabase = '../../ekosim/myDB/Bennyland.db';

    var lastTime = req.query.timestamp;

    // Validate that the database exists
    const fs = require('fs');
    if (!fs.existsSync(myDatabase)) {
        console.error(`Database not found: ${myDatabase}`);
        return res.json({
            "message": "error",
            "data": [],
            "error": `Country ${myCountry} not found`
        });
    }

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
    }).catch((error) => {
        console.error(`Error getting money data for ${myCountry}:`, error);
        return res.json({
            "message": "error", 
            "data": [],
            "error": `No MONEY_DATA table found for ${myCountry}`
        });
    });


    //console.log(mytableJSON)

});

app.get('/ekosim/timetable/update/:myCountry', (req, res, next) => {

    var myPath = '../../ekosim/myDB/';
    var myCountry = req.params.myCountry; //'../../ekosim/myDB/Bennyland.db' //
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

app.get('/ekosim/companytable/update/:myCountry', (req, res, next) => {

    var myPath = '../../ekosim/myDB/';
    var myCountry = req.params.myCountry; //'../../ekosim/myDB/Bennyland.db' //
    var myDatabase = myPath.concat(myCountry);
    myDatabase = myDatabase.concat('.db');

    var lastTime = req.query.timestamp;
    var myCompany = req.query.myCompany;
    console.log(myCompany);
    console.log(lastTime);
    myTable = getCompanyTableUpdate(lastTime, myDatabase, myCompany, 'COMPANY_TABLE');

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

app.get('/ekosim/getHighScore/', (req, res, next) => {

    //var lastTime = [req.datab.lastTimestamp];
    console.log("HALLÅ ELLER I SERVER HIGH SCORE")

    myTable = getWorldTable('HIGH_SCORE');

    var mytableJSON = myTable.then((result) => {
        //console.log(result[31]) // "Some User token"
        //return result[31];
        return res.json({
            "message": "success",
            "data": result
        })
    });
    console.log(mytableJSON)

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


    // Get all available countries/cities by scanning database files
    app.get('/ekosim/getAvailableCountries', (req, res) => {
        const fs = require('fs');
        const path = require('path');
        
        try {
            const dbPath = '../../ekosim/myDB/';  // Match other endpoints
            const dbDir = path.resolve(__dirname, dbPath);
            
            // Check if directory exists
            if (!fs.existsSync(dbDir)) {
                console.error('Database directory not found:', dbDir);
                return res.status(500).json({
                    message: "error",
                    error: "Database directory not found"
                });
            }
            
            // Read all files in the directory first
            const files = fs.readdirSync(dbDir);
            
            // Filter to get only valid country database files
            const dbFiles = files.filter(file => 
                file.endsWith('.db') && 
                !file.startsWith('.') && 
                !file.includes('users.db') && // Exclude user authentication database
                !file.toLowerCase().includes('world') && // Exclude world class instances (e.g., Bennyworld)
                !file.toLowerCase().startsWith('global') && // Exclude global databases
                file.length > 3 && // Ensure it's not just ".db"
                fs.statSync(path.join(dbDir, file)).size > 0 // Exclude empty files
            );
            
            // Extract country names (remove .db extension)
            const countries = dbFiles.map(file => file.replace('.db', ''));
            
            console.log('Available countries found:', countries);
            
            res.json({
                message: "success",
                data: countries
            });
            
        } catch (error) {
            console.error('Error reading database directory:', error);
            res.status(500).json({
                message: "error", 
                error: error.message
            });
        }
    });

    // Initialize authentication system
    console.log('🔐 Initializing authentication system...');
    try {
        validateAuthConfig();
        const authRoutes = new AuthRoutes(authConfig);
        app.use('/api/auth', authRoutes.getRouter());
        console.log('✅ Authentication routes mounted at /api/auth');
    } catch (error) {
        console.error('❌ Failed to initialize authentication:', error.message);
        process.exit(1);
    }

    //8080
    app.listen(8080, function () {


        console.log('Forst API running on port 8080');
        console.log('🔐 Authentication endpoints available:');
        console.log('  POST /api/auth/register - Register new user');
        console.log('  POST /api/auth/login - User login');
        console.log('  GET  /api/auth/profile - Get user profile (protected)');
        console.log('  PUT  /api/auth/profile - Update profile (protected)');
        console.log('  POST /api/auth/verify - Verify JWT token');
        //console.log(port);
    });
