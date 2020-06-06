var gradientStroke = 'rgba(0, 119, 220, 0.6)',
    gradientFill = 'rgba(0, 119, 220, 0.4)';

var ctx = document.getElementById('chart').getContext("2d");

var myChart = new Chart(ctx, {
   type: 'line',
   data: {
      labels: [1,2,3,4,5,6,7],
      datasets: [{
         label: "Data",
         data: [50, 80, 130, 65, 100, 66, 86],
      }]
   },
   options: {
      responsive: false,
      legend: {
         position: "top"
      },
   }
});

//for (i =0; i<1; i++){
    setInterval(function() {
    addData(myChart, [45, 50, 30, 34, 61, 53, 42], 0);
    }, 2000);

//}

function addData(chart, data, datasetIndex) {
    var chartData = chart.data;
    var seriesLength = chartData.labels.length
    console.log(chartData.datasets[datasetIndex].data.concat([23,34,45,56]))
    chartData.datasets[datasetIndex].data = chartData.datasets[datasetIndex].data.concat([23,34,45,56]); //Math.floor((Math.random() * 30) + 1));
    chartData.labels = chartData.labels.concat([8,9,10,11]);//chartData.labels[seriesLength - 1]);
   chart.update();
}