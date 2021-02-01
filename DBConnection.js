const sqlite3 = require('sqlite3').verbose();



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

        let db = new sqlite3.Database('./myDB/Bennyworld.db', sqlite3.OPEN_READONLY, (err) => {
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


module.exports = {
    //testJSONobj: testJSONobj,
    //myTestSQL: myTestSQL,
    insertFunction: insertFunction,
    insertCompanyParameter: insertCompanyParameter
};
