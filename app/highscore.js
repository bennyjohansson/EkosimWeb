function populateTable(myData, table) {

    //Parsing API-data
    var JSONData = JSON.parse(myData).data;
    var elementValueStr = "";
    var elementValueNum = 0;

    JSONData.sort(function (a, b) {
        return b.GROWTH.toString().localeCompare(a.GROWTH.toString());
        //return a.GROWTH.toString() > b.GROWTH.toString();
    });

    var i = 1;

    for (let element of JSONData) {
        if (i <= 10) {
            let row = table.insertRow();
            let cell = row.insertCell();
            let text = document.createTextNode(i);
            cell.appendChild(text);
            for (key in element) {
                if (key != "key" && key != "ID") {
                    if(key == "GROWTH") {
                        elementValueStr = parseFloat(element[key]).toFixed(2).toString();
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