const sqlite3 = require('sqlite3').verbose();



getMoneyTableUpdate = function(lastTime, myDatabase, table) { //database, table
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
        db.each(`SELECT rowid as key, * FROM ${table} WHERE TIME > ${lastTime}`, (err, row) => {
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

getWorldTable = function(table) { //database, table
    return new Promise((resolve, reject) => {

        let db = new sqlite3.Database('./myDB/Bennyworld.db', sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the Bennyworld database.');
        });
        const queries = [];
        //console.log(`SELECT rowid as key, * FROM ${table} WHERE TIME > ${lastTime}`);
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

getTable = function(myDatabase, table) { //database, table
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

getCompanyTable = function(myDatabase, table, company) { //database, table
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
        sql = `SELECT rowid as key, * FROM ${table} WHERE NAME = ${company}`;
        console.log(sql);
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
    // if(myDatabase == './myDB/Bennyland.db') {

    //     console.log('Eureka - the string is the same');
    //}

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


module.exports = {
    //testJSONobj: testJSONobj,
    //myTestSQL: myTestSQL,
    insertFunction: insertFunction
};
