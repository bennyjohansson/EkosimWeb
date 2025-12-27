// Load environment configuration FIRST, before any other requires
// Load in priority order: local .env -> Infrastructure .env -> parent .env
require('dotenv').config({ path: '.env' }); // Local legacy/.env
require('dotenv').config({ path: '../../EkoSim-Infrastructure/.env' }); // Shared Infrastructure config
require('dotenv').config({ path: '../.env', override: false }); // Parent EkoWeb/.env (if exists)

var express = require('express');
var app = express();
let DBFunctions = require('./DBConnection')
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Simulation service for database operations
const SimulationService = require('./services/SimulationService');
const simulationService = new SimulationService();

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
const AuthRoutes = require('./routes/auth');
const { authConfig, validateAuthConfig } = require('./config/auth.js');
const AuthMiddleware = require('./middleware/AuthMiddleware');

// Initialize authentication system BEFORE route definitions
let authMiddleware = null;
console.log('🔐 Initializing authentication system...');
try {
    validateAuthConfig();
    authMiddleware = new AuthMiddleware(authConfig);
    console.log('✅ Auth middleware initialized');
} catch (error) {
    console.error('❌ Failed to initialize authentication:', error.message);
    process.exit(1);
}


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

app.put('/ekosim/put/:myCountry',
    authMiddleware ? authMiddleware.verifyToken() : (req, res, next) => next(),
    authMiddleware ? authMiddleware.requireCountryAccess() : (req, res, next) => next(),
    authMiddleware ? authMiddleware.requireWriteAccess() : (req, res, next) => next(),
    async function (req, res) {

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

        // Update both SQLite (for web charts) and PostgreSQL (for simulation)
        DBFunctions.insertFunction(myDatabase, ParameterID, value);
        await DBFunctions.insertParameterPG(myCountry, ParameterID, value);
        
        res.send('Parameter ' + ParameterID + ' updated to value ' + value + ' in both SQLite and PostgreSQL');

    });

