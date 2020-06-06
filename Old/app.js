const sqlite3 = require('sqlite3').verbose();

// open the database
var myTestSQL = function (callback) {

    var retDBObject = {}
    let db = new sqlite3.Database('/Users/bennyjohansson/Projects/ekosim/myDB/testDB.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the ekosim database.');
    });

    db.serialize(() => {
        db.each(`SELECT PARAMETER as parameter,
                      VALUE as value
               FROM PARAMETERS`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            //console.log(row.parameter + "\t" + row.value);
            retDBObject[row.parameter] = row.value;
            console.log(retDBObject);

        });

    });

    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });

};

//module.exports = myTestSQL;

myTestSQL();

var testJSONobj = function () {
    var testObj = {};

    testObj.key1 = 'value1';
    testObj.key2 = 'value2';
    var jsonStr = JSON.stringify(testObj);
    //console.log(jsonStr);
    return jsonStr //jQuery.parseJSON(testObj);

};

module.exports = {
    testJSONobj: testJSONobj,
    myTestSQL: myTestSQL
};

//testJSONobj();