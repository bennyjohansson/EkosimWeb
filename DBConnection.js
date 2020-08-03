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


var insertFunction = function (myDatabase, parameter, value) {
    //'./myDB/Bennyland.db'
    console.log(myDatabase);
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

// var getTable = function () {

//     var retDBObject = {}
//     let db = new sqlite3.Database('./myDB/Bennyland.db', sqlite3.OPEN_READONLY, (err) => {
//         if (err) {
//             console.error(err.message);
//         }
//         console.log('Connected to the ekosim database.');
//     });

//     db.all(`SELECT * FROM MONEY_DATA`, (err, rows) => {
//         if (err) {
//             console.error(err.message);
//         }
//         console.log(rows);
//         //retDBObject[row.parameter] = row.value;
//         //console.log(retDBObject);
//         return rows;
//     });


//     db.close((err) => {
//         if (err) {
//             console.error(err.message);
//         }
//         console.log('Close the database connection.');
//     });

// };

//open the database
// var myTestSQL = function () {

//     var retDBObject = {}
//     let db = new sqlite3.Database('./myDB/Bennyland.db', sqlite3.OPEN_READONLY, (err) => {
//         if (err) {
//             console.error(err.message);
//         }
//         console.log('Connected to the ekosim database.');
//     });

//     db.serialize(() => {
//         //db.each(`SELECT PARAMETER as parameter, VALUE as value FROM PARAMETERS`, (err, row) => {
//         db.each(`SELECT * FROM MONEY_DATA`, (err, row) => {
//             if (err) {
//                 console.error(err.message);
//             }
//             console.log(row);
//             //retDBObject[row.parameter] = row.value;
//             //console.log(retDBObject);
//             return retDBObject;
//         });

//     });

//     db.close((err) => {
//         if (err) {
//             console.error(err.message);
//         }
//         console.log('Close the database connection.');
//     });

// };

// var returnTable = function () {
//     return new Promise((resolve, reject) => {

//         const db = new sqlite3.Database('./myDB/Bennyland.db');
//         const queries = [];
//         db.each(`SELECT  * FROM PARAMETERS`, (err, row) => {
//             if (err) {
//                 reject(err); // optional: you might choose to swallow errors.
//             } else {
//                 queries.push(row); // accumulate the data
//             }
//         }, (err, n) => {
//             if (err) {
//                 reject(err); // optional: again, you might choose to swallow this error.
//             } else {
//                 console.log(queries);
//                 return resolve(queries);// resolve the promise
//                 //return queries.then(token => {return token})
//             }
//         });
//         // close the database connection
//         db.close((err) => {
//             if (err) {
//                 console.error(err.message);
//             }
//             console.log('Close the database connection.');
//         });
//     });
// }


// resolveReturnTable = function(table) { //database, table
//     return new Promise((resolve, reject) => {
//         let db = new sqlite3.Database('./myDB/Bennyland.db', sqlite3.OPEN_READONLY, (err) => {
//             if (err) {
//                 console.error(err.message);
//             }
//             console.log('Connected to the ekosim database.');
//         });
//         const queries = [];
//         db.each(`SELECT rowid as key, * FROM ${table}`, (err, row) => {
//         //db.each(`SELECT rowid as key, * FROM MONEY_DATA`, (err, row) => {
//             if (err) {
//                 reject(err); // optional: you might choose to swallow errors.
//             } else {
//                 queries.push(row); // accumulate the data
//             }
//         }, (err, n) => {
//             if (err) {
//                 reject(err); // optional: again, you might choose to swallow this error.
//             } else {
//                 resolve(queries); // resolve the promise
//             }
//         });
//     });
// }



//module.exports = myTestSQL;

//myRows = getTable();
//console.log(myRows);
// myTable = resolveReturnTable();

// myTable.then((result) => {
//     console.log(result[35]) // "Some User token"
//  });
//insertFunction('InterestRateMethod', 2);
//insertFunction('TargetInterestRate', 0.05);
//myTestSQL();
//let myTable =  await returnTable().then((queries) => {}, (err) => {
//    console.error(`Database error: ${err}`);
//  });
//console.log(myTable);


// var testJSONobj = function () {
//     var testObj = {};

//     testObj.key1 = 'value1';
//     testObj.key2 = 'value2';
//     var jsonStr = JSON.stringify(testObj);
//     //console.log(jsonStr);
//     return jsonStr //jQuery.parseJSON(testObj);

// };

module.exports = {
    //testJSONobj: testJSONobj,
    //myTestSQL: myTestSQL,
    insertFunction: insertFunction
};

//testJSONobj();