app.put('/ekosim/putCompanyParameter/:myCountry',
    authMiddleware ? authMiddleware.verifyToken() : (req, res, next) => next(),
    authMiddleware ? authMiddleware.requireCountryAccess() : (req, res, next) => next(),
    authMiddleware ? authMiddleware.requireWriteAccess() : (req, res, next) => next(),
    function (req, res) {

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



app.get('/ekosim/read/:myCountry',
    authMiddleware ? authMiddleware.optionalAuth() : (req, res, next) => next(),
    (req, res, next) => {
        var myCountry = req.params.myCountry;

        // Check access if user is authenticated
        if (req.user && authMiddleware) {
            authMiddleware.userService.checkUserCountryAccess(req.user.id, myCountry)
                .then(access => {
                    if (!access.hasAccess) {
                        return res.status(403).json({
                            "message": "error",
                            "error": `Access denied to country: ${myCountry}`
                        });
                    }
                    // Continue with request
                    next();
                })
                .catch(error => {
                    console.error('Country access check failed:', error);
                    return res.status(500).json({
                        "message": "error",
                        "error": "Failed to verify country access"
                    });
                });
        } else {
            // No authentication, allow but log the request
            console.log(`📖 Unauthenticated read access to ${myCountry}`);
            next();
        }
    }, async (req, res) => {
        console.log("📋 PARAMETER READ REQUEST - Using SimulationService (PostgreSQL)");

        try {
            const cityName = req.params.myCountry;
            const parameterID = req.query.parameterID;

            // Validate country name
            if (!isValidCountry(cityName)) {
                console.error(`Invalid country rejected: ${cityName}`);
                return res.json({
                    "message": "error",
                    "error": `Invalid country: ${cityName}`
                });
            }

            if (!parameterID) {
                return res.status(400).json({
                    "message": "error",
                    "error": "Missing parameterID query parameter"
                });
            }

            // Use SimulationService to get parameter from PostgreSQL
            const data = await simulationService.getParameter(cityName, parameterID);

            if (!data) {
                return res.json({
                    "message": "success",
                    "data": null,
                    "info": `Parameter ${parameterID} not found for ${cityName}`
                });
            }

            console.log(`✅ Parameter ${parameterID} retrieved for ${cityName}: ${data.VALUE}`);

            return res.json({
                "message": "success",
                "data": data
            });

        } catch (error) {
            console.error(`❌ Error getting parameter:`, error);
            return res.json({
                "message": "error",
                "error": `Failed to get parameter: ${error.message}`
            });
        }
    });

app.get('/ekosim/getAllParameters/:myCountry', async (req, res, next) => {
    console.log("📋 GET ALL PARAMETERS REQUEST - Using SimulationService (PostgreSQL)");

    try {
        const myCountry = req.params.myCountry;

        // Validate country before processing
        if (!isValidCountry(myCountry)) {
            console.error(`Invalid country rejected: ${myCountry}`);
            return res.json({
                "message": "error",
                "data": [],
                "error": `Invalid country: ${myCountry}`
            });
        }

        // Use SimulationService to get all parameters from PostgreSQL
        const data = await simulationService.getAllParameters(myCountry);

        console.log(`✅ All parameters retrieved for ${myCountry}: ${data.length} parameters`);

        return res.json({
            "message": "success",
            "data": data
        });

    } catch (error) {
        console.error(`❌ Error getting parameters for ${myCountry}:`, error);
        return res.json({
            "message": "error",
            "data": [],
            "error": `Failed to get parameters: ${error.message}`
        });
    }
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



app.get('/ekosim/moneytable/update/:myCountry', async (req, res, next) => {
    console.log("💰 MONEY DATA REQUEST - Using SimulationService");

    try {
        const cityName = req.params.myCountry;
        const lastTime = parseInt(req.query.timestamp) || 0;

        // Validate country name
        if (!isValidCountry(cityName)) {
            console.error(`Invalid country rejected: ${cityName}`);
            return res.json({
                "message": "error",
                "data": [],
                "error": `Invalid country: ${cityName}`
            });
        }

        // Use SimulationService to get money data from PostgreSQL
        const data = await simulationService.getMoneyData(cityName, lastTime);

        console.log(`💰 Retrieved money data for ${cityName}: ${data.length} records since time ${lastTime}`);
        console.log(`✅ Money data sent for ${cityName}: ${data.length} records`);

        return res.json({
            "message": "success",
            "data": data
        });

    } catch (error) {
        console.error(`❌ Error getting money data:`, error);
        return res.json({
            "message": "error",
            "data": [],
            "error": `Failed to get money data: ${error.message}`
        });
    }
});

app.get('/ekosim/timetable/update/:myCountry', async (req, res, next) => {
    console.log("📊 TIME DATA REQUEST - Using SimulationService");

    try {
        const cityName = req.params.myCountry;
        const lastTime = parseInt(req.query.timestamp) || 0;

        // Validate country name
        if (!isValidCountry(cityName)) {
            console.error(`Invalid country rejected: ${cityName}`);
            return res.json({
                "message": "error",
                "data": [],
                "error": `Invalid country: ${cityName}`
            });
        }

        const timeData = await simulationService.getTimeData(cityName, lastTime);

        res.json({
            "message": "success",
            "data": timeData
        });

        console.log(`✅ Time data sent for ${cityName}: ${timeData.length} records`);

    } catch (error) {
        console.error('❌ Failed to get time data:', error.message);
        res.status(500).json({
            "message": "error",
            "error": `Failed to retrieve time data: ${error.message}`
        });
    }
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

app.get('/ekosim/worldtable/', async (req, res, next) => {
    console.log("🌍 WORLD TABLE REQUEST - Using new SimulationService");

    try {
        const worldTableData = await simulationService.getWorldTable('WORLD_TABLE');

        res.json({
            "message": "success",
            "data": worldTableData
        });

        console.log(`✅ World table data sent: ${worldTableData.length} records`);

    } catch (error) {
        console.error('❌ Failed to get world table data:', error.message);
        res.status(500).json({
            "message": "error",
            "error": "Failed to retrieve world table data"
        });
    }
});

app.get('/ekosim/getHighScore/', async (req, res, next) => {
    console.log("📈 HIGH SCORE REQUEST - Using new SimulationService");

    try {
        const highScoreData = await simulationService.getHighScore();

        res.json({
            "message": "success",
            "data": highScoreData
        });

        console.log(`✅ Highscore data sent: ${highScoreData.length} records`);

    } catch (error) {
        console.error('❌ Failed to get highscore data:', error.message);
        res.status(500).json({
            "message": "error",
            "error": "Failed to retrieve highscore data"
        });
    }
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

// Mount authentication routes
try {
    const authRoutes = new AuthRoutes(authConfig);
    app.use('/api/auth', authRoutes.getRouter());
    console.log('✅ Authentication routes mounted at /api/auth');
} catch (error) {
    console.error('❌ Failed to mount authentication routes:', error.message);
}

//8080
const PORT = process.env.PORT || 8080;

// Health check endpoint for Docker
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

app.listen(PORT, function () {


    console.log(`Forst API running on port ${PORT}`);
    console.log('🔐 Authentication endpoints available:');
    console.log('  POST /api/auth/register - Register new user');
    console.log('  POST /api/auth/login - User login');
    console.log('  GET  /api/auth/profile - Get user profile (protected)');
    console.log('  PUT  /api/auth/profile - Update profile (protected)');
    console.log('  POST /api/auth/verify - Verify JWT token');
    console.log('  GET  /health - Health check endpoint');
    //console.log(port);
});
