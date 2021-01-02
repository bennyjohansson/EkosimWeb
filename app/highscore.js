function populateTable(myData, table) {

    //Parsing API-data
    var JSONData = JSON.parse(myData).data;
    var elementValueStr = "";

    //ADDING RANKING COLUMNS
    JSONData = addHighScoreRank(JSONData, 1 / 3, 1 / 3, 1 / 3)

    // SORTING DATA
    JSONData.sort(function (a, b) {
        //return b.GROWTH.toString().localeCompare(a.GROWTH.toString());
        return a.TOTrank-b.TOTrank;
    });


    //POPULATING TABLE
    var i = 1;
    for (let element of JSONData) {
        if (i <= 100) {
            let row = table.insertRow();
            let cell = row.insertCell();
            let text = document.createTextNode(element["TOTrank"]);
            cell.appendChild(text);
            for (key in element) {
                if (key != "key" && key != "ID") { // && key != "GROWTHrank" && key != "PALMArank" && key != "ENVrank" && key != "TOTscore" && key != "TOTrank") { //&& key != "GROWTHthrank" && key != "PALMArank" && key != "ENVrank"
                    if (key == "GROWTH") {
                        elementValueStr = (parseFloat(element[key]) * 100).toFixed(2).toString() + "%";
                        //elementValueStr = elementValueNum.toString();
                    }
                    else {
                        elementValueStr = element[key];
                    }
                    let cell = row.insertCell();
                    let text = document.createTextNode(elementValueStr);
                    cell.appendChild(text);
                }
            }
        }
        i++;
    }
}

function addHighScoreRank(myData, growthweight, palmaweight, envweight) {


    //ADDING GROWTH-RANK
    myData.sort(function (a, b) {
        //return b.GROWTH.toString().localeCompare(a.GROWTH.toString());
        return b.GROWTH-a.GROWTH;
    });


    var growthrank = 1;
    for (var i = 0; i < myData.length; i++) {
        if (i > 0 && myData[i].GROWTH.toString() < myData[i - 1].GROWTH.toString()) {
            growthrank++;
        }
        myData[i].GROWTHrank = growthrank;
    }

    //ADDING PALMA-RANK
    myData.sort(function (a, b) {
        //return b.PALMA.toString().localeCompare(a.PALMA.toString());
        return a.PALMA-b.PALMA;
    });


    var palmarank = 1;
    for (var i = 0; i < myData.length; i++) {
        if (i > 0 && myData[i].PALMA.toString() > myData[i - 1].PALMA.toString()) {
            palmarank++;
        }
        myData[i].PALMArank = palmarank;
    }

    //console.log(myData);

    //ADDING ENRIRONMENT-RANK
    myData.sort(function (a, b) {
        //return a.ENV_IMP.toString().localeCompare(b.ENV_IMP.toString());
        return a.ENV_IMP-b.ENV_IMP;
    });


    var envrank = 1;
    for (var i = 0; i < myData.length; i++) {
        if (i > 0 && myData[i].ENV_IMP.toString() > myData[i - 1].ENV_IMP.toString()) {
            envrank++;
        }
        myData[i].ENVrank = envrank;
    }

    //ADDING WEIGHTED score
    for (var i = 0; i < myData.length; i++) {
        if (i => 0) {
            myData[i].TOTscore = (growthweight * myData[i].GROWTHrank + palmaweight * myData[i].PALMArank + envweight * myData[i].ENVrank).toFixed(2);
            //if(myData.ENV_IMP == tempvar) {
            //}
        }
    }
    //console.log(myData);

    //ADDING TOTAL-RANK
    myData.sort(function (a, b) {
        //return a.TOTscore.toString().localeCompare(b.TOTscore.toString());
        return a.TOTscore-b.TOTscore;
    });

    

    var totrank = 1;
    for (var i = 0; i < myData.length; i++) {
        if (i > 0 && myData[i].TOTscore.toString() > myData[i - 1].TOTscore.toString()) {
            totrank++;
        }
        myData[i].TOTrank = totrank;
    }


    return myData;
}



function populateHighScoreTable(myHighScoreTable, myWorld, mycallback) {

    var url = 'http://ekosimweb-env.eba-66jamvpz.us-east-2.elasticbeanstalk.com/ekosim/getHighScore/';
    //url = url.concat(myWorld);

    //console.log(url);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        //console.log(xhr.readyState);
        if (xhr.readyState == 4) { //XMLHttpRequest.DONE
            var response = xhr.responseText;
            //console.log("response: " + response); //Correctly prints JSON content to console

            // call it here
            mycallback(response, myHighScoreTable);
        }
    }
    xhr.send(null);

};


let table = document.querySelector("table");

populateHighScoreTable(table, "Bennyworld", populateTable);