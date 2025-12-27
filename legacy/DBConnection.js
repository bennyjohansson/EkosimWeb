const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

// PostgreSQL connection pool
const pgPool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'ekosim',
    user: process.env.POSTGRES_USER || 'ekosim',
    password: process.env.POSTGRES_PASSWORD || 'secure_dev_password_2025!',
    max: 10,
    idleTimeoutMillis: 30000,
});

// Test connection on startup
pgPool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ PostgreSQL connection error:', err.message);
    } else {
        console.log('✅ PostgreSQL connected successfully at:', res.rows[0].now);
    }
});



getMoneyTableUpdate = function (lastTime, myDatabase, table) { //database, table
    console.log(myDatabase);
    return new Promise((resolve, reject) => {
        //let db = new sqlite3.Database('/home/ec2-user/ekosimProject/myDB/Bennyland.db', sqlite3.OPEN_READONLY, (err) => {
        //'./myDB/Bennyland.db'

        let db = new sqlite3.Database(myDatabase, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the ekosim database.');
        });
        const queries = [];
        //console.log(`SELECT rowid as key, * FROM ${table} WHERE TIME > ${lastTime}`);
        //sql = 'SELECT rowid as key, * FROM ${table} WHERE TIME > ${lastTime}'
        //db.each(sql, (err, row) => {
        sql = 'SELECT rowid as key, * FROM '
        sql = sql.concat(table);
        sql = sql.concat(" WHERE TIME > " + lastTime);
        console.log(sql)
    
        //db.each(`SELECT rowid as key, * FROM ${table} WHERE TIME => ${lastTime}`, (err, row) => {
        db.each(sql, (err, row) => {
                //db.each(`SELECT rowid as key, * FROM MONEY_DATA`, (err, row) => {
            if (err) {
                console.log("We have an error here");
                reject(err); // optional: you might choose to swallow errors.
            } else {
                console.log("No errors here")
                queries.push(row); // accumulate the data
            }
        }, (err, n) => {
            if (err) {
                console.log("We have an error here number two" + err);
                reject(err); // optional: again, you might choose to swallow this error.
            } else {
                console.log("No errors here part two")
                resolve(queries); // resolve the promise
            }
        });
        // close the database connection
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}

getCompanyTableUpdate = function (lastTime, myDatabase, myCompany, table) { //database, table
    console.log(myDatabase);
    return new Promise((resolve, reject) => {
        //let db = new sqlite3.Database('/home/ec2-user/ekosimProject/myDB/Bennyland.db', sqlite3.OPEN_READONLY, (err) => {
        //'./myDB/Bennyland.db'

        let db = new sqlite3.Database(myDatabase, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the ekosim database.');
        });
        const queries = [];
        
        sql = 'SELECT rowid as key, * FROM '
        sql = sql.concat(table);
        sql = sql.concat(' WHERE NAME = ');
        sql = sql.concat("'");
        sql = sql.concat(myCompany);
        sql = sql.concat("'");
        sql = sql.concat(" AND TIME_STAMP > " + lastTime);
        

        console.log(sql); //`SELECT rowid as key, * FROM ${table} WHERE NAME = ${myCompany} AND TIME > ${lastTime}`)
        //db.each(`SELECT rowid as key, * FROM ${table} WHERE NAME = ${myCompany} AND TIME > ${lastTime}`, (err, row) => {
        db.each(sql, (err, row) => {
            //db.each(`SELECT rowid as key, * FROM MONEY_DATA`, (err, row) => {
            if (err) {
                reject(err); // optional: you might choose to swallow errors.
            } else {
                queries.push(row); // accumulate the data
            }
        }, (err, n) => {
            if (err) {
                reject(err); // optional: again, you might choose to swallow this error.
            } else {
                resolve(queries); // resolve the promise
            }
        });
        // close the database connection
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}

getWorldTable = function (table) { //database, table
    return new Promise((resolve, reject) => {

        let db = new sqlite3.Database('../../ekosim/myDB/Bennyworld.db', sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the Bennyworld database.');
        });
        const queries = [];
        console.log(`SELECT rowid as key, * FROM ${table} `);
        db.each(`SELECT rowid as key, * FROM ${table} `, (err, row) => {
            //db.each(`SELECT rowid as key, * FROM MONEY_DATA`, (err, row) => {
            if (err) {
                reject(err); // optional: you might choose to swallow errors.
            } else {
                queries.push(row); // accumulate the data
            }
        }, (err, n) => {
            if (err) {
                reject(err); // optional: again, you might choose to swallow this error.
            } else {
                resolve(queries); // resolve the promise
            }
        });
        // close the database connection
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}



getTable = function (myDatabase, table) { //database, table
    console.log(myDatabase);
    return new Promise((resolve, reject) => {
        //let db = new sqlite3.Database('/home/ec2-user/ekosimProject/myDB/Bennyland.db', sqlite3.OPEN_READONLY, (err) => {
        //'./myDB/Bennyland.db'

        let db = new sqlite3.Database(myDatabase, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the ekosim database.');
        });
        const queries = [];
        //console.log(`SELECT rowid as key, * FROM ${table} WHERE TIME > ${lastTime}`);
        db.each(`SELECT rowid as key, * FROM ${table}`, (err, row) => {
            //db.each(`SELECT rowid as key, * FROM MONEY_DATA`, (err, row) => {
            if (err) {
                reject(err); // optional: you might choose to swallow errors.
            } else {
                queries.push(row); // accumulate the data
            }
        }, (err, n) => {
            if (err) {
                reject(err); // optional: again, you might choose to swallow this error.
            } else {
                resolve(queries); // resolve the promise
            }
        });
        // close the database connection
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}

getCompanyTable = function (myDatabase, table, company) { //database, table
    console.log(myDatabase);
    return new Promise((resolve, reject) => {
        //let db = new sqlite3.Database('/home/ec2-user/ekosimProject/myDB/Bennyland.db', sqlite3.OPEN_READONLY, (err) => {
        //'./myDB/Bennyland.db'

        let db = new sqlite3.Database(myDatabase, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the ekosim database.');
        });
        const queries = [];
        //data = [table, company];
        myDatabase = myDatabase.concat('.db');
        sql = 'SELECT rowid as key, * FROM '
        sql = sql.concat(table);
        sql = sql.concat(' WHERE NAME = ');
        sql = sql.concat("'");
        sql = sql.concat(company);
        sql = sql.concat("'");
        sql = sql.concat(" AND TIME_STAMP = (SELECT MAX(TIME_STAMP) FROM COMPANY_TABLE)");

        console.log(sql);
        //db.each(`SELECT rowid as key, * FROM ${table} WHERE NAME = ${company}`, (err, row) => {
        db.each(sql, (err, row) => {
            //db.each(`SELECT rowid as key, * FROM MONEY_DATA`, (err, row) => {
            if (err) {
                reject(err); // optional: you might choose to swallow errors.
            } else {
                queries.push(row); // accumulate the data
            }
        }, (err, n) => {
            if (err) {
                reject(err); // optional: again, you might choose to swallow this error.
            } else {
                resolve(queries); // resolve the promise
            }
        });
        // close the database connection
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}


var insertFunction = function (myDatabase, parameter, value) {
    //'./myDB/Bennyland.db'
    console.log(myDatabase);
    
    // Extract city name from database path (e.g., '../../ekosim/myDB/Bennyland.db' -> 'Bennyland')
    let cityName = '';
    const pathParts = myDatabase.split('/');
    const dbFile = pathParts[pathParts.length - 1];
    if (dbFile.endsWith('.db')) {
        cityName = dbFile.replace('.db', '');
    }
    
    // Update PostgreSQL first
    if (cityName) {
        pgPool.query(
            `INSERT INTO parameters (city_name, parameter, value) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (city_name, parameter) 
             DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
            [cityName, parameter, parseFloat(value)]
        ).then(() => {
            console.log(`PostgreSQL: Parameter ${parameter} updated to ${value} for ${cityName}`);
        }).catch(err => {
            console.error('PostgreSQL parameter update error:', err.message);
        });
    }

    // Update SQLite for backward compatibility
    let db = new sqlite3.Database(myDatabase, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the ekosim database for insert functions.');
    });

    var data = [value, parameter];
    let sql = "UPDATE PARAMETERS SET VALUE = ? WHERE PARAMETER = ?";

    db.run(sql, data, function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);

    });

    // close the database connection
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });

}

var insertCompanyParameter = function (myDatabase, company, parameter, value) {
    //'./myDB/Bennyland.db'
    console.log(myDatabase);
    // if(myDatabase == './myDB/Bennyland.db') {

    //     console.log('Eureka - the string is the same');
    //}

    let db = new sqlite3.Database(myDatabase, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the ekosim database for insert functions.');
    });

    var data = [parameter, value, company];
    console.log(data)
    //let sql = "UPDATE COMPANY_TABLE SET ? = ? WHERE NAME = ?";
    let sql = "UPDATE COMPANY_TABLE SET "
    sql = sql.concat(parameter);
    sql = sql.concat(' = ');
    sql = sql.concat("'");
    sql = sql.concat(value);
    sql = sql.concat("'");

    //If all companies selected, don't specify any company
    if (company != "*") {
        sql = sql.concat(' WHERE NAME = ');
        sql = sql.concat("'");
        sql = sql.concat(company);
        sql = sql.concat("'");
    }


    console.log(sql)
    db.run(sql, function (err) {
        //db.run(sql, data, function (err) {

        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);

    });

    // close the database connection
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });

}

// PostgreSQL parameter update function
var insertParameterPG = async function (cityName, parameter, value) {
    const client = await pgPool.connect();
    try {
        const sql = `
            INSERT INTO parameters (city_name, parameter, value)
            VALUES ($1, $2, $3)
            ON CONFLICT (city_name, parameter)
            DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
        `;
        await client.query(sql, [cityName, parameter, value]);
        console.log(`[PostgreSQL] Updated parameter ${parameter} = ${value} for ${cityName}`);
        return 0;
    } catch (err) {
        console.error(`[PostgreSQL] Failed to update parameter ${parameter}:`, err);
        return 1;
    } finally {
        client.release();
    }
};


module.exports = {
    //testJSONobj: testJSONobj,
    //myTestSQL: myTestSQL,
    insertFunction: insertFunction,
    insertCompanyParameter: insertCompanyParameter,
    insertParameterPG: insertParameterPG
};
